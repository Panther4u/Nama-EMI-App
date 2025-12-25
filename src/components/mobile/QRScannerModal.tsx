import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Camera, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (data: any) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    const handleResult = (result: any, error: any) => {
        if (result) {
            try {
                const parsed = JSON.parse(result?.text);

                // Handle Android Enterprise Format
                let data = parsed;
                if (parsed["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"]) {
                    data = parsed["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"];
                }

                onScanSuccess(data);
                onClose();
            } catch (e) {
                // Only show error toast if we haven't already to avoid spamming
                if (!error) {
                    toast({
                        variant: "destructive",
                        title: "Invalid QR Code",
                        description: "The scanned QR code is not a valid device configuration."
                    });
                    setError("Invalid QR format");
                }
            }
        }
        if (error) {
            // console.info(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black text-white border-zinc-800">
                <DialogHeader className="p-4 bg-zinc-900 flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Camera className="w-5 h-5" />
                        Scan Device QR
                    </DialogTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </DialogHeader>

                <div className="relative aspect-square w-full bg-black">
                    {isOpen && (
                        <QrReader
                            onResult={handleResult}
                            constraints={{ facingMode: 'environment' }}
                            className="w-full h-full"
                            containerStyle={{ width: '100%', height: '100%' }}
                            videoContainerStyle={{ paddingTop: 0 }} // Override default padding
                            videoStyle={{ objectFit: 'cover' }}
                        />
                    )}
                    <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none m-12 rounded-lg opacity-50 animate-pulse"></div>
                </div>

                <div className="p-4 bg-zinc-900 text-center text-sm text-zinc-400">
                    Align the QR code within the frame to register.
                </div>
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10 gap-1 text-xs"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-none gap-2"
                        onClick={() => window.alert(
                            `TROUBLESHOOTING GUIDE:

1. Compatibility: Ensure Android version is compatible.
2. Verify QR: Check if code is expired (Ask IT).
3. WiFi: Ensure stable connection.
4. Camera: Try Google Lens if this scanner fails.
5. Reset: Factory reset device if stuck.
6. Alt Method: Use Manual ID Entry (Home Screen).`
                        )}
                    >
                        <HelpCircle className="w-4 h-4" />
                        Troubleshooting Help
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QRScannerModal;
