import React, { useState, useEffect } from 'react';
import { useDevices } from '@/context/DeviceContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  Lock,
  Phone,
  ArrowLeft,
  Smartphone,
  Shield,
  Settings2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Wifi, Loader2 } from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { UpdateModal } from '@/components/common/UpdateModal';

import QRScannerModal from '@/components/mobile/QRScannerModal';
import PermissionsWizard from '@/components/mobile/PermissionsWizard';
import { useToast } from '@/hooks/use-toast';

import { Preferences } from '@capacitor/preferences';

const MobileClient: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const { getDeviceById, fetchDeviceById, devices, baseUrl, setBaseUrl } = useDevices();
  const navigate = useNavigate();
  const [inputDeviceId, setInputDeviceId] = useState('');
  const device = deviceId ? getDeviceById(deviceId) : null;
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(baseUrl);

  // Auto-login from Provisioning Storage
  useEffect(() => {
    const timer = setTimeout(() => {
      const checkStoredIdentity = async () => {
        if (deviceId) return; // Already have ID from URL

        try {
          const { value: storedId } = await Preferences.get({ key: 'deviceId' });
          if (storedId) {
            console.log('Found provisioned Device ID:', storedId);
            navigate(`/mobile/${storedId}`);
          }
        } catch (err) {
          console.error('Error reading preferences:', err);
        }
      };

      checkStoredIdentity();
    }, 3000); // Wait 3s for system to stabilize

    return () => clearTimeout(timer);
  }, [deviceId, navigate]);

  useEffect(() => {
    console.log('MobileClient Effect - deviceId:', deviceId, 'device exists:', !!device, 'loading:', loading);
    if (deviceId && !device && !loading) {
      console.log('Device missing from context, attempting fetch for:', deviceId);
      setLoading(true);
      fetchDeviceById(deviceId)
        .then((fetched) => {
          console.log('Fetch result for', deviceId, ':', fetched ? 'Success' : 'Failed');
        })
        .finally(() => setLoading(false));
    }
  }, [deviceId, device]);
  const [tapCount, setTapCount] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showWiFiSetup, setShowWiFiSetup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { addDevice, updateDevice, updateLocation } = useDevices();
  const { toast } = useToast();

  const handleEnterpriseSetupTrigger = () => {
    setShowWiFiSetup(true);
  };

  const handleConnectWiFi = async () => {
    setIsDownloading(true);
    // Simulate downloading QR reader software
    await new Promise(r => setTimeout(r, 2000));
    setIsDownloading(false);
    setShowWiFiSetup(false);
    setShowScanner(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tapCount > 0) {
      timer = setTimeout(() => setTapCount(0), 1500); // 1.5s window
    }
    if (tapCount >= 6) {
      setShowScanner(true);
      setShowWiFiSetup(true);
      setTapCount(0);
    }
    return () => clearTimeout(timer);
  }, [tapCount]);

  // Check for permissions
  useEffect(() => {
    if (device && !device.permissionsGranted) {
      setShowPermissions(true);
    }
  }, [device]);

  // Enforce Kiosk/Lock Task Mode when Locked
  useEffect(() => {
    const manageLockState = async () => {
      if (!device) return;

      try {
        const { registerPlugin } = await import('@capacitor/core');
        const WipeDevice = registerPlugin('WipeDevice');

        if (device.isLocked) {
          console.log("Device LOCKED: Enforcing Kiosk Mode");
          // @ts-ignore
          await WipeDevice.enforceDeviceRestrictions(); // Ensure whitelist
          // @ts-ignore
          await WipeDevice.startLockTaskMode(); // Pin screen
        } else {
          console.log("Device ACTIVE: Releasing Kiosk Mode");
          // @ts-ignore
          await WipeDevice.stopLockTaskMode(); // Unpin screen
        }
      } catch (e) {
        console.error("Lock State Management Failed:", e);
      }
    };

    manageLockState();
  }, [device?.isLocked]);

  // Location Tracking Simulation
  useEffect(() => {
    if (device?.isTracking) {
      const trackInterval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateLocation(device.id, position.coords.latitude, position.coords.longitude);
            },
            (error) => {
              console.error("Error getting location", error);
            }
          )
        }
      }, 5000); // Update every 5 seconds
      return () => clearInterval(trackInterval);
    }
  }, [device?.isTracking, device?.id]);

  /* 
     State for App Persistence & Hidden Mode 
     - isHidden: Simulates app running in background service mode
     - isUninstalling: Triggered when admin deletes device from backend
  */
  const [isHidden, setIsHidden] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);

  // HEARTBEAT & TELEMETRY
  useEffect(() => {
    if (device && isHidden && !isUninstalling) {
      const heartbeat = setInterval(async () => {
        try {
          // 1. Fetch Command state
          const fetchedDevice = await fetchDeviceById(device.id);

          if (!fetchedDevice) {
            setIsUninstalling(true);
            toast({ title: "Admin Removed Device", description: "Releasing device control...", variant: "destructive" });
            try {
              const { registerPlugin } = await import('@capacitor/core');
              const WipeDevice = registerPlugin('WipeDevice');
              // @ts-ignore
              await WipeDevice.removeDeviceOwner();
            } catch (e) { console.error("Auto-release failed", e); }

            setTimeout(() => {
              setIsHidden(false);
              setIsUninstalling(false);
              navigate('/');
              toast({ title: "Device Unlinked", description: "You can now uninstall the application." });
            }, 3000);
            return;
          }

          // 2. Handle Actions
          if (fetchedDevice.wipeRequested) {
            console.log("WIPE COMMAND RECEIVED...");
            toast({ title: "Security Alert", description: "Remote Wipe Initiated.", variant: "destructive" });
            setTimeout(async () => {
              try {
                const { registerPlugin } = await import('@capacitor/core');
                const WipeDevice = registerPlugin('WipeDevice');
                // @ts-ignore
                await WipeDevice.wipe();
              } catch (e) {
                console.error("Wipe failed:", e);
                setIsUninstalling(true); setIsHidden(false); navigate('/');
              }
            }, 2000);
          } else if (fetchedDevice.releaseRequested) {
            console.log("RELEASE COMMAND RECEIVED...");
            toast({ title: "Congratulations!", description: "Loan paid successfully." });
            setTimeout(async () => {
              try {
                const { registerPlugin } = await import('@capacitor/core');
                const WipeDevice = registerPlugin('WipeDevice');
                // @ts-ignore
                await WipeDevice.removeDeviceOwner();
                setIsHidden(false); setIsUninstalling(true); navigate('/');
                toast({ title: "Device Unlocked Forever", description: "You can now uninstall this application." });
              } catch (e) { console.error("Release failed:", e); }
            }, 2000);
          }

          // 3. Send Telemetry
          try {
            const { Device: CapDevice } = await import('@capacitor/device');
            const { Network: CapNetwork } = await import('@capacitor/network');
            const { registerPlugin } = await import('@capacitor/core');
            const WipeDevice = registerPlugin('WipeDevice');

            const battery = await CapDevice.getBatteryInfo();
            const network = await CapNetwork.getStatus();
            const info = await CapDevice.getInfo();
            // @ts-ignore
            const sim = await WipeDevice.getSimInfo();

            await fetch(`${baseUrl}/api/devices/${device.id}/telemetry`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                batteryLevel: Math.round((battery.batteryLevel || 0) * 100),
                networkType: network.connectionType,
                simCarrier: sim.carrier,
                androidVersion: info.osVersion,
                lastSeen: new Date()
              })
            });
          } catch (e) { console.error("Telemetry update failed", e); }

        } catch (e) { console.error("Heartbeat failed", e); }
      }, 10000); // Run every 10 seconds

      return () => clearInterval(heartbeat);
    }
  }, [device, isHidden, isUninstalling, baseUrl]);

  const handlePermissionsComplete = () => {
    if (device) {
      updateDevice(device.id, { permissionsGranted: true });
      setShowPermissions(false);

      // Enter "Hidden" Service Mode
      setIsHidden(true);

      toast({
        title: "Setup Complete",
        description: "App is now running as a hidden system service.",
      });
    }
  };

  const handleLogoTap = () => {
    setTapCount(prev => prev + 1);
  };

  const handleScanSuccess = async (data: any) => {
    console.log('Scan Successful! Data:', data);
    if (data && (data.id || data.serverUrl)) {
      setLoading(true);
      try {
        // If the QR contains a specific server URL, update our base URL first
        if (data.serverUrl) {
          console.log('Updating Server URL from scan:', data.serverUrl);
          await setBaseUrl(data.serverUrl);
        }

        const idToFetch = data.id || deviceId;
        if (!idToFetch) {
          toast({ title: "Invalid Scan", description: "No Device ID found in QR.", variant: "destructive" });
          return;
        }

        const existing = await fetchDeviceById(idToFetch);
        console.log('Fetch after scan result:', existing);

        if (existing) {
          toast({
            title: "Device Connected",
            description: `Successfully linked to ${existing.customerName}`
          });
          navigate(`/mobile/${existing.id}`);
        } else {
          toast({
            title: "Connection Failed",
            description: "Device record not found on server.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error in handleScanSuccess:', err);
      } finally {
        setLoading(false);
      }
    } else {
      console.warn('Scanned data missing identity components');
    }
  };


  // If no device ID provided, show device selector
  if (!deviceId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform select-none"
              onClick={handleLogoTap}
            >
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Mobile Client</h1>
            <p className="text-muted-foreground mt-2">
              Setup your device or check status
            </p>
            <p className="text-[10px] text-muted-foreground/30 mt-4 italic">
              Hint: Tap the icon 6 times to scan setup QR (Enterprise)
            </p>
          </div>

          <Dialog open={showWiFiSetup} onOpenChange={setShowWiFiSetup}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Android Enterprise Setup</DialogTitle>
                <DialogDescription>
                  Connect to Wi-Fi to download QR code reader software
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                {isDownloading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-medium">Downloading reader software...</p>
                  </>
                ) : (
                  <>
                    <Wifi className="w-12 h-12 text-blue-500" />
                    <div className="w-full max-w-[200px] border rounded p-3 text-left">
                      <p className="text-xs font-semibold mb-1">Available Networks</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>Nama_EMI_Secure</span>
                          <Wifi className="w-3 h-3 text-green-500" />
                        </div>
                        <div className="flex justify-between items-center text-xs opacity-50">
                          <span>Office_WiFi</span>
                          <Wifi className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleConnectWiFi}
                  className="w-full"
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Downloading...' : 'Connect & Install'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <p className="text-xs font-medium text-muted-foreground">Server Configuration</p>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowSettings(true)}>
                  <Settings2 className="w-3 h-3 mr-1" /> Change URL
                </Button>
              </div>
              <div className="p-2 bg-muted/50 rounded-md border text-[10px] break-all font-mono">
                {baseUrl}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground ml-1">Manual Device Link (Admin)</p>
              <div className="flex gap-2">
                <Input
                  className="bg-white/50 border-white/20"
                  placeholder="Enter Device ID"
                  value={inputDeviceId}
                  onChange={(e) => setInputDeviceId(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!inputDeviceId) return;
                    setLoading(true);
                    const found = await fetchDeviceById(inputDeviceId);
                    if (found) {
                      navigate(`/mobile/${found.id}`);
                    } else {
                      toast({
                        title: "ID Not Found",
                        description: "Check the ID and try again.",
                        variant: "destructive"
                      });
                    }
                    setLoading(false);
                  }}
                >
                  Link
                </Button>
              </div>
            </div>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Server Settings</DialogTitle>
                  <DialogDescription>
                    Configure the backend API URL for this client.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">API Endpoint URL</p>
                    <Input
                      value={newServerUrl}
                      onChange={(e) => setNewServerUrl(e.target.value)}
                      placeholder="https://api.example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
                  <Button onClick={() => {
                    setBaseUrl(newServerUrl);
                    setShowSettings(false);
                    toast({ title: "Settings Saved", description: "API URL updated successfully." });
                  }}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <Input
                placeholder="Enter Device ID"
                value={inputDeviceId}
                onChange={(e) => setInputDeviceId(e.target.value)}
              />
              <Button onClick={() => inputDeviceId && navigate(`/mobile/${inputDeviceId}`)}>
                Go
              </Button>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-primary/10 space-y-3">
              <h3 className="text-xs font-semibold flex items-center gap-2">
                <Settings2 className="w-3 h-3 text-primary" />
                Installation Configuration
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="text-muted-foreground whitespace-nowrap">Server URL:</div>
                <div className="truncate text-right">{baseUrl.replace('https://', '').replace('http://', '')}</div>

                <div className="text-muted-foreground">Admin Status:</div>
                <div className="text-right text-emerald-600 font-bold italic">ENABLED</div>

                <div className="text-muted-foreground">App Persistence:</div>
                <div className="text-right text-emerald-500">AUTO-START ACTIVE</div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-4 p-0 text-[10px] text-primary"
                onClick={() => setShowSettings(true)}
              >
                Change Config
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">or select a device</div>

            <div className="space-y-2">
              {devices.map((d) => (
                <Card
                  key={d.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${d.isLocked ? 'border-destructive/50 bg-destructive/5' : ''
                    }`}
                  onClick={() => navigate(`/mobile/${d.id}`)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{d.customerName}</p>
                        <p className="text-xs text-muted-foreground">{d.deviceModel}</p>
                      </div>
                    </div>
                    {d.isLocked && (
                      <Lock className="w-4 h-4 text-destructive" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        toast({
          title: "Connection Timeout",
          description: "Server took too long to respond. Please try again.",
          variant: "destructive"
        });
      }, 15000); // 15s timeout
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-primary animate-pulse">...</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Configuring Device</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
              Connecting to server and retrieving security profile...
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(false)}
            className="mt-4 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Device not found
  if (deviceId && !device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold italic tracking-tight text-destructive">Device Setup Failed</h1>
            <p className="text-muted-foreground text-sm">
              This device could not be configured automatically.
              <br />
              <span className="font-semibold text-foreground mt-2 block">
                Contact your IT admin for help.
              </span>
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-xs space-y-1">
            <p className="text-muted-foreground">Error Code: ERR_DEVICE_NOT_LINKED</p>
            <p className="text-muted-foreground font-mono">Attempted ID: {deviceId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/mobile')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try New Scan
            </Button>
            <Button className="w-full bg-primary" onClick={() => window.open(`tel:1234567890`)}>
              <Phone className="w-4 h-4 mr-2" />
              Contact Finance Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Device is locked - show lock screen
  if (device.isLocked) {
    return <LockedScreen device={device} />;
  }

  // Device is active - show normal status
  // Device is active - show normal status or Hidden Mode
  if (isHidden) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        {isUninstalling ? (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-red-500">Uninstalling Service...</h2>
            <p className="text-zinc-500 text-sm">Removing admin privileges and cleaning data.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-pulse">
            <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <Shield className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">System Protected</h2>
              <p className="text-zinc-500 max-w-[200px] mx-auto text-sm">
                Nama EMI Service is running in the background.
              </p>
            </div>
            <div className="pt-12 text-[10px] text-zinc-700 font-mono">
              SERVICE_ID: {device.id} <br />
              STATUS: MONITORING
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <PermissionsWizard
        isOpen={showPermissions}
        deviceId={device.id}
        onComplete={handlePermissionsComplete}
      />
      <ActiveScreen device={device} />
    </>
  );
};

// Locked Screen Component
const LockedScreen: React.FC<{ device: any }> = ({ device }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-destructive/20 via-destructive/10 to-background flex flex-col">
      {/* Status Bar Mock */}
      <div className="flex items-center justify-between px-4 py-2 bg-destructive/20 text-destructive text-xs">
        <span>{device.featureLocks.network ? 'No Signal' : '4G'}</span>
        <span>{device.featureLocks.wifi ? 'WiFi Off' : 'WiFi'}</span>
        <span>🔒 Locked</span>
      </div>

      {/* Main Lock Screen */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Lock Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
            <Lock className="w-16 h-16 text-destructive" />
          </div>
          <div className="absolute -inset-4 rounded-full border-4 border-destructive/30 animate-ping" />
        </div>

        {/* Time */}
        <div className="mb-8">
          <p className="text-5xl font-light tabular-nums">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-muted-foreground mt-1">
            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Warning Message */}
        <Card className="w-full max-w-sm border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
              <div className="text-left">
                <h2 className="font-bold text-lg text-destructive mb-2">
                  Device Locked
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your EMI payment is pending. This device has been locked by the finance company.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finance:</span>
                    <span className="font-medium">{device.emiDetails.financeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Amount:</span>
                    <span className="font-medium text-destructive">
                      ₹{device.emiDetails.emiAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">
                      {new Date(device.emiDetails.nextDueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Button */}
        <Button className="mt-6 gap-2" size="lg" onClick={() => window.open(`tel:${device.emiDetails.financePhone || ''}`)}>
          <Phone className="w-5 h-5" />
          Contact {device.emiDetails.financeName || 'Support'}
        </Button>

        {/* Disabled Features Notice */}
        <div className="mt-8 text-xs text-muted-foreground">
          <p className="mb-2">Restricted features:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {device.featureLocks.camera && <span className="px-2 py-1 bg-muted rounded">Camera</span>}
            {device.featureLocks.network && <span className="px-2 py-1 bg-muted rounded">Network</span>}
            {device.featureLocks.wifi && <span className="px-2 py-1 bg-muted rounded">WiFi</span>}
            {device.featureLocks.powerOff && <span className="px-2 py-1 bg-muted rounded">Power Off</span>}
            {device.featureLocks.reset && <span className="px-2 py-1 bg-muted rounded">Factory Reset</span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-muted-foreground border-t border-destructive/20">
        <p>Device ID: {device.id}</p>
        <p>IMEI: {device.imei1}</p>
      </div>
    </div>
  );
};

// Active Screen Component
const ActiveScreen: React.FC<{ device: any }> = ({ device }) => {
  const navigate = useNavigate();
  const { updateAvailable, versionInfo } = useAppUpdate();
  const progressPercent = (device.emiDetails.paidEmis / device.emiDetails.tenure) * 100;

  const handleUpdate = () => {
    if (versionInfo?.downloadUrl) {
      window.open(versionInfo.downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500/10 via-background to-background">
      <UpdateModal
        open={updateAvailable}
        version={versionInfo?.version || ''}
        releaseNotes={versionInfo?.releaseNotes}
        onUpdate={handleUpdate}
        forceUpdate={versionInfo?.forceUpdate}
        onCancel={() => { }}
      />
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <Button variant="ghost" size="sm" onClick={() => navigate('/mobile')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <span className="text-xs text-green-500 font-medium">● Active</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Welcome */}
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold">Hello, {device.customerName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-sm">Your device is active</p>
        </div>

        {/* EMI Status Card */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">EMI Status</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {device.emiDetails.financeName}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{device.emiDetails.paidEmis} of {device.emiDetails.tenure} paid</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Next EMI</p>
                <p className="font-semibold">₹{device.emiDetails.emiAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-semibold">
                  {new Date(device.emiDetails.nextDueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold">Device Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span>{device.deviceModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IMEI 1</span>
                <span className="font-mono text-xs">{device.imei1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IMEI 2</span>
                <span className="font-mono text-xs">{device.imei2}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring Status */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Security Status
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin Status</span>
                <span className="text-emerald-600 font-medium">Verified Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monitoring</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Live Telemetry</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              {device.telemetry && (
                <div className="pt-2 border-t mt-2 grid grid-cols-2 gap-2 text-[10px]">
                  <div>Carrier: {device.telemetry?.simCarrier ?? 'Unknown'}</div>
                  <div>Battery: {device.telemetry?.batteryLevel ?? '--'}%</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Please ensure timely EMI payments to avoid device restrictions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileClient;
