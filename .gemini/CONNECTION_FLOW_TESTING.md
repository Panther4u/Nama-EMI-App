# Device Connection Flow - Complete Testing Guide

## Issue Description
User scanned QR code to register device, but device is not properly connecting to admin panel and showing connection status.

## Root Cause Analysis

The connection flow involves multiple steps:
1. **QR Code Generation** (Admin Panel)
2. **QR Code Scanning** (Mobile Device)
3. **Device Registration** (Backend API)
4. **Heartbeat/Telemetry** (Mobile → Backend)
5. **Status Display** (Admin Panel)

## Complete Connection Flow

### Step 1: Admin Creates Device & QR Code

**Location**: `/admin` → Add Device

**What happens**:
- Admin fills in customer details
- System generates unique device ID
- QR code is created with: `{ id: deviceId, serverUrl: baseUrl }`
- Device record saved to MongoDB

**Verification**:
```bash
# Check if device exists in database
curl http://localhost:8080/api/devices/{deviceId}
```

### Step 2: Mobile Scans QR Code

**Location**: `/mobile` → Tap logo 6 times → Scan QR

**What happens**:
- QR scanner reads device ID and server URL
- `setBaseUrl(data.serverUrl)` updates API endpoint
- `fetchDeviceById(deviceId)` retrieves device info
- Device ID saved to Capacitor Preferences
- Navigates to `/mobile/{deviceId}`

**Code Flow**:
```typescript
// MobileClient.tsx line 252-293
handleScanSuccess(data) {
  - Update server URL if provided
  - Fetch device by ID
  - Navigate to device page
  - Save to preferences
}
```

### Step 3: Permissions Setup

**Location**: `/mobile/{deviceId}` → Permission Wizard

**What happens**:
- Device requests admin permissions
- Location tracking enabled
- `permissionsGranted` flag set to true
- App enters "Hidden Mode"

**Code Flow**:
```typescript
// MobileClient.tsx line 233-246
handlePermissionsComplete() {
  - updateDevice({ permissionsGranted: true })
  - setIsHidden(true)
  - Start heartbeat
}
```

### Step 4: Heartbeat & Telemetry (CRITICAL)

**Location**: Background service in Hidden Mode

**What happens** (Every 10 seconds):
1. Fetch latest device state from server
2. Check for commands (lock/unlock/wipe/release)
3. Collect telemetry data:
   - Battery level
   - Network type
   - SIM carrier
   - Android version
4. Send telemetry to server via PUT `/api/devices/{id}/telemetry`
5. Update `lastSeen` timestamp

**Code Flow**:
```typescript
// MobileClient.tsx line 144-231
useEffect(() => {
  if (device && isHidden && !isUninstalling) {
    const heartbeat = setInterval(async () => {
      // 1. Fetch commands
      const fetchedDevice = await fetchDeviceById(device.id);
      
      // 2. Handle commands
      if (fetchedDevice.wipeRequested) { /* wipe */ }
      if (fetchedDevice.releaseRequested) { /* release */ }
      
      // 3. Send telemetry
      await fetch(`${baseUrl}/api/devices/${device.id}/telemetry`, {
        method: 'PUT',
        body: JSON.stringify({
          batteryLevel: Math.round((battery.batteryLevel || 0) * 100),
          networkType: network.connectionType,
          simCarrier: sim.carrier,
          androidVersion: info.osVersion,
          lastSeen: new Date()
        })
      });
    }, 10000); // Every 10 seconds
  }
}, [device, isHidden]);
```

### Step 5: Admin Panel Shows Status

**Location**: `/admin` → Device Cards

**What happens**:
- Admin panel fetches all devices
- DeviceCard component calculates connection status based on `telemetry.lastSeen`
- Status badge shows:
  - **Online** (green, pulsing): lastSeen < 5 minutes
  - **Away** (amber): lastSeen < 30 minutes
  - **Offline** (red): lastSeen > 30 minutes
  - **Never Connected** (gray): no telemetry data

**Code Flow**:
```typescript
// DeviceCard.tsx line 35-52
getConnectionStatus() {
  if (!device.telemetry?.lastSeen) return 'Never Connected';
  
  const diffMinutes = (now - lastSeen) / (1000 * 60);
  
  if (diffMinutes < 5) return 'Online';
  else if (diffMinutes < 30) return 'Away';
  else return 'Offline';
}
```

## Common Issues & Solutions

### Issue 1: Device Shows "Never Connected"

**Symptoms**:
- Device registered successfully
- QR scan worked
- But admin panel shows "Never Connected"

**Possible Causes**:
1. ❌ Permissions not granted → Heartbeat never started
2. ❌ App not in Hidden Mode → Heartbeat not running
3. ❌ Wrong server URL → Telemetry sent to wrong endpoint
4. ❌ Network error → Telemetry requests failing
5. ❌ CORS issue → Backend rejecting requests

**Solutions**:
```bash
# 1. Check if device completed permissions
# Mobile should show "System Protected" screen

# 2. Check browser console for errors
# Look for failed telemetry requests

# 3. Verify server URL matches
# Admin panel and mobile should use same baseUrl

# 4. Check backend logs
# Should see PUT /api/devices/{id}/telemetry requests

# 5. Test telemetry endpoint manually
curl -X PUT http://localhost:8080/api/devices/{deviceId}/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "batteryLevel": 85,
    "networkType": "wifi",
    "simCarrier": "Airtel",
    "androidVersion": "13"
  }'
```

### Issue 2: Heartbeat Not Running

**Symptoms**:
- Device shows active screen, not hidden mode
- No telemetry updates

**Cause**: Permissions wizard not completed

**Solution**:
1. Navigate to `/mobile/{deviceId}`
2. Complete all permission steps
3. App should enter "System Protected" black screen
4. Heartbeat starts automatically

### Issue 3: CORS Errors

**Symptoms**:
- Console shows CORS policy errors
- Telemetry requests blocked

**Solution**:
```javascript
// server/index.js - Ensure CORS is enabled
app.use(cors({
  origin: '*', // Or specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

### Issue 4: Wrong Server URL

**Symptoms**:
- Mobile sends requests to localhost
- Admin panel uses production URL

**Solution**:
1. Admin panel: Settings → Update API URL
2. Mobile: Settings → Update API URL
3. Both should point to same server
4. QR code should include correct serverUrl

## Testing Checklist

### ✅ Pre-Flight Checks
- [ ] Backend server running on correct port
- [ ] MongoDB connected and accessible
- [ ] Admin panel can reach backend API
- [ ] Mobile client can reach backend API
- [ ] CORS properly configured

### ✅ Admin Panel Tests
- [ ] Can create new device
- [ ] QR code generates successfully
- [ ] QR code contains both `id` and `serverUrl`
- [ ] Device appears in device list
- [ ] Can manually lock/unlock device

### ✅ Mobile Client Tests
- [ ] Can scan QR code (tap logo 6x)
- [ ] QR scan extracts device ID
- [ ] QR scan extracts server URL
- [ ] Device data loads successfully
- [ ] Permission wizard appears
- [ ] All permissions can be granted
- [ ] App enters hidden mode after permissions
- [ ] "System Protected" screen shows

### ✅ Heartbeat Tests
- [ ] Check browser console for telemetry requests
- [ ] Verify requests sent every 10 seconds
- [ ] Check backend logs for incoming telemetry
- [ ] Verify database updates with new telemetry
- [ ] Confirm `lastSeen` timestamp updates

### ✅ Admin Panel Status Tests
- [ ] Device card shows connection status badge
- [ ] Status changes from "Never Connected" to "Online"
- [ ] Telemetry section appears with battery/network
- [ ] Last seen time updates correctly
- [ ] Status dot pulses for online devices

### ✅ Lock/Unlock Tests
- [ ] Admin can lock device from panel
- [ ] Mobile receives lock command within 10s
- [ ] Mobile shows lock screen
- [ ] Admin can unlock device
- [ ] Mobile receives unlock command
- [ ] Mobile returns to active screen

## Debug Commands

### Check Device in Database
```bash
# Using MongoDB shell
mongosh
use nama-emi-app
db.devices.findOne({ id: "YOUR_DEVICE_ID" })
```

### Monitor Telemetry Updates
```bash
# Watch database for changes
mongosh
use nama-emi-app
db.devices.watch([
  { $match: { "updateDescription.updatedFields.telemetry": { $exists: true } } }
])
```

### Test API Endpoints
```bash
# Get device
curl http://localhost:8080/api/devices/{deviceId}

# Update telemetry
curl -X PUT http://localhost:8080/api/devices/{deviceId}/telemetry \
  -H "Content-Type: application/json" \
  -d '{"batteryLevel":75,"networkType":"4g","simCarrier":"Jio","androidVersion":"12"}'

# Lock device
curl -X POST http://localhost:8080/api/devices/{deviceId}/lock

# Unlock device
curl -X POST http://localhost:8080/api/devices/{deviceId}/unlock
```

### Check Network Requests
```javascript
// In mobile browser console
// Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0]);
  return originalFetch.apply(this, args)
    .then(res => {
      console.log('Response:', res.status, args[0]);
      return res;
    });
};
```

## Expected Behavior Timeline

**T+0s**: Admin creates device, generates QR
**T+10s**: User scans QR code
**T+15s**: Device data loads, shows active screen
**T+20s**: User completes permissions wizard
**T+21s**: App enters hidden mode, heartbeat starts
**T+31s**: First telemetry sent to server
**T+32s**: Admin panel shows "Online" status
**T+41s**: Second telemetry sent
**T+51s**: Third telemetry sent
**Ongoing**: Telemetry every 10 seconds

## Production Deployment Notes

1. **Server URL**: Ensure QR codes contain production URL, not localhost
2. **HTTPS**: Use HTTPS for production (required for geolocation)
3. **CORS**: Configure allowed origins properly
4. **Heartbeat Interval**: Consider increasing to 30s for battery savings
5. **Connection Timeout**: Add retry logic for failed telemetry requests
6. **Offline Mode**: Queue telemetry when offline, send when reconnected

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "Never Connected" | Permissions not granted | Complete permission wizard |
| "Offline" immediately | Wrong server URL | Update baseUrl in settings |
| No telemetry section | Device never sent data | Check hidden mode active |
| CORS errors | Backend config | Enable CORS in server/index.js |
| Heartbeat not running | Not in hidden mode | Complete permissions |
| Old lastSeen time | Heartbeat stopped | Check if app still running |
| Can't lock device | Backend not responding | Check server logs |

## Next Steps for Full Verification

1. **Clear all existing devices** from database
2. **Create fresh device** via admin panel
3. **Scan QR code** on actual mobile device or browser
4. **Complete permissions** wizard fully
5. **Wait 30 seconds** for first telemetry
6. **Refresh admin panel** to see "Online" status
7. **Test lock/unlock** commands
8. **Monitor for 5 minutes** to ensure consistent heartbeat
