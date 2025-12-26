const https = require('https');

const options = {
    hostname: 'nama-emi-app.onrender.com',
    port: 443,
    path: '/api/devices',
    method: 'DELETE',
};

console.log('--- Clearing Database on Render ---');
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

req.end();
