const https = require('https');

const data = JSON.stringify({
    id: `TEST-${Date.now()}`,
    customerName: "Test User",
    mobileNo: "9999988888",
    aadharNo: "111122223333",
    address: "Test Address",
    imei1: `IMEI-${Date.now()}`,
    imei2: `IMEI2-${Date.now()}`,
    deviceModel: "Test Device",
    emiDetails: {
        financeName: "Test Fin",
        totalAmount: 5000,
        emiAmount: 500,
        tenure: 10,
        nextDueDate: "2025-01-01"
    }
});

const options = {
    hostname: 'nama-emi-app.onrender.com',
    port: 443,
    path: '/api/devices',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('--- Sending Request to Render ---');
const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE:', body);
    });
});

req.on('error', (e) => {
    console.error(`PROBLEM: ${e.message}`);
});

req.write(data);
req.end();
