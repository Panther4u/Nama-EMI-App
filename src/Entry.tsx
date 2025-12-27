import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import AdminLogin from './pages/admin/AdminLogin';
import { Loader2 } from 'lucide-react';

const Entry = () => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkMode = async () => {
            try {
                // Check if this device is provisioned as an Agent
                const { value: deviceId } = await Preferences.get({ key: 'deviceId' });

                if (deviceId) {
                    console.log('Provisioned Device Detected. Redirecting to Agent Mode...');
                    navigate('/mobile');
                } else {
                    // Not provisioned, likely a Web Admin or unprovisioned device
                    console.log('No Device ID found. Showing Admin Login.');
                    setChecking(false);
                }
            } catch (error) {
                console.error('Error checking device mode:', error);
                setChecking(false);
            }
        };

        checkMode();
    }, [navigate]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // If not a provisioned device, show Admin Login
    return <AdminLogin />;
};

export default Entry;
