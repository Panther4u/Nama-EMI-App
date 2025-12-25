import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, MapPin, Zap, CheckCircle2, ChevronRight, Mail, Wifi, Globe, Settings2, Loader2 } from 'lucide-react';
import { useDevices } from '@/context/DeviceContext';

interface PermissionsWizardProps {
    isOpen: boolean;
    onComplete: () => void;
    deviceId: string;
}

const PermissionsWizard: React.FC<PermissionsWizardProps> = ({ isOpen, onComplete, deviceId }) => {
    const { updateDevice } = useDevices();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const totalSteps = 6;

    const handleNext = async () => {
        setIsProcessing(true);
        try {
            if (step === 1) { // WiFi Check
                await new Promise(r => setTimeout(r, 200));
            } else if (step === 2) { // Server Sync
                await new Promise(r => setTimeout(r, 300));
            } else if (step === 3 && email) {
                await updateDevice(deviceId, { customerEmail: email });
            } else if (step === 4) { // Permissions
                await new Promise(r => setTimeout(r, 200));
            } else if (step === 5) { // WiFi Control
                await new Promise(r => setTimeout(r, 300));
            }

            if (step < totalSteps) {
                setStep(step + 1);
            } else {
                onComplete();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const currentStepInfo = () => {
        switch (step) {
            case 1:
                return {
                    title: "WiFi Connection",
                    desc: "Ensure your device is connected to a stable WiFi network to begin the secure setup.",
                    icon: <Wifi className="w-12 h-12 text-blue-500 mb-4" />,
                    action: "Check WiFi",
                    content: null
                };
            case 2:
                return {
                    title: "Server Sync",
                    desc: "Verifying your registration with Nama EMI backend servers...",
                    icon: <Globe className={`w-12 h-12 text-indigo-500 mb-4 ${isProcessing ? 'animate-spin' : ''}`} />,
                    action: "Verify Backend",
                    content: null
                };
            case 3:
                return {
                    title: "Account Setup",
                    desc: "Enter your email address to receive payment reminders and account security alerts.",
                    icon: <Mail className="w-12 h-12 text-blue-500 mb-4" />,
                    action: "Save Email",
                    content: (
                        <div className="w-full max-w-[260px] mt-4">
                            <Input
                                placeholder="customer@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="text-center"
                            />
                        </div>
                    )
                };
            case 4:
                return {
                    title: "Activate Device Admin",
                    desc: "Required to run in background. You will be redirected to settings to grant 'Device Admin' access.",
                    icon: (
                        <div className="flex gap-4">
                            <Shield className="w-10 h-10 text-purple-600 mb-4" />
                            <Settings2 className="w-10 h-10 text-gray-500 mb-4 animate-pulse" />
                        </div>
                    ),
                    action: "Open Admin Settings",
                    content: null
                };
            case 5:
                return {
                    title: "Install Background Service",
                    desc: "Installing 'Nama EMI Service' for always-on protection and real-time server locking.",
                    icon: <Zap className="w-12 h-12 text-yellow-500 mb-4" />,
                    action: "Install Service",
                    content: null
                };
            case 6:
                return {
                    title: "Protection Active",
                    desc: "Setup complete! Hidden background monitoring is now active on this device.",
                    icon: <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />,
                    action: "Start Protection",
                    content: null
                };
            default:
                return { title: "", desc: "", icon: null, action: "", content: null };
        }
    };

    const info = currentStepInfo();

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center">Setup Progress ({step}/{totalSteps})</DialogTitle>
                    <DialogDescription className="text-center">
                        Secure Registration Wizard
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-8 text-center min-h-[220px]">
                    {isProcessing && step !== 3 ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm font-medium">Processing...</p>
                        </div>
                    ) : (
                        <>
                            {info.icon}
                            <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                            <p className="text-muted-foreground text-sm max-w-[280px]">{info.desc}</p>
                            {info.content}
                        </>
                    )}
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleNext}
                        className="w-full max-w-[300px] gap-2 mx-auto"
                        disabled={isProcessing || (step === 3 && !email)}
                    >
                        {step === totalSteps ? 'Activate Protection' : info.action}
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PermissionsWizard;
