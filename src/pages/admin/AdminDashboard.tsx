import React, { useState } from 'react';
import { useDevices } from '@/context/DeviceContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  LogOut,
  Plus,
  Search,
  Smartphone,
  Lock,
  Unlock,
  Settings2,
  TrendingUp,
  Moon,
  Sun,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddDeviceModal from '@/components/admin/AddDeviceModal';
import DeviceCard from '@/components/admin/DeviceCard';
import DeviceDetailModal from '@/components/admin/DeviceDetailModal';
import PaymentRecordModal from '@/components/admin/PaymentRecordModal';

const AdminDashboard: React.FC = () => {
  const { devices, getDeviceById, baseUrl, setBaseUrl } = useDevices();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [paymentDeviceId, setPaymentDeviceId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(baseUrl);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
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
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Nama EMI</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm mx-4 bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">API Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure backend server URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Server URL</p>
              <Input
                value={newServerUrl}
                onChange={(e) => setNewServerUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="bg-background border-input text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Current: {baseUrl || '(Empty)'}
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="w-full bg-transparent border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setBaseUrl(newServerUrl);
                setShowSettings(false);
                toast({ title: "Settings Updated", description: "Server URL changed" });
                window.location.reload();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards - Theme Aware */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card/50 backdrop-blur-xl border-border hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{devices.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-border hover:border-destructive/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{lockedDevices.length}</p>
                  <p className="text-xs text-muted-foreground">Locked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-border hover:border-green-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Unlock className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeDevices.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-border hover:border-amber-500/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">₹{(totalEmiPending / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add - Theme Aware */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="icon"
            className="shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-primary/30"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Device List - Theme Aware */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Devices ({filteredDevices.length})
          </h2>

          {filteredDevices.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-xl border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No devices found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
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

      {/* Modals */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {selectedDeviceId && (
        <DeviceDetailModal
          device={getDeviceById(selectedDeviceId)!}
          onClose={() => setSelectedDeviceId(null)}
        />
      )}

      {paymentDeviceId && (
        <PaymentRecordModal
          device={getDeviceById(paymentDeviceId)!}
          onClose={() => setPaymentDeviceId(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
