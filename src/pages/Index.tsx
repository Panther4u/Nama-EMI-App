import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Smartphone,
  Lock,
  MapPin,
  QrCode,
  CreditCard,
  Users,
  ArrowRight,
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: 'Remote Lock',
      description: 'Lock devices for unpaid EMIs',
    },
    {
      icon: MapPin,
      title: 'GPS Tracking',
      description: 'Real-time location tracking',
    },
    {
      icon: QrCode,
      title: 'QR Setup',
      description: 'Easy device provisioning',
    },
    {
      icon: CreditCard,
      title: 'EMI Tracking',
      description: 'Payment management',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Mobile-Only Hero Section */}
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise Security
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Nama EMI
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Secure device management for finance companies. Lock, track, and control EMI devices.
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => navigate('/admin')} className="w-full gap-2">
              <Shield className="w-5 h-5" />
              Admin Portal
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/mobile')} className="w-full gap-2">
              <Smartphone className="w-5 h-5" />
              Mobile Demo
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </div>

        {/* Features Grid - Mobile 2 Column */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm">{feature.title}</CardTitle>
                <CardDescription className="text-xs">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Demo Cards - Mobile Single Column */}
        <div className="space-y-4">
          <Card className="border-primary/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/admin')}>
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage devices, customers, and EMI tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full gap-2">
                Open Admin Panel
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-muted hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/mobile')}>
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>Mobile Client</CardTitle>
              <CardDescription>
                See how devices appear to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full gap-2">
                View Mobile Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
