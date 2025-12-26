import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Device, FeatureLocks, PaymentRecord } from '@/types/device';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';


interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Omit<Device, 'id' | 'qrCodeData' | 'registeredAt'>) => Promise<{ success: boolean; device?: Device; error?: string }>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  lockDevice: (id: string) => Promise<void>;
  unlockDevice: (id: string) => Promise<void>;
  updateFeatureLocks: (id: string, locks: Partial<FeatureLocks>) => Promise<void>;
  getDeviceById: (id: string) => Device | undefined;
  fetchDeviceById: (id: string) => Promise<Device | undefined>;
  recordPayment: (deviceId: string, payment: Omit<PaymentRecord, 'id' | 'recordedAt'>) => Promise<void>;
  currentViewDevice: string | null;
  setCurrentViewDevice: (id: string | null) => void;
  startTracking: (id: string) => Promise<void>;
  stopTracking: (id: string) => Promise<void>;
  updateLocation: (id: string, lat: number, lng: number) => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const generateQRData = (device: Partial<Device> & { serverIp?: string }): string => {
  const adminExtras = {
    id: device.id,
    name: device.customerName,
    email: device.customerEmail,
    imei1: device.imei1,
    imei2: device.imei2,
    mobile: device.mobileNo,
    aadhar: device.aadharNo,
    address: device.address,
  };

  // Use production URL by default, fallback to provided IP for local testing
  const host = device.serverIp ? `http://${device.serverIp}:5000` : 'https://nama-emi-app.onrender.com';
  const downloadUrl = `${host}/downloads/app.apk`;

  return JSON.stringify({
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.nama.emi.app/com.nama.emi.app.AdminReceiver",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "TO9WQFAq5nWMWeBHGEv1BpMIkN7X8RUkxCbUxI7xxcU",
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": downloadUrl,
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": adminExtras
  });
};

const generateId = (): string => {
  return `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentViewDevice, setCurrentViewDevice] = useState<string | null>(null);

  // Fetch devices from backend on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/devices`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched all devices. Count:', data.length);
        setDevices(data);
      } else {
        console.error('Failed to fetch devices');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const addDevice = async (deviceData: Omit<Device, 'id' | 'qrCodeData' | 'registeredAt'>): Promise<{ success: boolean; device?: Device; error?: string }> => {
    const id = generateId();
    const newDevice: Device = {
      ...deviceData,
      id,
      registeredAt: new Date(),
      qrCodeData: generateQRData({ ...deviceData, id }),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        console.log('Device added to backend successfully:', newDevice.id);
        setDevices(prev => {
          console.log('Updating devices state with new device. Prev count:', prev.length);
          return [...prev, newDevice];
        });
        return { success: true, device: newDevice };
      }
      else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error: any) {
      console.error('Error adding device:', error);
      return { success: false, error: 'Network error or server unreachable' };
    }
  };

  const updateDevice = async (id: string, updates: Partial<Device>) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      }
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDevices(prev => prev.filter(d => d.id !== id));
      } else {
        console.error('Failed to delete device');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const lockDevice = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/devices/${id}/lock`, { method: 'POST' });
      setDevices(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            isLocked: true,
            featureLocks: { camera: true, network: true, wifi: true, powerOff: true, reset: true },
          };
        }
        return d;
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const unlockDevice = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/devices/${id}/unlock`, { method: 'POST' });
      setDevices(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            isLocked: false,
            featureLocks: { camera: false, network: false, wifi: false, powerOff: false, reset: false },
          };
        }
        return d;
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const updateFeatureLocks = async (id: string, locks: Partial<FeatureLocks>) => {
    // This is complex because backend expects full update on PUT /:id or specific route?
    // I implemented generic PUT /:id so I can just update the object.
    const device = devices.find(d => d.id === id);
    if (!device) return;

    const newLocks = { ...device.featureLocks, ...locks };

    try {
      await updateDevice(id, { featureLocks: newLocks });
    } catch (err) { console.error(err); }
  };

  const recordPayment = async (deviceId: string, paymentData: Omit<PaymentRecord, 'id' | 'recordedAt'>) => {
    const payment = {
      ...paymentData,
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recordedAt: new Date(),
    };

    // Need to calculate next due date logic here or backend?
    // Backend route `POST /:id/payment` expects `payment` and `nextDueDate`.
    // I need to calculate nextDueDate here to send it.
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const currentDueDate = new Date(device.emiDetails.nextDueDate);
    currentDueDate.setMonth(currentDueDate.getMonth() + 1);

    try {
      const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment,
          nextDueDate: currentDueDate.toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        // Re-fetch to be safe or optimistic update
        fetchDevices();
      }
    } catch (err) { console.error(err); }
  };

  const startTracking = async (id: string) => {
    // Backend doesn't have startTracking route, it's just state usually.
    // I added isTracking to model. So I can just update it.
    await updateDevice(id, { isTracking: true });
  };

  const stopTracking = async (id: string) => {
    await updateDevice(id, { isTracking: false });
  };

  const updateLocation = async (id: string, lat: number, lng: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/devices/${id}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      // Optimistic update
      setDevices(prev => prev.map(d => d.id === id ? {
        ...d,
        location: { lat, lng, lastUpdated: new Date() }
      } : d));
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchDeviceById = async (id: string): Promise<Device | undefined> => {
    console.log('Fetching device by ID:', id);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s fetch timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('Device found:', data.id);
        setDevices(prev => {
          const exists = prev.find(d => d.id === id);
          if (exists) return prev.map(d => d.id === id ? data : d);
          return [...prev, data];
        });
        return data;
      }
      console.warn('Device not found on server:', id);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Fetch aborted due to timeout');
      } else {
        console.error('Error fetching device:', error);
      }
    }
    return undefined;
  };

  const getDeviceById = (id: string) => devices.find(d => d.id === id);

  return (
    <DeviceContext.Provider value={{
      devices,
      addDevice,
      updateDevice,
      deleteDevice,
      lockDevice,
      unlockDevice,
      updateFeatureLocks,
      getDeviceById,
      fetchDeviceById,
      recordPayment,
      currentViewDevice,
      setCurrentViewDevice,
      startTracking,
      stopTracking,
      updateLocation,
    }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within DeviceProvider');
  }
  return context;
};
