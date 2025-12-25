import { useState, useEffect } from 'react';
import packageJson from '../../package.json';

interface VersionInfo {
    version: string;
    downloadUrl: string;
    forceUpdate: boolean;
    releaseNotes?: string;
}

export const useAppUpdate = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const checkUpdate = async () => {
        setLoading(true);
        try {
            // In a real app, this would be an API call
            // const response = await fetch('/api/version');
            // const data = await response.json();

            // Simulating API response for now 
            // Replace this with actual API call
            const data = {
                version: '0.0.0', // Keeping it same as package.json so it doesn't trigger by default
                downloadUrl: 'https://example.com/download',
                forceUpdate: false,
                releaseNotes: 'Bug fixes and performance improvements.'
            };

            const currentVersion = packageJson.version;
            const serverVersion = data.version;

            if (compareVersions(serverVersion, currentVersion) > 0) {
                setUpdateAvailable(true);
                setVersionInfo(data);
            }
        } catch (error) {
            console.error('Failed to check for updates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUpdate();
    }, []);

    return { updateAvailable, versionInfo, loading, checkUpdate };
};

// Helper function to compare semantic versions
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}
