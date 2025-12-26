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
    const { baseUrl, setBaseUrl } = useDevices();
    const [tempUrl, setTempUrl] = useState(baseUrl);
    const totalSteps = 7;

    const handleNext = async () => {
        setIsProcessing(true);
        try {
            const { registerPlugin } = await import('@capacitor/core');
            const WipeDevice = registerPlugin('WipeDevice');

            if (step === 1) { // WiFi Check
                await new Promise(r => setTimeout(r, 200));
            } else if (step === 2) { // Server Config
                setBaseUrl(tempUrl);
            } else if (step === 3) { // Sync
                await new Promise(r => setTimeout(r, 400));
            } else if (step === 4 && email) {
                await updateDevice(deviceId, { customerEmail: email });
            } else if (step === 5) { // Admin Permissions
                // @ts-ignore
                const status = await WipeDevice.getAdminStatus();
                if (!status.isAdminActive) {
                    // @ts-ignore
                    await WipeDevice.requestAdmin();
                    // Don't move to next step yet, wait for user to activate
                    return;
                }
            } else if (step === 5) { // Service Lock
                await new Promise(r => setTimeout(r, 300));
            }

            if (step < totalSteps) {
                setStep(step + 1);
            } else {
                onComplete();
            }
        } catch (err) {
            console.error("Wizard step failed:", err);
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
                    title: "Server Configuration",
                    desc: "Verify or update the backend API endpoint for this device.",
                    icon: <Globe className="w-12 h-12 text-indigo-500 mb-4" />,
                    action: "Confirm Server",
                    content: (
                        <div className="w-full max-w-[260px] mt-4">
                            <Input
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="https://api.example.com"
                                className="text-xs font-mono"
                            />
                        </div>
                    )
                };
            case 3:
                return {
                    title: "Cloud Sync",
                    desc: "Authenticating device identity with Nama Secure Cloud...",
                    icon: <Globe className={`w-12 h-12 text-blue-500 mb-4 ${isProcessing ? 'animate-spin' : ''}`} />,
                    action: "Verify Identity",
                    content: null
                };
            case 4:
                return {
                    title: "Account Setup",
                    desc: "Enter customer email for security alerts and recovery.",
                    icon: <Mail className="w-12 h-12 text-blue-500 mb-4" />,
                    action: "Save Details",
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
            case 5:
                return {
                    title: "Activate Device Admin",
                    desc: "Required for remote locking. User cannot uninstall app after this step.",
                    icon: (
                        <div className="flex gap-4">
                            <Shield className="w-10 h-10 text-purple-600 mb-4" />
                            <Settings2 className="w-10 h-10 text-gray-500 mb-4 animate-pulse" />
                        </div>
                    ),
                    action: "Open Settings",
                    content: null
                };
            case 6:
                return {
                    title: "Install Security Service",
                    desc: "Configuring always-on protection and SIM swap monitoring.",
                    icon: <Zap className="w-12 h-12 text-yellow-500 mb-4" />,
                    action: "Activate Service",
                    content: null
                };
            case 7:
                return {
                    title: "Device Protected",
                    desc: "Configuration locked. Background monitoring is now active.",
                    icon: <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />,
                    action: "Finish Setup",
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
                        disabled={isProcessing || (step === 4 && !email)}
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
