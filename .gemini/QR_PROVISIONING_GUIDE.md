# 📱 QR Provisioning Setup Guide - Step by Step

## Complete Workflow: From QR Scan to Device Ready

This guide covers the entire Android Work Profile provisioning process for the Nama EMI App.

---

## 🎯 Prerequisites

### Admin Side (Before QR Scan)
1. ✅ Admin logged into https://nama-emi-app.onrender.com
2. ✅ Customer details entered in the system
3. ✅ QR code generated and displayed
4. ✅ APK deployed to server at `/downloads/app.apk`

### Device Side
1. ✅ Android device (Android 7.0+)
2. ✅ Factory reset completed (or brand new device)
3. ✅ WiFi/Internet connection available
4. ✅ Device NOT yet set up (still on welcome screen)

---

## 📋 Step-by-Step Setup Process

### **Step 1: Initiate QR Provisioning Mode**

1. **Start the device** - Power on the factory-reset Android device
2. **Welcome Screen** - You'll see "Welcome" or "Let's set up your device"
3. **Tap 6 times** - Tap anywhere on the welcome screen **6 times quickly**
4. **QR Scanner appears** - Device will show "Scan QR code" screen

> **Note**: If tapping 6 times doesn't work, try:
> - Tapping 7 times on some devices
> - Looking for "Set up work device" option in setup menu
> - Checking if device supports QR provisioning (Android 7.0+)

---

### **Step 2: Scan the QR Code**

1. **Position QR Code** - Hold the admin panel QR code in front of the device camera
2. **Auto-scan** - Device will automatically detect and scan the QR code
3. **Processing** - You'll see "Checking info..." or similar message
4. **QR Data Extracted**:
   ```json
   {
     "deviceId": "DEV-xxxxx",
     "customerName": "Customer Name",
     "serverUrl": "https://nama-emi-app.onrender.com",
     "apkDownloadUrl": "https://nama-emi-app.onrender.com/downloads/app.apk"
   }
   ```

---

### **Step 3: Download & Install APK**

**What Happens Automatically:**

1. **Download Initiated**
   - Screen shows: "Downloading device management app..."
   - Progress bar appears
   - APK size: ~3 MB
   - Download from: `https://nama-emi-app.onrender.com/downloads/app.apk`

2. **Checksum Verification**
   - Android verifies SHA-256 checksum
   - Expected: `xNb-JEfRyrYlRp7U3xenusy7JUG37k8eQDfQqrKX2I4`
   - If mismatch: ❌ "Can't verify app" error
   - If match: ✅ Proceeds to installation

3. **APK Installation**
   - Screen shows: "Installing device management app..."
   - App installed as Device Owner
   - Package: `com.nama.emi.app`

**Possible Errors at This Stage:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Couldn't download the admin app" | APK not accessible at URL | Check server is running, APK exists |
| "Can't verify app" | Checksum mismatch | Update checksum in `.env` file |
| "Installation failed" | APK corrupted | Rebuild and redeploy APK |

---

### **Step 4: Provisioning Setup**

**What Happens:**

1. **Profile Creation**
   - Screen shows: "Setting up your work profile..."
   - Android creates managed profile
   - App set as Device Admin

2. **AdminReceiver Triggered**
   - `onProfileProvisioningComplete()` is called
   - Extracts provisioning extras:
     ```java
     deviceId, customerName, serverUrl
     ```
   - Saves to SharedPreferences:
     ```
     CapacitorStorage:
       - deviceId
       - customerName  
       - custom_api_url
       - isProvisioned: true
     ```

3. **Profile Named**
   - Profile name set to: "Nama EMI Device"
   - Visible in device settings

---

### **Step 5: First Launch**

**Automatic Launch:**

1. **ProvisioningCompleteActivity Triggered**
   - Intent: `android.app.action.PROVISIONING_SUCCESSFUL`
   - Activity launches with `Theme.NoDisplay`
   - Immediately redirects to MainActivity

2. **MainActivity Starts**
   - Capacitor initializes
   - React app loads
   - Splash screen displays

3. **MobileClient.tsx Loads**
   - Checks for provisioning data:
     ```typescript
     const deviceId = await Preferences.get({ key: 'deviceId' });
     const serverUrl = await Preferences.get({ key: 'custom_api_url' });
     ```
   - If found: Shows customer dashboard
   - If not found: Shows error/setup screen

---

### **Step 6: Device Registration Complete**

**User Sees:**

1. **Welcome Screen** (if implemented)
   - Customer name displayed
   - Device information shown
   - EMI details visible

2. **Main Dashboard**
   - Lock status indicator
   - Payment history
   - Next due date
   - Device controls (if unlocked)

3. **Background Services Start**
   - Location tracking (if enabled)
   - Status polling every 30 seconds
   - Lock enforcement checks

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN PANEL                                                  │
│ 1. Enter customer details                                    │
│ 2. Generate QR code                                          │
│ 3. Display QR code to customer                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DEVICE - PROVISIONING START                                  │
│ 1. Factory reset device                                      │
│ 2. Tap 6 times on welcome screen                             │
│ 3. QR scanner appears                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DEVICE - QR SCAN                                             │
│ 1. Scan QR code from admin panel                             │
│ 2. Extract provisioning data                                 │
│ 3. Validate data format                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DEVICE - APK DOWNLOAD                                        │
│ 1. Download from: /downloads/app.apk                         │
│ 2. Verify checksum (SHA-256)                                 │
│ 3. Install as Device Owner                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DEVICE - PROFILE SETUP                                       │
│ 1. Create work profile                                       │
│ 2. Set Device Admin permissions                              │
│ 3. Save provisioning data to storage                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DEVICE - APP LAUNCH                                          │
│ 1. ProvisioningCompleteActivity fires                        │
│ 2. Redirect to MainActivity                                  │
│ 3. Load React app (MobileClient.tsx)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DEVICE - READY                                               │
│ 1. Customer dashboard displayed                              │
│ 2. Backend connection established                            │
│ 3. Polling & tracking active                                 │
│ 4. Device ready for use                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 What Happens Behind the Scenes

### Android System Level

1. **QR Code Parsing**
   - Extracts JSON with provisioning parameters
   - Validates required fields:
     - `PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME`
     - `PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION`
     - `PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM`

2. **Download Manager**
   - Uses system DownloadManager
   - Downloads APK to cache
   - Verifies file integrity

3. **Package Installer**
   - Installs with INSTALL_DEVICE_OWNER flag
   - Grants admin permissions automatically
   - No user interaction required

### App Level (AdminReceiver.java)

```java
@Override
public void onProfileProvisioningComplete(Context context, Intent intent) {
    // 1. Get Device Policy Manager
    DevicePolicyManager dpm = (DevicePolicyManager) context
            .getSystemService(Context.DEVICE_POLICY_SERVICE);
    
    // 2. Extract provisioning extras
    PersistableBundle extras = intent.getParcelableExtra(
            DevicePolicyManager.EXTRA_PROVISIONING_ADMIN_EXTRAS_BUNDLE);
    
    // 3. Save to SharedPreferences
    SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
    prefs.edit()
        .putString("deviceId", extras.getString("deviceId"))
        .putString("customerName", extras.getString("customerName"))
        .putString("custom_api_url", extras.getString("serverUrl"))
        .putBoolean("isProvisioned", true)
        .apply();
    
    // 4. Set profile name
    dpm.setProfileName(admin, "Nama EMI Device");
    
    // 5. Launch app
    Intent launch = new Intent(context, ProvisioningCompleteActivity.class);
    launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(launch);
}
```

### App Level (MobileClient.tsx)

```typescript
useEffect(() => {
  const initDevice = async () => {
    // 1. Check if provisioned
    const { value: deviceId } = await Preferences.get({ key: 'deviceId' });
    const { value: serverUrl } = await Preferences.get({ key: 'custom_api_url' });
    
    if (deviceId && serverUrl) {
      // 2. Set API base URL
      setApiBaseUrl(serverUrl);
      
      // 3. Fetch device data from backend
      const response = await fetch(`${serverUrl}/api/devices/${deviceId}`);
      const deviceData = await response.json();
      
      // 4. Update UI with device data
      setDevice(deviceData);
      
      // 5. Start polling for status updates
      startPolling(deviceId, serverUrl);
    }
  };
  
  initDevice();
}, []);
```

---

## ⚠️ Common Issues & Troubleshooting

### Issue 1: "Can't set up device - Couldn't download the admin app"

**Cause**: APK not accessible at the download URL

**Debug Steps**:
```bash
# 1. Check if server is running
curl -I https://nama-emi-app.onrender.com/api/health

# 2. Check if APK exists
curl -I https://nama-emi-app.onrender.com/downloads/app.apk

# 3. Verify APK size (should be ~3MB)
ls -lh server/public/downloads/app.apk

# 4. Check server logs
tail -f server.log
```

**Solution**:
- Ensure `app.apk` exists in `server/public/downloads/`
- Verify server is deployed and running
- Check Render deployment logs

---

### Issue 2: "Can't verify app"

**Cause**: Checksum mismatch

**Debug Steps**:
```bash
# 1. Calculate actual APK checksum
shasum -a 256 server/public/downloads/app.apk | \
  awk '{print $1}' | xxd -r -p | base64 | \
  tr '+/' '-_' | tr -d '='

# 2. Check .env checksum
cat .env | grep CHECKSUM

# 3. Compare both values
```

**Solution**:
```bash
# Update checksum in .env
node extract_release_checksum.js

# Rebuild frontend
npm run build

# Redeploy
git add . && git commit -m "Update checksum" && git push
```

---

### Issue 3: App installs but doesn't launch

**Cause**: ProvisioningCompleteActivity not triggered

**Debug Steps**:
```bash
# 1. Check AndroidManifest.xml has intent filter
grep -A 5 "PROVISIONING_SUCCESSFUL" android/app/src/main/AndroidManifest.xml

# 2. Check AdminReceiver is registered
grep -A 10 "AdminReceiver" android/app/src/main/AndroidManifest.xml

# 3. Check device logs
adb logcat | grep "Nama EMI"
```

**Solution**:
- Verify AndroidManifest.xml has correct intent filters
- Ensure AdminReceiver extends DeviceAdminReceiver
- Check onProfileProvisioningComplete() is implemented

---

### Issue 4: App launches but shows blank screen

**Cause**: Provisioning data not saved or retrieved

**Debug Steps**:
```bash
# 1. Check SharedPreferences on device
adb shell run-as com.nama.emi.app cat \
  /data/data/com.nama.emi.app/shared_prefs/CapacitorStorage.xml

# 2. Check MobileClient.tsx logs
adb logcat | grep "MobileClient"

# 3. Verify API connection
adb logcat | grep "fetch"
```

**Solution**:
- Verify AdminReceiver saves data correctly
- Check MobileClient.tsx reads from correct keys
- Ensure serverUrl is valid and accessible

---

## 🧪 Testing Checklist

### Before QR Scan
- [ ] Admin panel accessible
- [ ] Device added to system
- [ ] QR code generated successfully
- [ ] APK deployed to server
- [ ] Checksum matches APK file

### During Provisioning
- [ ] QR scanner appears (6 taps)
- [ ] QR code scans successfully
- [ ] APK download starts
- [ ] Download completes (check progress)
- [ ] Checksum verification passes
- [ ] APK installation succeeds

### After Provisioning
- [ ] App launches automatically
- [ ] Customer name displayed
- [ ] Device data loaded
- [ ] Lock status shows correctly
- [ ] Backend connection working
- [ ] Polling active (check logs)

### Device Admin Features
- [ ] Device admin enabled
- [ ] Lock/unlock commands work
- [ ] Feature restrictions apply
- [ ] Location tracking works
- [ ] Cannot uninstall app
- [ ] Cannot disable admin

---

## 📊 Expected Timeline

| Step | Duration | What User Sees |
|------|----------|----------------|
| QR Scan | 2-3 sec | "Scanning..." |
| APK Download | 10-30 sec | Progress bar (3MB download) |
| Checksum Verify | 1-2 sec | "Verifying app..." |
| Installation | 5-10 sec | "Installing..." |
| Profile Setup | 3-5 sec | "Setting up work profile..." |
| App Launch | 2-3 sec | Splash screen |
| Data Load | 1-2 sec | Loading indicator |
| **Total** | **~30-60 sec** | **Device Ready** |

---

## 🎉 Success Indicators

When provisioning is successful, you should see:

1. ✅ **No error messages** during entire process
2. ✅ **App launches automatically** after provisioning
3. ✅ **Customer name displayed** on dashboard
4. ✅ **Device status shows** in admin panel
5. ✅ **Lock controls work** from admin panel
6. ✅ **Device cannot uninstall** the app
7. ✅ **Settings show** "Nama EMI Device" work profile

---

## 🔐 Security Features Enabled

After successful provisioning:

- **Device Owner Mode**: App has full device control
- **Admin Permissions**: Can lock, restrict features, track location
- **Uninstall Protection**: User cannot remove app
- **Factory Reset Protection**: Device stays locked after reset
- **Remote Control**: Admin can lock/unlock remotely
- **Feature Restrictions**: Camera, network, etc. can be disabled

---

## 📞 Support & Debugging

If issues persist:

1. **Check Logs**:
   ```bash
   # Server logs
   tail -f server.log
   
   # Device logs
   adb logcat | grep -E "Nama|EMI|Provisioning"
   ```

2. **Verify Deployment**:
   - Render dashboard: https://dashboard.render.com
   - Check deployment status
   - Review build logs

3. **Test Manually**:
   ```bash
   # Test APK download
   curl -O https://nama-emi-app.onrender.com/downloads/app.apk
   
   # Test API
   curl https://nama-emi-app.onrender.com/api/health
   ```

---

## 📝 Notes

- **Android Version**: Requires Android 7.0 (API 24) or higher
- **Network**: Stable internet required during provisioning
- **Factory Reset**: Device must be factory reset before provisioning
- **One-Time Setup**: Provisioning can only be done once per factory reset
- **Backup**: QR code contains sensitive data - keep secure

---

**Last Updated**: 2025-12-27  
**Version**: 1.0.5  
**Status**: Production Ready ✅
