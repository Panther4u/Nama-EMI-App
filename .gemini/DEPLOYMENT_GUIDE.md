# 🚀 Complete Deployment Guide - Render Server Setup

## Step-by-Step Production Deployment

---

## 📋 **Deployment Overview**

**Order of Deployment**:
1. ✅ Deploy Backend to Render
2. ✅ Build Frontend with Production URL
3. ✅ Build Android APK
4. ✅ Test Everything
5. ✅ Go Live!

---

## 🔧 **STEP 1: Deploy Backend to Render**

### **A. Prepare Backend for Deployment**

#### **1. Create `render.yaml`** (Optional but recommended)

Create file: `/server/render.yaml`

```yaml
services:
  - type: web
    name: nama-emi-backend
    env: node
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
```

#### **2. Update `package.json`** in `/server` folder

```json
{
  "name": "nama-emi-backend",
  "version": "1.0.0",
  "description": "Nama EMI Backend Server",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1"
  }
}
```

#### **3. Update `server/index.js`** for production

Add at the top:
```javascript
const PORT = process.env.PORT || 5000;

// Update server start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### **B. Deploy to Render**

#### **1. Create Render Account**
- Go to: https://render.com
- Sign up with GitHub
- Authorize Render to access your repositories

#### **2. Create New Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository: `Mobile Lock App`

#### **3. Configure Web Service**

**Basic Settings**:
- **Name**: `nama-emi-backend`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`

**Environment Variables**:
Click **"Advanced"** → **"Add Environment Variable"**

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nama-emi
```

**Instance Type**:
- Free tier is fine for testing
- Upgrade to paid for production

#### **4. Deploy**
1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Watch build logs
4. Once deployed, you'll get a URL like:
   ```
   https://nama-emi-backend.onrender.com
   ```

#### **5. Test Backend**
```bash
# Test health endpoint
curl https://nama-emi-backend.onrender.com/api/devices

# Should return: []
```

---

### **C. Set Up MongoDB (If not done)**

#### **Option 1: MongoDB Atlas (Recommended)**

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Create a **Free Cluster**
4. Click **"Connect"**
5. Add your IP: `0.0.0.0/0` (allow all)
6. Create database user
7. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nama-emi
   ```
8. Add to Render environment variables

#### **Option 2: Render PostgreSQL** (Alternative)

If you prefer PostgreSQL:
1. In Render dashboard: **New +** → **PostgreSQL**
2. Create database
3. Update backend code to use PostgreSQL instead of MongoDB

---

## 🌐 **STEP 2: Build Frontend with Production URL**

### **A. Configure Production Environment**

#### **1. Create `.env.production`** in project root

```env
VITE_API_URL=https://nama-emi-backend.onrender.com
```

#### **2. Update `src/context/DeviceContext.tsx`**

Find this line:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Make sure it's using the environment variable.

---

### **B. Build Frontend**

```bash
# Build production version
npm run build

# Output will be in /dist folder
```

**Verify build**:
```bash
ls -la dist/
# Should see: index.html, assets/, etc.
```

---

### **C. Deploy Frontend (Optional)**

#### **Option 1: Render Static Site**

1. In Render: **New +** → **Static Site**
2. Connect repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://nama-emi-backend.onrender.com`
5. Deploy

**Result**: Frontend at `https://nama-emi-app.onrender.com`

#### **Option 2: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### **Option 3: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 📱 **STEP 3: Build Android APK**

### **A. Update Capacitor Config**

**File**: `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nama.emi.app',
  appName: 'Nama EMI',
  webDir: 'dist',
  server: {
    // Production backend URL
    url: 'https://nama-emi-backend.onrender.com',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'path/to/keystore.jks',
      keystorePassword: 'your-password',
      keystoreAlias: 'nama-emi',
      keystoreAliasPassword: 'your-alias-password'
    }
  }
};

export default config;
```

---

### **B. Sync and Build APK**

```bash
# 1. Build frontend
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

**In Android Studio**:

1. **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Click **Next**

4. **Create/Select Keystore**:
   - If first time: **Create new...**
   - Key store path: `android/nama-emi-keystore.jks`
   - Password: Create strong password (SAVE IT!)
   - Alias: `nama-emi`
   - Validity: 25 years
   - Fill in certificate info

5. **Select Build Variant**: `release`
6. Click **Finish**
7. Wait for build (2-5 minutes)

8. **Find APK**:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

### **C. Test APK**

```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or share APK file for manual install
```

---

## 🌐 **STEP 4: Host APK for Download**

### **Option 1: GitHub Releases**

1. Go to your GitHub repository
2. Click **Releases** → **Create a new release**
3. Tag: `v1.0.0`
4. Upload `app-release.apk`
5. Publish release
6. Get download URL:
   ```
   https://github.com/username/repo/releases/download/v1.0.0/app-release.apk
   ```

### **Option 2: Render Static Files**

1. Create `public` folder in server
2. Copy APK to `public/downloads/app-release.apk`
3. In `server/index.js`:
   ```javascript
   app.use('/downloads', express.static('public/downloads'));
   ```
4. APK available at:
   ```
   https://nama-emi-backend.onrender.com/downloads/app-release.apk
   ```

### **Option 3: Cloud Storage**

**Google Drive**:
1. Upload APK
2. Right-click → Share → Anyone with link
3. Get shareable link

**Dropbox**:
1. Upload APK
2. Get link
3. Change `dl=0` to `dl=1`

---

## ✅ **STEP 5: Final Testing**

### **A. Test Backend**

```bash
# Test API
curl https://nama-emi-backend.onrender.com/api/devices

# Should return: []
```

### **B. Test Frontend**

1. Open: `https://nama-emi-app.onrender.com` (or your URL)
2. Login: `9876543210` / `1234`
3. Should see dashboard
4. Try adding device

### **C. Test Mobile App**

1. Download APK on Android device
2. Install APK
3. Open app
4. Should connect to production backend
5. Test lock/unlock from admin panel

---

## 🔐 **STEP 6: Security & Environment Variables**

### **Render Environment Variables**

In Render dashboard, add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nama-emi
JWT_SECRET=your-super-secret-key-change-this
ADMIN_USERNAME=9876543210
ADMIN_PASSWORD=1234
```

**Important**: Change default credentials in production!

---

## 📊 **Complete Deployment Checklist**

### **Backend (Render)**:
- [ ] Code pushed to GitHub
- [ ] Render web service created
- [ ] Environment variables set
- [ ] MongoDB connected
- [ ] Backend deployed successfully
- [ ] API endpoints tested
- [ ] HTTPS working

### **Frontend**:
- [ ] Production URL configured
- [ ] Build completed (`npm run build`)
- [ ] Static site deployed (optional)
- [ ] Can access admin panel
- [ ] Can login successfully
- [ ] Can add devices

### **Mobile App**:
- [ ] Capacitor synced
- [ ] APK built and signed
- [ ] APK tested on device
- [ ] Connects to production backend
- [ ] Lock/unlock works
- [ ] APK hosted for download

### **Documentation**:
- [ ] Download link ready
- [ ] Setup instructions prepared
- [ ] QR codes generated
- [ ] Support documentation ready

---

## 🎯 **Quick Commands Reference**

### **Deploy Backend to Render**:
```bash
# Just push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# Render auto-deploys from GitHub
```

### **Build Frontend**:
```bash
npm run build
```

### **Build APK**:
```bash
npm run build
npx cap sync android
npx cap open android
# Then Build → Generate Signed Bundle/APK in Android Studio
```

### **Test Production**:
```bash
# Backend
curl https://nama-emi-backend.onrender.com/api/devices

# Install APK
adb install app-release.apk
```

---

## 🌐 **Your Production URLs**

After deployment, you'll have:

```
Backend:  https://nama-emi-backend.onrender.com
Frontend: https://nama-emi-app.onrender.com
APK:      https://nama-emi-backend.onrender.com/downloads/app-release.apk
```

---

## ⚠️ **Important Notes**

### **Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid tier for production

### **MongoDB Atlas Free Tier**:
- 512 MB storage
- Good for ~5000 devices
- Upgrade when needed

### **APK Signing**:
- **NEVER lose your keystore file!**
- **NEVER forget your passwords!**
- Store securely (password manager)
- Backup keystore file

---

## 🚀 **Summary**

**Deployment Steps**:
1. ✅ **Deploy Backend** to Render (5 minutes)
2. ✅ **Build Frontend** with production URL (2 minutes)
3. ✅ **Build APK** with production backend (5 minutes)
4. ✅ **Host APK** for download (2 minutes)
5. ✅ **Test Everything** (10 minutes)

**Total Time**: ~30 minutes

**Result**: 
- ✅ Production backend running 24/7
- ✅ Admin panel accessible online
- ✅ Mobile APK ready for distribution
- ✅ Complete EMI management system live!

**You're ready for production deployment!** 🎉
