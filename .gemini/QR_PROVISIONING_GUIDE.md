# 📱 Android QR Provisioning - Factory Reset Setup

## Automatic Device Setup via QR Code (Zero-Touch)

---

## 🎯 **What is QR Provisioning?**

Android's built-in feature that allows **automatic device setup** after factory reset by scanning a QR code. No manual app installation needed!

**Benefits**:
- ✅ Fully automatic setup
- ✅ No manual app download
- ✅ No permission granting needed
- ✅ Device Owner mode enabled automatically
- ✅ Takes only 30 seconds!

---

## 📋 **Prerequisites**

### **Device Requirements**:
- Android 7.0 (Nougat) or higher
- Factory reset device (brand new or freshly reset)
- WiFi connection available

### **What You Need**:
- QR code from admin panel (with provisioning data)
- WiFi network name and password

---

## 🚀 **STEP-BY-STEP: QR Provisioning Setup**

### **STEP 1: Factory Reset the Device**

**If device is new**: Skip to Step 2

**If device is used**:
1. Go to **Settings**
2. Tap **System** → **Reset options**
3. Tap **Erase all data (factory reset)**
4. Tap **Reset phone**
5. Enter PIN/password if asked
6. Tap **Erase everything**
7. Wait for device to restart (2-3 minutes)

---

### **STEP 2: Start Device Setup**

1. **Device boots** to "Welcome" screen
2. **Select language** (if asked)
3. **STOP!** - Don't tap "Start" or "Next"

**Important**: Stay on the Welcome screen!

---

### **STEP 3: Activate QR Scanner**

1. **Tap the screen 6 times** quickly
   - Tap anywhere on the screen
   - 6 quick taps in succession
   - Like: tap-tap-tap-tap-tap-tap

2. **QR scanner activates** automatically
   - Camera opens
   - "Scan QR code" message appears
   - Scanner is ready

**Note**: If it doesn't work, try tapping 6 times again, faster.

---

### **STEP 4: Scan QR Code**

1. **Hold phone steady**
2. **Point camera** at QR code from admin panel
3. **Align QR code** in the frame
4. **Scanner reads** automatically (2-3 seconds)
5. **"Reading QR code..."** message appears

---

### **STEP 5: Automatic Setup Begins**

**What happens automatically**:

1. ✅ **WiFi connects** (if included in QR)
2. ✅ **APK downloads** from server
3. ✅ **App installs** automatically
4. ✅ **Device Owner** mode enabled
5. ✅ **Permissions granted** automatically
6. ✅ **Backend configured** automatically
7. ✅ **Device registered** in system

**You'll see**:
- "Setting up your device..."
- "Downloading device policy..."
- "Installing apps..."
- Progress bar

**Time**: 2-5 minutes (depending on internet speed)

---

### **STEP 6: Setup Complete!**

1. **Device finishes setup**
2. **Home screen appears**
3. **Nama EMI app** is installed
4. **App opens automatically** (or tap icon)
5. **Status shows "Connected"**
6. ✅ **Done!**

---

## 📊 **QR Code Format**

The QR code from admin panel must include:

```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.nama.emi.app/.AdminReceiver",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://nama-emi-app.onrender.com/downloads/nama-emi.apk",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": "SsRDEvbLTEDXHdcXRgmRuxDRxvSm3UejbhCOrwXZ-nU", // <--- Must match APK!
  "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": true,
  "deviceId": "abc123",
  "serverUrl": "https://nama-emi-app.onrender.com",
  "customerName": "John Doe",
  "deviceModel": "Samsung Galaxy A52",
  
  // Optional WiFi (recommended):
  "android.app.extra.PROVISIONING_WIFI_SSID": "YourWiFiName",
  "android.app.extra.PROVISIONING_WIFI_PASSWORD": "YourWiFiPassword",
  "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE": "WPA"
}
```

---

## 🎯 **Complete Flow Diagram**

```
Factory Reset Device
        ↓
Welcome Screen
        ↓
Tap Screen 6 Times
        ↓
QR Scanner Activates
        ↓
Scan QR Code
        ↓
Automatic Setup:
├─ WiFi Connects
├─ APK Downloads
├─ App Installs
├─ Device Owner Set
├─ Permissions Granted
└─ Backend Configured
        ↓
✅ Setup Complete!
        ↓
Device Ready to Use
```

**Total Time**: 30 seconds (user action) + 2-5 minutes (automatic)

---

## 🔧 **Troubleshooting**

### **Problem 1: QR Scanner Doesn't Activate**

**Solutions**:
- Try tapping 6 times again, faster
- Make sure you're on the Welcome screen
- Try tapping in different areas of screen
- Restart device and try again
- Some devices need 7-8 taps

### **Problem 2: QR Code Won't Scan**

**Solutions**:
- Clean camera lens
- Ensure good lighting
- Hold phone steady
- Move closer/farther from QR code
- Make sure QR code is clear (not blurry)

### **Problem 3: Setup Fails**

**Solutions**:
- Check WiFi connection
- Verify QR code has correct data
- Ensure APK is accessible at download URL
- Factory reset and try again

### **Problem 4: No Internet During Setup**

**Solutions**:
- Include WiFi credentials in QR code
- Or connect to WiFi manually before scanning
- Or use mobile data (if SIM inserted)

---

## ⚠️ **Important Notes**

### **Device Must Be Factory Reset**:
- QR provisioning **only works** on factory reset devices
- Can't use on devices already set up
- Must start from Welcome screen

### **One-Time Setup**:
- Once provisioned, can't be changed easily
- To re-provision, must factory reset again
- Choose WiFi carefully (will auto-connect)

### **Device Owner Mode**:
- Gives app full control over device
- Required for lock/unlock functionality
- Can't be removed without factory reset

---

## 📱 **For Shop Owners**

### **Preparation**:

1. **Factory reset** customer's device
2. **Generate QR code** in admin panel with:
   - Device ID
   - Customer name
   - APK download URL
   - WiFi credentials (your shop WiFi)

3. **Show customer** how to tap 6 times
4. **Let them scan** QR code
5. **Wait** for automatic setup
6. **Verify** "Connected" status
7. **Done!**

### **Quick Script**:

```
"I'll set up your device now:

1. This is a factory reset device
2. Tap the screen 6 times quickly - like this
   [Demonstrate tapping motion]
3. Camera will open
4. Point it at this QR code
   [Show QR code]
5. Wait 2-3 minutes while it sets up
6. Done! Your device is ready"
```

---

## 🆚 **QR Provisioning vs Manual Install**

### **QR Provisioning** (Recommended):
- ✅ Fully automatic
- ✅ No user interaction needed
- ✅ Device Owner enabled
- ✅ Professional setup
- ❌ Requires factory reset
- ❌ Needs WiFi

### **Manual Install**:
- ✅ Works on any device
- ✅ No factory reset needed
- ✅ Works offline (download APK first)
- ❌ Manual steps required
- ❌ User must grant permissions
- ❌ Device Owner needs ADB

---

## ✅ **Verification Checklist**

After QR provisioning:

- [ ] Device completed setup
- [ ] Nama EMI app installed
- [ ] App shows "Connected" status
- [ ] Device info displayed correctly
- [ ] EMI details visible
- [ ] Device appears in admin panel
- [ ] Lock/unlock works from admin
- [ ] Customer understands app usage

---

## 🎯 **Best Practices**

### **For New Devices**:
- ✅ Use QR provisioning (fastest)
- ✅ Include WiFi in QR code
- ✅ Test QR code before customer arrives

### **For Used Devices**:
- ✅ Factory reset first
- ✅ Then use QR provisioning
- ✅ Backup customer data before reset

### **For Multiple Devices**:
- ✅ Generate unique QR for each device
- ✅ Print QR codes in advance
- ✅ Label with customer name
- ✅ Keep organized

---

## 📋 **Quick Reference Card**

```
╔═══════════════════════════════════════╗
║   QR PROVISIONING - QUICK GUIDE       ║
╠═══════════════════════════════════════╣
║                                       ║
║  1️⃣ Factory reset device              ║
║                                       ║
║  2️⃣ Welcome screen appears            ║
║                                       ║
║  3️⃣ Tap screen 6 times quickly        ║
║     (tap-tap-tap-tap-tap-tap)         ║
║                                       ║
║  4️⃣ QR scanner opens                  ║
║                                       ║
║  5️⃣ Scan QR code from admin           ║
║                                       ║
║  6️⃣ Wait 2-5 minutes                  ║
║     (automatic setup)                 ║
║                                       ║
║  7️⃣ Done! ✅                          ║
║     Device ready to use               ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## ✨ **Summary**

**QR Provisioning**:
- ⏱️ **User Time**: 30 seconds
- ⏱️ **Total Time**: 2-5 minutes
- 🎯 **Success Rate**: 95%+
- 💪 **Difficulty**: Very Easy
- ✅ **Recommended**: Yes!

**Perfect for**:
- New devices
- Factory reset devices
- Professional deployment
- Multiple device setup
- Zero-touch provisioning

**Your customers will love how easy it is!** 🎉
