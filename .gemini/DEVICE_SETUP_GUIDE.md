# 📱 Device Setup Guide - Admin Panel Control

## Complete Step-by-Step Guide to Connect User Devices to Admin Panel

---

## 🎯 **Overview**

This guide explains how to set up user devices so they can be controlled from the admin panel.

**What You'll Achieve**:
- ✅ Register devices in admin panel
- ✅ Install app on user's Android phone
- ✅ Connect device to admin panel
- ✅ Remote lock/unlock control
- ✅ Real-time device monitoring

---

## 📋 **Prerequisites**

### **Required**:
1. ✅ Backend server running (http://localhost:5000)
2. ✅ Frontend running (http://localhost:8080)
3. ✅ Android device (physical device recommended)
4. ✅ Admin access (Mobile: 9876543210, PIN: 1234)

### **Optional**:
- USB cable for Android debugging
- Android Studio for building APK
- Production server (for deployment)

---

## 🚀 **Quick Setup (5 Steps)**

### **Step 1: Start Servers** ⚡

```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
npm run dev
```

**Verify**:
- Backend: http://localhost:5000 (should show "Cannot GET /")
- Frontend: http://localhost:8080 (should show login page)

---

### **Step 2: Login to Admin Panel** 🔐

1. Open: http://localhost:8080
2. Enter Mobile: `9876543210`
3. Enter PIN: `1234`
4. Click "Login"

**You should see**: Admin Dashboard with stats cards

---

### **Step 3: Add New Device** ➕

1. Click the **"+"** button (top-right of search bar)
2. Fill in the 3-step form:

#### **Step 1: Customer Information**
- Full Name: `John Doe`
- Mobile: `9876543210`
- Aadhar: `1234-5678-9012`
- Email: `john@example.com` (optional)
- Address: `123 Main St, City`

#### **Step 2: Device Information**
- Device Model: Select brand and model
- IMEI 1: `123456789012345` (15 digits)
- IMEI 2: `543210987654321` (15 digits)

#### **Step 3: Finance Details**
- Finance Company: `Bajaj Finance`
- Total Amount: `35000`
- EMI Amount: `3500`
- Tenure: `12` months
- Due Date: Select first EMI date

3. Click **"Add Device"**

**You should see**: QR Code screen with success message

---

### **Step 4: Install App on Android Device** 📲

#### **Option A: Development Mode (Recommended for Testing)**

1. **Enable Developer Options** on Android:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect via USB**:
   ```bash
   # Check device is connected
   adb devices
   
   # Should show:
   # List of devices attached
   # ABC123XYZ    device
   ```

3. **Run on Device**:
   ```bash
   # Sync Capacitor
   npx cap sync android
   
   # Open in Android Studio
   npx cap open android
   
   # In Android Studio:
   # - Click "Run" (green play button)
   # - Select your connected device
   # - Wait for app to install and launch
   ```

#### **Option B: Build APK (For Production)**

```bash
# Build frontend
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# In Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
# Find APK in: android/app/build/outputs/apk/debug/app-debug.apk

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

### **Step 5: Connect Device to Admin Panel** 🔗

#### **On the Android Device**:

1. **Open the Nama EMI app**

2. **You'll see**: Mobile Client screen with QR scanner

3. **Scan the QR Code**:
   - Point camera at QR code from Step 3
   - OR manually enter Device ID if QR fails

4. **Grant Permissions** (when prompted):
   - ✅ Camera (for QR scanning)
   - ✅ Location (for tracking)
   - ✅ Device Admin (for lock control)
   - ✅ Notifications (for alerts)

5. **Device Owner Setup** (Critical!):
   
   **Method 1: QR Code Provisioning (Recommended)**
   ```bash
   # Factory reset the device first
   # During setup, tap screen 6 times on "Welcome" screen
   # Scan the QR code from admin panel
   # Device will auto-configure as Device Owner
   ```

   **Method 2: ADB Command (For Testing)**
   ```bash
   # Connect device via USB
   adb shell dpm set-device-owner com.nama.emi.app/.AdminReceiver
   
   # Should show:
   # Success: Device owner set to package com.nama.emi.app
   ```

6. **Verify Connection**:
   - App should show "Connected" status
   - Device info should appear
   - Green indicator should show

---

## 🎮 **Testing Admin Control**

### **On Admin Dashboard**:

1. **Find Your Device**:
   - Should appear in device list
   - Shows "Online" status (green dot)
   - Displays device info

2. **Test Lock Function**:
   - Click the **Lock** button (red)
   - Device should lock immediately
   - Status changes to "Locked"

3. **Test Unlock Function**:
   - Click the **Unlock** button (green)
   - Device should unlock
   - Status changes to "Active"

4. **View Device Details**:
   - Click "Details" button
   - See full device information
   - Check telemetry data

5. **Monitor Real-time**:
   - Battery level updates
   - Network status
   - Last seen timestamp
   - Connection status (Online/Away/Offline)

---

## 🔧 **Troubleshooting**

### **Problem 1: Device Not Showing in Admin Panel**

**Symptoms**: Device registered but not visible in dashboard

**Solutions**:
1. Check backend is running (http://localhost:5000)
2. Refresh admin dashboard (F5)
3. Check device has internet connection
4. Verify QR code was scanned correctly
5. Check browser console for errors

---

### **Problem 2: Lock/Unlock Not Working**

**Symptoms**: Clicking lock/unlock does nothing

**Solutions**:
1. **Check Device Owner Status**:
   ```bash
   adb shell dpm list-owners
   # Should show: com.nama.emi.app
   ```

2. **Grant Device Admin**:
   - Settings → Security → Device Admin Apps
   - Enable "Nama EMI"

3. **Check Permissions**:
   - Settings → Apps → Nama EMI → Permissions
   - Ensure all permissions granted

4. **Restart App**:
   - Force stop app
   - Clear cache
   - Reopen app

---

### **Problem 3: Device Shows "Offline"**

**Symptoms**: Device shows red "Offline" status

**Solutions**:
1. **Check Internet Connection**:
   - Ensure device has WiFi/mobile data
   - Test by opening browser

2. **Check Heartbeat**:
   - App should send heartbeat every 10 seconds
   - Check backend logs for incoming requests

3. **Restart Heartbeat**:
   - Close and reopen app
   - Should reconnect automatically

4. **Check API URL**:
   - In app, verify server URL is correct
   - Should be: http://YOUR_IP:5000 (not localhost)

---

### **Problem 4: QR Code Not Scanning**

**Symptoms**: Camera opens but QR doesn't scan

**Solutions**:
1. **Check Camera Permission**:
   - Settings → Apps → Nama EMI → Permissions
   - Enable Camera

2. **Improve Lighting**:
   - Ensure good lighting
   - Hold phone steady
   - Adjust distance

3. **Manual Entry**:
   - Click "Enter Manually"
   - Type Device ID from admin panel

4. **Regenerate QR**:
   - Delete device from admin
   - Add again to get new QR code

---

### **Problem 5: App Crashes on Launch**

**Symptoms**: App opens then immediately closes

**Solutions**:
1. **Check Logs**:
   ```bash
   adb logcat | grep "nama.emi"
   ```

2. **Clear App Data**:
   - Settings → Apps → Nama EMI
   - Clear Storage & Cache

3. **Reinstall App**:
   ```bash
   adb uninstall com.nama.emi.app
   adb install app-debug.apk
   ```

4. **Check Android Version**:
   - Requires Android 8.0+ (API 26+)
   - Update device if needed

---

## 🌐 **Production Deployment**

### **For Real-World Use**:

1. **Deploy Backend**:
   - Use Render, AWS, or similar
   - Get production URL (e.g., https://api.yourapp.com)

2. **Update Frontend**:
   ```bash
   # Create .env.production
   echo "VITE_API_URL=https://api.yourapp.com" > .env.production
   
   # Build
   npm run build
   ```

3. **Build Production APK**:
   ```bash
   # Sync
   npx cap sync android
   
   # In Android Studio:
   # Build → Generate Signed Bundle / APK
   # Follow prompts to create release APK
   ```

4. **Distribute APK**:
   - Upload to your server
   - Share download link
   - Users install from link

5. **Update QR Codes**:
   - QR codes will include production URL
   - Devices auto-connect to production server

---

## 📊 **Architecture Overview**

```
┌─────────────────┐
│  Admin Panel    │ ← You control from here
│  (Web Browser)  │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Backend Server │ ← Node.js + MongoDB
│  (Port 5000)    │
└────────┬────────┘
         │
         │ HTTP Polling (10s)
         │
┌────────▼────────┐
│  Mobile App     │ ← User's Android device
│  (Capacitor)    │
└─────────────────┘
```

**Data Flow**:
1. Admin clicks "Lock" → Backend receives command
2. Mobile app polls backend every 10s → Gets "lock" command
3. Mobile app executes lock → Device locks
4. Mobile app sends status → Backend updates
5. Admin dashboard refreshes → Shows "Locked" status

---

## ✅ **Verification Checklist**

Before going live, verify:

- [ ] Backend server accessible from internet
- [ ] Frontend deployed and accessible
- [ ] APK signed and ready for distribution
- [ ] QR codes generated with production URL
- [ ] Test device can connect to production server
- [ ] Lock/unlock works on production
- [ ] Telemetry data updates in real-time
- [ ] All permissions granted on test device
- [ ] Device Owner mode activated
- [ ] Heartbeat working (check "Last seen")

---

## 🎯 **Quick Reference**

### **Admin Credentials**:
- Mobile: `9876543210`
- PIN: `1234`

### **URLs**:
- Frontend: http://localhost:8080
- Backend: http://localhost:5000
- Admin Dashboard: http://localhost:8080/admin/dashboard

### **Key Commands**:
```bash
# Start backend
cd server && node index.js

# Start frontend
npm run dev

# Check connected devices
adb devices

# Set device owner
adb shell dpm set-device-owner com.nama.emi.app/.AdminReceiver

# View logs
adb logcat | grep "nama.emi"

# Build APK
npx cap sync android && npx cap open android
```

---

## 📞 **Support**

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review backend logs (Terminal 1)
3. Check browser console (F12)
4. Review Android logs (`adb logcat`)

---

## ✨ **Summary**

**5-Step Setup**:
1. ✅ Start servers (backend + frontend)
2. ✅ Login to admin panel
3. ✅ Add device and get QR code
4. ✅ Install app on Android device
5. ✅ Scan QR code to connect

**Result**: Full remote control of user devices from admin panel! 🎉

**Time Required**: ~15 minutes for first setup, ~5 minutes for additional devices
