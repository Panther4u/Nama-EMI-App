import React, { useState } from 'react';
import { useDevices } from '@/context/DeviceContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Smartphone, CheckCircle, User, CreditCard, Calendar, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';
import DeviceModelSelector from '@/components/common/DeviceModelSelector';
import { MOBILE_BRANDS } from '@/data/mobileDevices';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const { addDevice } = useDevices();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    mobileNo: '',
    aadharNo: '',
    address: '',
    imei1: '',
    imei2: '',
    deviceModel: '',
    financeName: '',
    totalAmount: '',
    emiAmount: '',
    tenure: '',
    nextDueDate: '',
  });
  const [showQR, setShowQR] = useState(false);
  const [createdDevice, setCreatedDevice] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await addDevice({
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      mobileNo: formData.mobileNo,
      aadharNo: formData.aadharNo,
      address: formData.address,
      imei1: formData.imei1,
      imei2: formData.imei2,
      deviceModel: formData.deviceModel,
      isLocked: false,
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lng: 77.5946 + (Math.random() - 0.5) * 0.1,
        lastUpdated: new Date(),
      },
      featureLocks: {
        camera: false,
        network: false,
        wifi: false,
        powerOff: false,
        reset: false,
      },
      emiDetails: {
        financeName: formData.financeName,
        totalAmount: parseFloat(formData.totalAmount),
        emiAmount: parseFloat(formData.emiAmount),
        tenure: parseInt(formData.tenure),
        paidEmis: 0,
        nextDueDate: formData.nextDueDate,
        paymentHistory: [],
      },
    });

    if (result.success && result.device) {
      setCreatedDevice(result.device);
      toast({
        title: 'Device Added',
        description: `${formData.customerName}'s device registered successfully.`,
      });
      setShowQR(true);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add device.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setShowQR(false);
    setCreatedDevice(null);
    setStep(1);
    setFormData({
      customerName: '',
      customerEmail: '',
      mobileNo: '',
      aadharNo: '',
      address: '',
      imei1: '',
      imei2: '',
      deviceModel: '',
      financeName: '',
      totalAmount: '',
      emiAmount: '',
      tenure: '',
      nextDueDate: '',
    });
    onClose();
  };

  if (showQR && createdDevice) {
    // Checksum for current APK (NF9iLOnjAVTlZMXc+W5YnxiCJTDAyC1jokevvYCV0ks= -> URL Safe)
    const apkChecksum = "NF9iLOnjAVTlZMXc-W5YnxiCJTDAyC1jokevvYCV0ks";

    const qrData = JSON.stringify({
      "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.nama.emi.app/.AdminReceiver",
      "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": `${window.location.origin}/downloads/nama-emi.apk`,
      "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": apkChecksum,
      "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": true,
      "deviceId": createdDevice.id,
      "serverUrl": window.location.origin,
      "customerName": createdDevice.customerName,
      "deviceModel": createdDevice.deviceModel,
    });

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95%] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-card border-border text-foreground p-0">
          {/* Success Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Device Registered!</h3>
              <p className="text-sm text-white/80">{createdDevice.customerName}</p>
              <p className="text-xs text-white/60">{createdDevice.deviceModel}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg mb-3">
                <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Device ID: <span className="font-mono text-foreground">{createdDevice.id}</span>
              </p>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Android Setup Instructions
              </h4>

              {/* Method 1: QR Provisioning */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">Factory Reset Device</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Settings → System → Reset → Factory Reset
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">Activate QR Scanner</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      On "Welcome" screen, tap <span className="font-bold">6 times</span> quickly
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">Scan QR Code</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Point camera at QR code above
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-600 dark:text-green-400 text-sm">Auto Setup Complete!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Device configures automatically
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Method */}
              <details className="bg-muted/30 rounded-xl border border-border">
                <summary className="p-3 cursor-pointer text-sm font-medium text-foreground hover:bg-muted/50 rounded-xl">
                  Alternative: Manual Setup
                </summary>
                <div className="p-4 pt-2 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <p className="text-muted-foreground">Download APK from provided link</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <p className="text-muted-foreground">Install APK on device</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <p className="text-muted-foreground">Open app and scan this QR code</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <p className="text-muted-foreground">Grant all permissions when prompted</p>
                  </div>
                </div>
              </details>

              {/* Important Notes */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">⚠️ Important Notes:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>QR provisioning requires factory reset</li>
                  <li>Device must be on Android 8.0+</li>
                  <li>WiFi connection required</li>
                  <li>Keep this QR code for reference</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 border-border text-foreground hover:bg-accent"
              >
                Print QR
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const totalSteps = 3;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-card border-border text-foreground p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-xl font-bold text-white">Add New Device</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/30'
                  }`} />
              </div>
            ))}
          </div>
          <p className="text-white/80 text-sm mt-2">Step {step} of {totalSteps}</p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-primary mb-4">
                <User className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Customer Information</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Full Name *</Label>
                <Input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-foreground">Mobile *</Label>
                  <Input
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Aadhar *</Label>
                  <Input
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={handleChange}
                    placeholder="XXXX-XXXX-XXXX"
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Email</Label>
                <Input
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Address *</Label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows={2}
                  required
                  className="bg-background border-input text-foreground resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Device Info */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Smartphone className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Device Information</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Device Model *</Label>
                <DeviceModelSelector
                  value={formData.deviceModel}
                  onChange={(val) => setFormData(prev => ({ ...prev, deviceModel: val }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">IMEI 1 *</Label>
                <Input
                  name="imei1"
                  value={formData.imei1}
                  onChange={handleChange}
                  placeholder="15 digit IMEI"
                  required
                  className="bg-background border-input text-foreground font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">IMEI 2 *</Label>
                <Input
                  name="imei2"
                  value={formData.imei2}
                  onChange={handleChange}
                  placeholder="15 digit IMEI"
                  required
                  className="bg-background border-input text-foreground font-mono"
                />
              </div>
            </div>
          )}

          {/* Step 3: Finance Info */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-primary mb-4">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold text-foreground">Finance Details</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Finance Company *</Label>
                <Input
                  name="financeName"
                  value={formData.financeName}
                  onChange={handleChange}
                  placeholder="Bajaj Finance"
                  required
                  className="bg-background border-input text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-foreground">Total (₹) *</Label>
                  <Input
                    name="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    placeholder="35000"
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">EMI (₹) *</Label>
                  <Input
                    name="emiAmount"
                    type="number"
                    value={formData.emiAmount}
                    onChange={handleChange}
                    placeholder="3500"
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-foreground">Tenure (Months) *</Label>
                  <Input
                    name="tenure"
                    type="number"
                    value={formData.tenure}
                    onChange={handleChange}
                    placeholder="12"
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Due Date *</Label>
                  <Input
                    name="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={handleChange}
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Device
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceModal;
