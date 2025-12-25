import React, { useState } from 'react';
import { useDevices } from '@/context/DeviceContext';
import { Device, PaymentRecord } from '@/types/device';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IndianRupee,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentRecordModalProps {
  device: Device | null;
  onClose: () => void;
}

const paymentMethods = [
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'cheque', label: 'Cheque', icon: Receipt },
  { value: 'card', label: 'Card', icon: CreditCard },
];

const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({ device, onClose }) => {
  const { recordPayment } = useDevices();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: device?.emiDetails.emiAmount.toString() || '',
    paidDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    paymentMethod: 'upi' as PaymentRecord['paymentMethod'],
    notes: '',
  });

  if (!device) return null;

  const nextEmiNumber = device.emiDetails.paidEmis + 1;
  const remainingEmis = device.emiDetails.tenure - device.emiDetails.paidEmis;
  const isFullyPaid = device.emiDetails.paidEmis >= device.emiDetails.tenure;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transactionId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a transaction ID',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    recordPayment(device.id, {
      emiNumber: nextEmiNumber,
      amount: parseFloat(formData.amount),
      paidDate: formData.paidDate,
      transactionId: formData.transactionId,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes || undefined,
      recordedBy: 'admin',
    });

    toast({
      title: 'Payment Recorded',
      description: `EMI #${nextEmiNumber} payment of ₹${parseFloat(formData.amount).toLocaleString('en-IN')} recorded successfully.`,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={!!device} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Record EMI Payment
          </DialogTitle>
          <DialogDescription>
            Record payment for {device.customerName} - {device.deviceModel}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* EMI Status Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">EMI Amount</p>
              <p className="font-bold flex items-center justify-center">
                <IndianRupee className="w-3 h-3" />
                {device.emiDetails.emiAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Paid / Total</p>
              <p className="font-bold">{device.emiDetails.paidEmis} / {device.emiDetails.tenure}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="font-bold flex items-center justify-center">
                <IndianRupee className="w-3 h-3" />
                {(remainingEmis * device.emiDetails.emiAmount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {isFullyPaid ? (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <h3 className="font-semibold text-green-600 dark:text-green-400">All EMIs Paid!</h3>
              <p className="text-sm text-muted-foreground">This device has completed all EMI payments.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium">Recording EMI #{nextEmiNumber} of {device.emiDetails.tenure}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidDate">Payment Date</Label>
                  <Input
                    id="paidDate"
                    type="date"
                    value={formData.paidDate}
                    onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="Enter transaction/receipt ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentRecord['paymentMethod'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="w-4 h-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this payment"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          )}

          <Separator />

          {/* Payment History */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Payment History
            </h3>
            <ScrollArea className="h-40">
              {device.emiDetails.paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {device.emiDetails.paymentHistory.slice().reverse().map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">EMI #{payment.emiNumber}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(payment.paidDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold flex items-center justify-end">
                          <IndianRupee className="w-3 h-3" />
                          {payment.amount.toLocaleString('en-IN')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {paymentMethods.find(m => m.value === payment.paymentMethod)?.label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRecordModal;
