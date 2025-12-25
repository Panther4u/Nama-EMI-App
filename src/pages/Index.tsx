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
      title: 'Remote Device Lock',
      description: 'Instantly lock customer devices for unpaid EMIs',
    },
    {
      icon: MapPin,
      title: 'Location Tracking',
      description: 'Real-time GPS tracking for locked devices',
    },
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Generate QR codes with customer & device details',
    },
    {
      icon: CreditCard,
      title: 'EMI Management',
      description: 'Track EMI payments and due dates',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise-Grade Security
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Nama EMI App
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Secure mobile device management for finance companies. Lock, track, and control
            EMI-financed devices with military-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/admin')} className="gap-2">
              <Shield className="w-5 h-5" />
              Admin Portal
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/mobile')} className="gap-2">
              <Smartphone className="w-5 h-5" />
              Mobile Client Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer" onClick={() => navigate('/admin')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Full control panel for managing devices, customers, and EMI tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2">
                Open Admin Panel
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-muted hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/mobile')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>Mobile Client View</CardTitle>
              <CardDescription>
                See how locked/unlocked devices appear to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                View Mobile Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
      </div>
    </div>
  );
};

export default Index;
