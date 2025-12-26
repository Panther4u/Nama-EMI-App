import React from 'react';
import { useDevices } from '@/context/DeviceContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocationMapModal from '@/components/admin/LocationMapModal';
import {
  Lock,
  Unlock,
  MapPin,
  Camera,
  Wifi,
  Signal,
  Power,
  RotateCcw,
  User,
  Smartphone,
  CreditCard,
  QrCode,
  Calendar,
  IndianRupee,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceDetailModalProps {
  deviceId: string | null;
  onClose: () => void;
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ deviceId, onClose }) => {
  const { getDeviceById, lockDevice, unlockDevice, updateFeatureLocks, deleteDevice } = useDevices();
  const { toast } = useToast();
  const device = deviceId ? getDeviceById(deviceId) : null;
  const [showMap, setShowMap] = React.useState(false);

  if (!device) return null;

  const handleDelete = () => {
    deleteDevice(device.id);
    toast({
      title: 'Device Deleted',
      description: `${device.customerName}'s device has been removed.`,
      variant: 'destructive',
    });
    onClose();
  };

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={!!deviceId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Device Details
            </DialogTitle>
            <Badge variant={device.isLocked ? 'destructive' : 'default'} className="ml-2">
              {device.isLocked ? 'LOCKED' : 'ACTIVE'}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Customer Information
                </h3>
                <InfoRow icon={User} label="Customer Name" value={device.customerName} />
                <InfoRow icon={Smartphone} label="Mobile Number" value={device.mobileNo} />
                <InfoRow label="Aadhar Number" value={device.aadharNo} />
                <InfoRow icon={MapPin} label="Address" value={device.address} />
              </div>

              {/* Device Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Device Information
                </h3>
                <InfoRow icon={Smartphone} label="Device Model" value={device.deviceModel} />
                <InfoRow label="IMEI 1" value={device.imei1} />
                <InfoRow label="IMEI 2" value={device.imei2} />
                <InfoRow icon={Calendar} label="Registered On" value={new Date(device.registeredAt).toLocaleDateString('en-IN')} />
              </div>
            </div>

            <Separator />

            {/* Live Telemetry */}
            {device.telemetry && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Signal className="w-4 h-4" /> Live Device Status
                  <span className="text-[10px] normal-case bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Last seen: {device.telemetry?.lastSeen ? new Date(device.telemetry.lastSeen).toLocaleTimeString() : 'Never'}
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Battery</p>
                    <p className="font-semibold flex items-center gap-2">
                      <div className={`w-2 h-4 rounded-sm border border-current flex items-end p-0.5 ${(device.telemetry?.batteryLevel ?? 0) < 20 ? 'text-red-500' : 'text-green-600'}`}>
                        <div className="w-full bg-current rounded-[1px]" style={{ height: `${device.telemetry?.batteryLevel ?? 0}%` }} />
                      </div>
                      {device.telemetry?.batteryLevel ?? '--'}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Network</p>
                    <p className="font-semibold capitalize flex items-center gap-2">
                      {device.telemetry?.networkType === 'wifi' ? <Wifi className="w-4 h-4 text-blue-500" /> : <Signal className="w-4 h-4 text-green-500" />}
                      {device.telemetry?.networkType ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">SIM Provider</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      {device.telemetry?.simCarrier ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Software</p>
                    <p className="font-semibold">Android {device.telemetry?.androidVersion ? device.telemetry.androidVersion.split(' ')[0] : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* EMI Details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                EMI Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Finance Company</p>
                  <p className="font-semibold">{device.emiDetails.financeName}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-semibold flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {device.emiDetails.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Monthly EMI</p>
                  <p className="font-semibold flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {device.emiDetails.emiAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">EMI Progress</p>
                  <p className="font-semibold">{device.emiDetails.paidEmis}/{device.emiDetails.tenure} paid</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Next EMI Due</p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      {new Date(device.emiDetails.nextDueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Remaining Amount</p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-end">
                      <IndianRupee className="w-3 h-3" />
                      {((device.emiDetails.tenure - device.emiDetails.paidEmis) * device.emiDetails.emiAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            {/* Main Lock Toggle */}
            <div className={`p-4 rounded-lg border-2 ${device.isLocked ? 'border-destructive bg-destructive/5' : 'border-green-500 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {device.isLocked ? (
                    <Lock className="w-6 h-6 text-destructive" />
                  ) : (
                    <Unlock className="w-6 h-6 text-green-500" />
                  )}
                  <div>
                    <p className="font-semibold">Device Status</p>
                    <p className="text-sm text-muted-foreground">
                      {device.isLocked ? 'Device is locked and restricted' : 'Device is active and functional'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={device.isLocked ? 'default' : 'destructive'}
                  onClick={() => device.isLocked ? unlockDevice(device.id) : lockDevice(device.id)}
                >
                  {device.isLocked ? 'Unlock Device' : 'Lock Device'}
                </Button>
              </div>
            </div>

            {/* Feature Locks */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Feature Controls
              </h3>
              <div className="grid gap-3">
                {[
                  { key: 'camera', label: 'Camera', icon: Camera, desc: 'Block camera access' },
                  { key: 'network', label: 'Mobile Network', icon: Signal, desc: 'Disable cellular data' },
                  { key: 'wifi', label: 'WiFi', icon: Wifi, desc: 'Disable WiFi connectivity' },
                  { key: 'powerOff', label: 'Power Off', icon: Power, desc: 'Prevent device shutdown' },
                  { key: 'reset', label: 'Factory Reset', icon: RotateCcw, desc: 'Block factory reset' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={device.featureLocks[key as keyof typeof device.featureLocks]}
                      onCheckedChange={(checked) => updateFeatureLocks(device.id, { [key]: checked })}
                    />
                  </div>
                ))}

                {/* Remote Wipe Zone */}
                <div className="mt-6 p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                  <h3 className="text-sm font-bold text-destructive uppercase tracking-wide mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Remote Internal Wipe</p>
                      <p className="text-xs text-muted-foreground">Permanently erase all data on the device.</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm('ARE YOU SURE? This will FACTORY RESET the remote device!')) {
                          try {
                            await fetch(`${import.meta.env.VITE_API_URL}/api/devices/${device.id}/wipe`, { method: 'POST' });
                            toast({ title: 'Wipe Command Sent', description: 'The device will reset on next sync.' });
                          } catch (e) {
                            console.error(e);
                            toast({ title: 'Error', variant: 'destructive', description: 'Failed to send command' });
                          }
                        }
                      }}
                    >
                      Wipe Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Live Location</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(device.location.lastUpdated).toLocaleTimeString('en-IN')}
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <MapPin className="w-3 h-3" />
                {device.location.lat.toFixed(6)}, {device.location.lng.toFixed(6)}
              </Badge>
            </div>

            <Button className="w-full gap-2 mb-4" onClick={() => setShowMap(true)}>
              <MapPin className="w-4 h-4" />
              Open Live Map Tracking
            </Button>

            {/* Map Placeholder */}
            <div className="relative h-64 bg-muted rounded-lg overflow-hidden border">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                    <MapPin className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-sm font-medium">{device.customerName}'s Device</p>
                  <p className="text-xs text-muted-foreground">
                    Lat: {device.location.lat.toFixed(6)} | Lng: {device.location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              {/* Grid lines for map effect */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute border-b border-foreground/10" style={{ top: `${i * 10}%`, left: 0, right: 0 }} />
                ))}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute border-r border-foreground/10" style={{ left: `${i * 10}%`, top: 0, bottom: 0 }} />
                ))}
              </div>
            </div>

            {device.isLocked && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Real-time location tracking is active. Location updates every 10 seconds.
                </p>
              </div>
            )}
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Device Registration QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code to view device and customer details
              </p>

              <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  value={device.qrCodeData}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2">QR Contains:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Customer Name: {device.customerName}</li>
                  <li>• Mobile: {device.mobileNo}</li>
                  <li>• IMEI 1: {device.imei1}</li>
                  <li>• IMEI 2: {device.imei2}</li>
                  <li>• Aadhar: {device.aadharNo}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
            <Trash2 className="w-4 h-4" />
            Delete Device
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
      {deviceId && (
        <LocationMapModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          deviceId={deviceId}
        />
      )}
    </Dialog>
  );
};

export default DeviceDetailModal;
