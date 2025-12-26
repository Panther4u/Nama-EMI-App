const fs = require('fs');
const path = require('path');

// 1. Get the Hex Checksum provided by the user
const hexChecksum = "1E:B5:C7:70:21:EE:05:C2:5E:F4:CD:38:89:69:20:49:3E:7E:8A:29:DD:D1:2F:85:A3:0A:B2:B6:B9:56:CF:A5";

console.log("Original Hex:", hexChecksum);

// 2. Convert to Buffer
const cleanHex = hexChecksum.replace(/:/g, '');
const buffer = Buffer.from(cleanHex, 'hex');

// 3. Convert to Base64
const base64 = buffer.toString('base64');

// 4. Make URL Safe (Replace + with -, / with _, remove padding =)
const urlSafeChecksum = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

console.log("Converted Base64 (URL-Safe):", urlSafeChecksum);

// 5. Update .env.production
const envPath = path.resolve('.env.production');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace existing VITE_ANDROID_CHECKSUM or append if missing
if (envContent.includes('VITE_ANDROID_CHECKSUM=')) {
    envContent = envContent.replace(/VITE_ANDROID_CHECKSUM=.*/, `VITE_ANDROID_CHECKSUM=${urlSafeChecksum}`);
} else {
    envContent += `\nVITE_ANDROID_CHECKSUM=${urlSafeChecksum}\n`;
}

fs.writeFileSync(envPath, envContent);
console.log("Updated .env.production successfully.");
