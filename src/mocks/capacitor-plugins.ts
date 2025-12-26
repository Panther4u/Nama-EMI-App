export const Device = {
    getBatteryInfo: async () => ({ batteryLevel: 1, isCharging: true }),
    getInfo: async () => ({ osVersion: 'Mock', name: 'Mock' }),
};
export const Network = {
    getStatus: async () => ({ connected: true, connectionType: 'wifi' }),
};
