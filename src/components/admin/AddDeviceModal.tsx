import React, { useState } from 'react';
import { useDevices } from '@/context/DeviceContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Smartphone, CheckCircle, Download, Loader2 } from 'lucide-react';
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
    serverIp: '',
  });
  const [showQR, setShowQR] = useState(false);
  const [createdDevice, setCreatedDevice] = useState<any>(null);
  const [detectingModel, setDetectingModel] = useState(false);

  // Mock IMEI detection
  useEffect(() => {
    if (formData.imei1.length === 15 && !formData.deviceModel) {
      setDetectingModel(true);
      // Simulate API call
      setTimeout(() => {
        // Pick a random model from our dataset for demo
        const brands = Object.keys(MOBILE_BRANDS);
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        const models = MOBILE_BRANDS[randomBrand];
        const randomModel = models[Math.floor(Math.random() * models.length)];

        // Construct standard name
        let fullName = randomModel;
        if (!randomModel.toLowerCase().includes(randomBrand.toLowerCase())) {
          fullName = `${randomBrand} ${randomModel}`;
        }

        setFormData(prev => ({ ...prev, deviceModel: fullName }));
        setDetectingModel(false);
        toast({
          title: "Device Detected",
          description: `Model identified as ${fullName}`,
        });
      }, 1500);
    }
  }, [formData.imei1]);

  useEffect(() => {
    // Auto-detect IP or use localhost default
    setFormData(prev => ({ ...prev, serverIp: window.location.hostname }));
  }, []);

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
      serverIp: formData.serverIp, // Pass IP for QR code
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
        description: `${formData.customerName}'s device has been registered successfully.`,
      });
      setShowQR(true);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add device. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setShowQR(false);
    setCreatedDevice(null);
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
  }

  if (showQR && createdDevice) {
    // Ensure we use the exact data the mobile app expects
    const qrData = createdDevice.qrCodeData || JSON.stringify({
      id: createdDevice.id,
      name: createdDevice.customerName,
      email: createdDevice.customerEmail,
      imei1: createdDevice.imei1,
      model: createdDevice.deviceModel,
      finance: createdDevice.financeName
    });

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Device Registered Successfully
            </DialogTitle>
            <DialogDescription>
              Scan with <b>Android System Setup</b> (Tap home screen 6 times).<br />
              <span className="text-green-600 font-medium">Use the "Welcome" screen scanner.</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold">{createdDevice.customerName}</p>
              <p className="text-sm text-muted-foreground">{createdDevice.deviceModel}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">ID: {createdDevice.id}</p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95%] max-w-[400px] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Add New Device
          </DialogTitle>
          <DialogDescription>
            Register a new customer device for EMI tracking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNo">Mobile Number *</Label>
                <Input
                  id="mobileNo"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharNo">Aadhar Number *</Label>
                <Input
                  id="aadharNo"
                  name="aadharNo"
                  value={formData.aadharNo}
                  onChange={handleChange}
                  placeholder="XXXX-XXXX-XXXX"
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Device Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serverIp">Server IP (For Download) *</Label>
                <Input
                  id="serverIp"
                  name="serverIp"
                  value={formData.serverIp}
                  onChange={handleChange}
                  placeholder="192.168.1.10"
                  required
                />
                <p className="text-[10px] text-muted-foreground">Enter your computer's Local IP for phone to download APK.</p>
              </div>
              <div className="col-span-2 space-y-2">
                <DeviceModelSelector
                  value={formData.deviceModel}
                  onChange={(val) => setFormData(prev => ({ ...prev, deviceModel: val }))}
                />
                {detectingModel && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Detecting model from IMEI...
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei1">IMEI 1 *</Label>
                <Input
                  id="imei1"
                  name="imei1"
                  value={formData.imei1}
                  onChange={handleChange}
                  placeholder="15 digit IMEI"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei2">IMEI 2 *</Label>
                <Input
                  id="imei2"
                  name="imei2"
                  value={formData.imei2}
                  onChange={handleChange}
                  placeholder="15 digit IMEI"
                  required
                />
              </div>
            </div>
          </div>

          {/* Finance Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Finance Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="financeName">Finance Company *</Label>
                <Input
                  id="financeName"
                  name="financeName"
                  value={formData.financeName}
                  onChange={handleChange}
                  placeholder="Bajaj Finance"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
                <Input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="35000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emiAmount">EMI Amount (₹) *</Label>
                <Input
                  id="emiAmount"
                  name="emiAmount"
                  type="number"
                  value={formData.emiAmount}
                  onChange={handleChange}
                  placeholder="3500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure">Tenure (Months) *</Label>
                <Input
                  id="tenure"
                  name="tenure"
                  type="number"
                  value={formData.tenure}
                  onChange={handleChange}
                  placeholder="12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">First EMI Due Date *</Label>
                <Input
                  id="nextDueDate"
                  name="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceModal;
