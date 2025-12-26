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
  X,
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
      <DialogContent className="w-full h-full max-w-none md:max-w-3xl md:h-auto md:max-h-[90vh] p-0 gap-0 md:rounded-xl bg-card border-border overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <DialogHeader className="p-4 border-b border-border bg-card sticky top-0 z-20 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5 text-primary" />
              Device Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={device.isLocked ? 'destructive' : 'default'}>
                {device.isLocked ? 'LOCKED' : 'ACTIVE'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="md:hidden text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="info" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Info</TabsTrigger>
              <TabsTrigger value="controls" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Cntrl</TabsTrigger>
              <TabsTrigger value="location" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Loc</TabsTrigger>
              <TabsTrigger value="qr" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">QR</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                  </h3>
                  <div className="space-y-2">
                    <InfoRow icon={User} label="Customer Name" value={device.customerName} />
                    <InfoRow icon={Smartphone} label="Mobile Number" value={device.mobileNo} />
                    <InfoRow icon={CreditCard} label="Aadhar Number" value={device.aadharNo} />
                    <InfoRow icon={MapPin} label="Address" value={device.address} />
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Device Information
                  </h3>
                  <div className="space-y-2">
                    <InfoRow label="Device Model" value={device.deviceModel} />
                    <InfoRow label="IMEI 1" value={device.imei1} />
                    <InfoRow label="IMEI 2" value={device.imei2} />
                    <InfoRow icon={Calendar} label="Registered On" value={new Date(device.registeredAt).toLocaleDateString('en-IN')} />
                  </div>
                </div>
              </div>

              {/* Live Telemetry */}
              {device.telemetry && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Signal className="w-4 h-4" /> Live Status
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-normal gap-1 bg-green-500/10 text-green-600 border-green-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Battery */}
                    <div className="p-3 bg-card border border-border rounded-xl shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Battery</p>
                      <div className="flex items-end gap-2">
                        <div className={`w-3 h-6 rounded border border-foreground/30 p-[1px] flex items-end ${(device.telemetry?.batteryLevel ?? 0) < 20 ? 'text-red-500' : 'text-green-500'}`}>
                          <div className="w-full bg-current rounded-sm" style={{ height: `${device.telemetry?.batteryLevel ?? 0}%` }} />
                        </div>
                        <span className="text-lg font-bold">
                          {device.telemetry?.batteryLevel ?? '--'}%
                        </span>
                      </div>
                    </div>

                    {/* Network */}
                    <div className="p-3 bg-card border border-border rounded-xl shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Network</p>
                      <div className="flex items-center gap-2 text-blue-500">
                        {device.telemetry?.networkType === 'wifi' ? <Wifi className="w-5 h-5" /> : <Signal className="w-5 h-5" />}
                        <span className="text-lg font-bold text-foreground capitalize">
                          {device.telemetry?.networkType ?? 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Carrier */}
                    <div className="p-3 bg-card border border-border rounded-xl shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Carrier</p>
                      <div className="flex items-center gap-2">
                        <Signal className="w-5 h-5 text-purple-500" />
                        <span className="text-lg font-bold text-foreground truncate">
                          {device.telemetry?.simCarrier ?? 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Android Ver */}
                    <div className="p-3 bg-card border border-border rounded-xl shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">Android</p>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-orange-500" />
                        <span className="text-lg font-bold text-foreground">
                          v{device.telemetry?.androidVersion ? device.telemetry.androidVersion.split(' ')[0] : '?'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-right text-muted-foreground">
                    Last sync: {device.telemetry?.lastSeen ? new Date(device.telemetry.lastSeen).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              )}

              {/* EMI Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  EMI Status
                </h3>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-semibold flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      {device.emiDetails.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="font-semibold flex items-center">
                      <IndianRupee className="w-3 h-3" />
                      {device.emiDetails.emiAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Progress Card */}
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-amber-700 dark:text-amber-400 font-medium text-sm">EMI Progress</div>
                    <div className="text-amber-700 dark:text-amber-400 font-bold">
                      {device.emiDetails.paidEmis} <span className="text-amber-700/60 dark:text-amber-400/60 font-normal">/ {device.emiDetails.tenure}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${(device.emiDetails.paidEmis / device.emiDetails.tenure) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-amber-500/10">
                    <div>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Next Due</p>
                      <p className="font-bold text-amber-800 dark:text-amber-300">
                        {new Date(device.emiDetails.nextDueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Remaining</p>
                      <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center">
                        <IndianRupee className="w-3 h-3" />
                        {((device.emiDetails.tenure - device.emiDetails.paidEmis) * device.emiDetails.emiAmount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              {/* Main Lock Toggle */}
              <div className={`p-5 rounded-2xl border ${device.isLocked ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${device.isLocked ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      {device.isLocked ? (
                        <Lock className={`w-8 h-8 ${device.isLocked ? 'text-red-500' : 'text-green-500'}`} />
                      ) : (
                        <Unlock className={`w-8 h-8 ${device.isLocked ? 'text-red-500' : 'text-green-500'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{device.isLocked ? 'Locked' : 'Unlocked'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {device.isLocked ? 'Device restricted' : 'Device active'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className={`w-full font-semibold shadow-lg ${device.isLocked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    onClick={() => device.isLocked ? unlockDevice(device.id) : lockDevice(device.id)}
                  >
                    {device.isLocked ? (
                      <><Unlock className="w-4 h-4 mr-2" /> Unlock Device</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Lock Device</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Feature Locks */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 pl-1">
                  Restrictions
                </h3>
                <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {[
                    { key: 'camera', label: 'Camera', icon: Camera, desc: 'Block camera' },
                    { key: 'network', label: 'Network', icon: Signal, desc: 'Disable data' },
                    { key: 'wifi', label: 'WiFi', icon: Wifi, desc: 'Disable WiFi' },
                    { key: 'powerOff', label: 'Power Off', icon: Power, desc: 'Block shutdown' },
                    { key: 'reset', label: 'Reset', icon: RotateCcw, desc: 'Block factory reset' },
                  ].map(({ key, label, icon: Icon, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={device.featureLocks[key as keyof typeof device.featureLocks]}
                        onCheckedChange={(checked) => updateFeatureLocks(device.id, { [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-xl">
                <h3 className="text-sm font-bold text-destructive flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Permanently erase all data on the remote device.</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
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
            </TabsContent>

            {/* Location & QR Tabs simplified for space */}
            <TabsContent value="location" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="relative h-[300px] md:h-[400px] bg-muted rounded-xl overflow-hidden border border-border">
                {/* Map Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 animate-bounce">
                    <MapPin className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-1">Live Location</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {device.location.lat.toFixed(6)}, {device.location.lng.toFixed(6)}
                  </p>
                  <Button onClick={() => setShowMap(true)} className="gap-2 shadow-lg">
                    <MapPin className="w-4 h-4" /> Open Interactive Map
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl text-center">
                <h3 className="font-bold text-lg mb-2">Device QR Code</h3>
                <div className="p-4 bg-white rounded-xl shadow-lg mb-4">
                  <QRCodeSVG value={device.qrCodeData || 'no-data'} size={200} />
                </div>
                <p className="text-sm text-muted-foreground">Scan to view device details instantly</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-border bg-card sticky bottom-0 z-20 shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
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
