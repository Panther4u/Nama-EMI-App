#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting Rebuild and Deploy Process..."

# 0. Ensure Keystore Exists
KEYSTORE_PATH="android/app/release.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "🔑 Generating Missing Keystore at $KEYSTORE_PATH..."
    keytool -genkey -noprompt -v -keystore "$KEYSTORE_PATH" -alias release -keyalg RSA -keysize 2048 -validity 10000 -storepass password123 -keypass password123 -dname "CN=Nama EMI, OU=Mobile, O=Nama, L=India, S=TN, C=IN"
else
    echo "✅ Keystore found."
fi

# 0.5 Build Frontend & Sync
echo "🏗️ Building React Frontend..."
npm run build
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# 1. Build Release APK
echo "📦 Building Release APK..."
cd android
./gradlew assembleRelease
cd ..

# 2. Extract Checksum & Update .env
echo "🔐 Extracting Checksum and Updating .env..."
node extract_release_checksum.js

# 3. Copy APK to Server Public Folder
echo "Bg Copying APK to Server Downloads..."
mkdir -p server/public/downloads
cp android/app/build/outputs/apk/release/app-release.apk server/public/downloads/app.apk

# 4. Git Push
echo "⬆️ Pushing to GitHub..."
git add .
git commit -m "Deploy: Automated Rebuild & Update $(date)" || echo "No changes to commit"
git push origin main

echo "✅ DONE! Structure Updated."
echo "👉 Now: Restart 'npm run dev' to load the new checksum."
echo "👉 Then: Wait 2 mins for Render to deploy the new APK."
