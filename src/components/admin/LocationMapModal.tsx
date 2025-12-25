import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { useDevices } from '@/context/DeviceContext';
import { Device } from '@/types/device';

interface LocationMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    deviceId: string;
}

const LocationMapModal: React.FC<LocationMapModalProps> = ({ isOpen, onClose, deviceId }) => {
    const { getDeviceById, startTracking, stopTracking } = useDevices();
    const device = getDeviceById(deviceId);
    const [loading, setLoading] = useState(false);

    if (!device) return null;

    const handleStartTracking = () => {
        setLoading(true);
        startTracking(deviceId);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    const handleStopTracking = () => {
        stopTracking(deviceId);
    };

    if (!isOpen) return null;

    const mapUrl = `https://maps.google.com/maps?q=${device.location.lat},${device.location.lng}&z=15&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${device.location.lat},${device.location.lng}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        Live Location - {device.customerName}
                    </DialogTitle>
                    <DialogDescription>
                        {device.isTracking
                            ? <span className="flex items-center text-green-600 gap-1"><span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> Tracking Active - Updated {new Date(device.location.lastUpdated).toLocaleTimeString()}</span>
                            : <span className="text-muted-foreground">Last Known Location - {new Date(device.location.lastUpdated).toLocaleString()}</span>
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 rounded-md overflow-hidden border bg-muted relative">
                    {/* Fallback for "No Location" or "Pending" could go here */}
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={mapUrl}
                        title="Device Location"
                    />
                    {device.isTracking && loading && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                <p className="font-medium">Requesting position update...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                        <p className="font-mono text-xs">Lat: {device.location.lat.toFixed(6)}, Lng: {device.location.lng.toFixed(6)}</p>
                    </div>
                    <div className="flex gap-2">
                        {!device.isTracking ? (
                            <Button onClick={handleStartTracking} variant="default" className="gap-2">
                                <Navigation className="w-4 h-4" />
                                Start Tracking
                            </Button>
                        ) : (
                            <Button onClick={handleStopTracking} variant="destructive" className="gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> {/* Or Stop Icon */}
                                Stop Tracking
                            </Button>
                        )}

                        <Button variant="outline" className="gap-2" onClick={() => window.open(directionsUrl, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                            Get Directions
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LocationMapModal;
