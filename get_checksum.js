const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const homeDir = os.homedir();
const keystorePath = path.join(homeDir, '.android', 'debug.keystore');

console.log('Looking for keystore at:', keystorePath);

const cmd = `keytool -list -v -keystore "${keystorePath}" -alias androiddebugkey -storepass android -keypass android`;

exec(cmd, (error, stdout, stderr) => {
    const output = stdout || stderr || '';

    // Look for SHA256
    const match = output.match(/SHA256:\s*([A-Fa-f0-9:]+)/);

    if (match) {
        const checksum = match[1];
        console.log('Found Checksum:', checksum);
        fs.writeFileSync('checksum_result.txt', checksum);
    } else {
        console.log('Checksum not found in output.');
        console.log('Full Output:', output);
        fs.writeFileSync('checksum_result.txt', 'NOT_FOUND\n' + output);
    }
});
