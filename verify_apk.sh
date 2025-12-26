#!/bin/bash
echo "🔍 Starting Diagnostic Check..."

# 1. Server APK Network Check
echo "globe_with_meridians Checking APK URL..."
curl -I https://nama-emi-app.onrender.com/downloads/app.apk
echo "--------------------------------"

# 2. Checksum Comparison
echo "🔐 Comparing Checksums..."
echo "Local (Calculated from build source):"
node extract_release_checksum.js
echo "Server (Downloaded just now):"
curl -s -o temp_check.apk https://nama-emi-app.onrender.com/downloads/app.apk
openssl dgst -sha256 -binary temp_check.apk | openssl base64 | tr -d '=' | tr '/+' '_-'
rm temp_check.apk
echo "--------------------------------"

# 3. ADB Provisioning Test
echo "📱 Attempting ADB Provisioning (Nuclear Test)..."
echo "⚠️  Ensure phone is connected and USB Debugging is ON."
adb devices
echo "Running: dpm set-device-owner..."
adb shell dpm set-device-owner com.nama.emi.app/com.nama.emi.app.AdminReceiver
