const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const apkPath = path.join(__dirname, 'android/app/build/outputs/apk/release/app-release.apk');
const envPath = path.join(__dirname, '.env');
const envProdPath = path.join(__dirname, '.env.production');

try {
    const fileBuffer = fs.readFileSync(apkPath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    const base64 = Buffer.from(hex, 'hex').toString('base64url');

    console.log(`Checksum (Base64 URL): ${base64}`);

    // Update .env
    let envContent = fs.readFileSync(envPath, 'utf8');
    const regex = /VITE_ANDROID_CHECKSUM=.*/g;
    const newLine = `VITE_ANDROID_CHECKSUM=${base64}`;

    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
    } else {
        envContent += `\n${newLine}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env');

    // Update .env.production
    let envProdContent = fs.readFileSync(envProdPath, 'utf8');
    if (regex.test(envProdContent)) {
        envProdContent = envProdContent.replace(regex, newLine);
    } else {
        envProdContent += `\n${newLine}`;
    }
    fs.writeFileSync(envProdPath, envProdContent);
    console.log('Updated .env.production');

} catch (err) {
    console.error('Error:', err);
}
