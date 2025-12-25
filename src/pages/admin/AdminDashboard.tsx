import React, { useState } from 'react';
import { useDevices } from '@/context/DeviceContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Shield,
  LogOut,
  Plus,
  Search,
  Smartphone,
  Lock,
  Unlock,
  MapPin,
  Users,
  AlertTriangle,
  IndianRupee,
} from 'lucide-react';
import AddDeviceModal from '@/components/admin/AddDeviceModal';
import DeviceCard from '@/components/admin/DeviceCard';
import DeviceDetailModal from '@/components/admin/DeviceDetailModal';
import PaymentRecordModal from '@/components/admin/PaymentRecordModal';

const AdminDashboard: React.FC = () => {
  const { devices, getDeviceById } = useDevices();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [paymentDeviceId, setPaymentDeviceId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  const filteredDevices = devices.filter(device =>
    device.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.mobileNo.includes(searchTerm) ||
    device.imei1.includes(searchTerm) ||
    device.imei2.includes(searchTerm)
  );

  const lockedDevices = devices.filter(d => d.isLocked);
  const activeDevices = devices.filter(d => !d.isLocked);
  const totalEmiPending = devices.reduce((acc, d) => {
    const remaining = (d.emiDetails.tenure - d.emiDetails.paidEmis) * d.emiDetails.emiAmount;
    return acc + remaining;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Nama EMI App</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{devices.length}</p>
                  <p className="text-xs text-muted-foreground">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lockedDevices.length}</p>
                  <p className="text-xs text-muted-foreground">Locked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Unlock className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeDevices.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{(totalEmiPending / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">EMI Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Device
          </Button>
        </div>

        {/* Device List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Registered Devices ({filteredDevices.length})
          </h2>

          {filteredDevices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No devices found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDevices.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onViewDetails={() => setSelectedDeviceId(device.id)}
                  onRecordPayment={() => setPaymentDeviceId(device.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeviceDetailModal
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
      />

      <PaymentRecordModal
        device={paymentDeviceId ? getDeviceById(paymentDeviceId) || null : null}
        onClose={() => setPaymentDeviceId(null)}
      />
    </div>
  );
};

export default AdminDashboard;
