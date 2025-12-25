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

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
      device.isLocked ? 'border-destructive/50 bg-destructive/5' : 'border-border'
    }`}>
      {device.isLocked && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
      )}
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              device.isLocked ? 'bg-destructive/10' : 'bg-primary/10'
            }`}>
              <Smartphone className={`w-5 h-5 ${device.isLocked ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div>
              <h3 className="font-semibold">{device.customerName}</h3>
              <p className="text-xs text-muted-foreground">{device.deviceModel}</p>
            </div>
          </div>
          <Badge variant={device.isLocked ? 'destructive' : 'default'}>
            {device.isLocked ? 'Locked' : 'Active'}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">{device.mobileNo}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* EMI Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">EMI Progress</span>
            <span className="font-medium">{device.emiDetails.paidEmis}/{device.emiDetails.tenure}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
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
            className="flex-1 gap-1"
            onClick={onViewDetails}
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Button>
          {!isFullyPaid && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-1"
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
              className="gap-1"
              onClick={() => unlockDevice(device.id)}
            >
              <Unlock className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1"
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
