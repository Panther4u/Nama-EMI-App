import React from 'react';
import { Device } from '@/types/device';
import { useDevices } from '@/context/DeviceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Unlock,
  MapPin,
  Smartphone,
  Eye,
  Calendar,
  IndianRupee,
  Banknote,
  Wifi,
  WifiOff,
  Battery,
  Clock,
} from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onViewDetails: () => void;
  onRecordPayment: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onViewDetails, onRecordPayment }) => {
  const { lockDevice, unlockDevice } = useDevices();

  const remainingEmis = device.emiDetails.tenure - device.emiDetails.paidEmis;
  const progressPercent = (device.emiDetails.paidEmis / device.emiDetails.tenure) * 100;
  const isFullyPaid = device.emiDetails.paidEmis >= device.emiDetails.tenure;

  // Calculate connection status based on lastSeen
  const getConnectionStatus = () => {
    if (!device.telemetry?.lastSeen) {
      return { status: 'offline', label: 'Never Connected', color: 'text-muted-foreground', bgColor: 'bg-muted', dotColor: 'bg-gray-400' };
    }

    const lastSeen = new Date(device.telemetry.lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

    if (diffMinutes < 5) {
      return { status: 'online', label: 'Online', color: 'text-green-600', bgColor: 'bg-green-500/10', dotColor: 'bg-green-500' };
    } else if (diffMinutes < 30) {
      return { status: 'away', label: 'Away', color: 'text-amber-600', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-500' };
    } else {
      return { status: 'offline', label: 'Offline', color: 'text-red-600', bgColor: 'bg-red-500/10', dotColor: 'bg-red-500' };
    }
  };

  const connectionStatus = getConnectionStatus();

  // Format last seen time
  const getLastSeenText = () => {
    if (!device.telemetry?.lastSeen) return 'Never';

    const lastSeen = new Date(device.telemetry.lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className={`relative overflow-hidden bg-card/50 backdrop-blur-xl border-border transition-all hover:shadow-xl ${device.isLocked ? 'hover:border-destructive/30' : 'hover:border-primary/30'
      }`}>
      {device.isLocked && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
      )}
      <CardContent className="p-4 space-y-4">
        {/* Header with Connection Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.isLocked ? 'bg-destructive/10' : 'bg-primary/10'
              }`}>
              <Smartphone className={`w-5 h-5 ${device.isLocked ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{device.customerName}</h3>
              <p className="text-xs text-muted-foreground">{device.deviceModel}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={device.isLocked ? 'destructive' : 'default'}
              className={device.isLocked ? 'bg-destructive/20 text-destructive border-destructive/30' : 'bg-primary/20 text-primary border-primary/30'}
            >
              {device.isLocked ? 'Locked' : 'Active'}
            </Badge>
            {/* Connection Status Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${connectionStatus.status === 'online' ? 'bg-green-500/10' :
              connectionStatus.status === 'away' ? 'bg-amber-500/10' : 'bg-muted'
              }`}>
              <div className="relative">
                <div className={`w-2 h-2 rounded-full ${connectionStatus.status === 'online' ? 'bg-green-500' :
                  connectionStatus.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground'
                  }`} />
                {connectionStatus.status === 'online' && (
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${connectionStatus.status === 'online' ? 'text-green-600 dark:text-green-400' :
                connectionStatus.status === 'away' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                }`}>
                {connectionStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Info - Only show if device has connected at least once */}
        {device.telemetry && (
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-1.5 text-xs">
              <Battery className={`w-3.5 h-3.5 ${device.telemetry.batteryLevel > 20 ? 'text-green-500' : 'text-destructive'}`} />
              <span className="text-foreground">{device.telemetry.batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {connectionStatus.status === 'online' ? (
                <Wifi className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className="text-foreground truncate">{device.telemetry.networkType || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs col-span-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last seen: {getLastSeenText()}</span>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">{device.mobileNo}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">
              {device.location && typeof device.location === 'object'
                ? `${device.location.lat.toFixed(4)}, ${device.location.lng.toFixed(4)}`
                : 'No location'}
            </span>
          </div>
        </div>

        {/* EMI Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">EMI Progress</span>
            <span className="font-medium text-foreground">{device.emiDetails.paidEmis}/{device.emiDetails.tenure}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {device.emiDetails.emiAmount}/mo
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {new Date(device.emiDetails.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 bg-transparent border-border text-foreground hover:bg-accent"
            onClick={onViewDetails}
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Button>
          {!isFullyPaid && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-1 bg-muted text-foreground hover:bg-muted/80"
              onClick={onRecordPayment}
            >
              <Banknote className="w-3.5 h-3.5" />
              Pay
            </Button>
          )}
          {device.isLocked ? (
            <Button
              variant="default"
              size="sm"
              className="gap-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              onClick={() => unlockDevice(device.id)}
            >
              <Unlock className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              onClick={() => lockDevice(device.id)}
            >
              <Lock className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
