import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Smartphone, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(mobile, pin)) {
      toast({
        title: 'Welcome Back',
        description: 'Login successful',
      });
      navigate('/admin/dashboard', { replace: true });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid mobile number or PIN',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-card/50 backdrop-blur-xl border border-border hover:bg-card"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </Button>
      </div>

      {/* Mobile-Only Container */}
      <div className="w-full max-w-sm">
        {/* Premium Card */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>

          {/* Main Card */}
          <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-primary/50">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Nama EMI</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mobile Number Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                    className="pl-12 h-14 bg-background border-input text-foreground placeholder:text-muted-foreground rounded-xl text-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-muted-foreground">10 digit mobile number</p>
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  PIN
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  required
                  className="h-14 bg-background border-input text-foreground placeholder:text-muted-foreground rounded-xl text-2xl tracking-widest text-center focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">4 digit PIN</p>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] mt-6"
              >
                Login
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="text-foreground font-mono">9876543210</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">PIN:</span>
                <span className="text-foreground font-mono">1234</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Secure device management platform
              </p>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">v1.0.5 • Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
