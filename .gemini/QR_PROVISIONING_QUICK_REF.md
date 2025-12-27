# 🚀 QR Provisioning - Quick Reference Card

## ⚡ Quick Setup (30-60 seconds)

### 1️⃣ ADMIN SIDE
```
✓ Login to admin panel
✓ Add customer details
✓ Click "Add Device"
✓ QR code appears
```

### 2️⃣ DEVICE SIDE
```
✓ Factory reset device
✓ Power on → Welcome screen
✓ Tap screen 6 times quickly
✓ QR scanner appears
✓ Scan admin's QR code
✓ Wait for automatic setup
✓ App launches → DONE!
```

---

## 🎯 What Happens Automatically

| Step | Time | Screen Shows |
|------|------|--------------|
| QR Scan | 2s | "Checking info..." |
| Download APK | 15s | Progress bar (3MB) |
| Verify | 2s | "Verifying app..." |
| Install | 8s | "Installing..." |
| Setup Profile | 5s | "Setting up work profile..." |
| Launch | 3s | Splash screen → Dashboard |

**Total: ~35 seconds** ⏱️

---

## ❌ Common Errors & Quick Fixes

### Error: "Couldn't download the admin app"
```bash
Problem: APK not accessible
Fix: Check server is running
     Verify: curl -I https://nama-emi-app.onrender.com/downloads/app.apk
```

### Error: "Can't verify app"
```bash
Problem: Checksum mismatch
Fix: Update .env with correct checksum
     Run: node extract_release_checksum.js
     Deploy: git push
```

### Error: "Installation failed"
```bash
Problem: Corrupted APK
Fix: Rebuild APK
     Run: ./rebuild_and_deploy.sh
```

### Error: App installs but doesn't launch
```bash
Problem: Intent filter missing
Fix: Check AndroidManifest.xml
     Verify: ProvisioningCompleteActivity registered
```

### Error: Blank screen after launch
```bash
Problem: No provisioning data
Fix: Check AdminReceiver saves to SharedPreferences
     Verify: MobileClient.tsx reads correct keys
```

---

## 🔍 Quick Debug Commands

```bash
# Check if server is live
curl https://nama-emi-app.onrender.com/api/health

# Check APK availability
curl -I https://nama-emi-app.onrender.com/downloads/app.apk

# Get APK checksum
shasum -a 256 server/public/downloads/app.apk | \
  awk '{print $1}' | xxd -r -p | base64 | \
  tr '+/' '-_' | tr -d '='

# View device logs (if connected via USB)
adb logcat | grep -E "Nama|EMI|Provisioning"

# Check SharedPreferences on device
adb shell run-as com.nama.emi.app cat \
  /data/data/com.nama.emi.app/shared_prefs/CapacitorStorage.xml
```

---

## ✅ Success Checklist

After QR scan, verify:

- [ ] No error messages appeared
- [ ] App launched automatically
- [ ] Customer name is displayed
- [ ] Device shows in admin panel
- [ ] Lock/unlock works from admin
- [ ] Cannot uninstall app
- [ ] "Nama EMI Device" in Settings

---

## 📱 Device Requirements

- **Android Version**: 7.0+ (API 24+)
- **State**: Factory reset or brand new
- **Network**: WiFi/Mobile data active
- **Storage**: 50MB free space minimum

---

## 🔐 What Gets Installed

**Package**: `com.nama.emi.app`  
**Size**: ~3 MB  
**Permissions**: Device Owner (full control)  
**Profile**: "Nama EMI Device"  
**Protection**: Cannot uninstall, survives factory reset

---

## 🎨 QR Code Contents

```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": 
    "com.nama.emi.app/com.nama.emi.app.AdminReceiver",
  
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": 
    "https://nama-emi-app.onrender.com/downloads/app.apk",
  
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": 
    "xNb-JEfRyrYlRp7U3xenusy7JUG37k8eQDfQqrKX2I4",
  
  "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": true,
  
  "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
  
  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
    "deviceId": "DEV-xxxxx",
    "customerName": "Customer Name",
    "serverUrl": "https://nama-emi-app.onrender.com"
  }
}
```

---

## 🔄 Re-Provisioning

**To provision again:**
1. Factory reset device
2. Follow setup steps again
3. Scan new QR code

**Note**: Cannot provision over existing setup!

---

## 📞 Emergency Commands

```bash
# Force stop app (requires USB debugging)
adb shell am force-stop com.nama.emi.app

# Clear app data (requires USB debugging)
adb shell pm clear com.nama.emi.app

# Remove device owner (requires USB debugging)
adb shell dpm remove-active-admin \
  com.nama.emi.app/.AdminReceiver

# Uninstall (only works after removing device owner)
adb uninstall com.nama.emi.app
```

⚠️ **Warning**: These commands should only be used for testing/debugging!

---

## 🌐 URLs

- **Production**: https://nama-emi-app.onrender.com
- **APK Download**: https://nama-emi-app.onrender.com/downloads/app.apk
- **API Health**: https://nama-emi-app.onrender.com/api/health
- **GitHub**: https://github.com/Panther4u/Nama-EMI-App
- **Render Dashboard**: https://dashboard.render.com

---

## 📊 Monitoring

**Check deployment status:**
- Render Dashboard → Nama-EMI-App service
- Look for "Live" status (green)
- Check recent deployments

**Check device status:**
- Admin Panel → Devices list
- Look for device ID
- Check "Last Seen" timestamp
- Verify lock status

---

## 💡 Pro Tips

1. **Keep QR code secure** - Contains sensitive provisioning data
2. **Test on spare device first** - Before customer deployment
3. **Stable WiFi required** - For APK download (3MB)
4. **Screenshot QR code** - For backup/reference
5. **Note device ID** - For tracking in admin panel
6. **Check server before scan** - Ensure APK is accessible
7. **Factory reset only** - Cannot provision over existing setup

---

**Version**: 1.0.5  
**Last Updated**: 2025-12-27  
**Status**: ✅ Production Ready
