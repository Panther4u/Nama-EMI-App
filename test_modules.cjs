try {
    const device = require.resolve('@capacitor/device');
    console.log('Device module found at:', device);
} catch (e) {
    console.error('Device module NOT found');
}

try {
    const network = require.resolve('@capacitor/network');
    console.log('Network module found at:', network);
} catch (e) {
    console.error('Network module NOT found');
}
