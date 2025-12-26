# 🚀 Deploy to Render - Complete Guide

## Upload APK and Deploy Backend to Production

---

## 📋 **Deployment Steps**

### **Step 1: Prepare for Deployment**

#### **A. Commit APK to Git**

```bash
# Add APK to git
git add server/public/downloads/nama-emi.apk

# Commit
git commit -m "Add production APK for download"

# Push to GitHub
git push origin main
```

---

### **Step 2: Deploy Backend to Render**

#### **A. Create Render Account**
1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### **B. Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select: `Mobile Lock App` (or your repo name)

#### **C. Configure Service**

**Basic Settings**:
```
Name: nama-emi-backend
Region: Singapore (or closest to you)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: node index.js
```

**Environment Variables**:
Click **"Advanced"** → **"Add Environment Variable"**

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nama-emi
```

**Instance Type**:
- Free tier for testing
- Starter ($7/month) for production

#### **D. Deploy**
1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. You'll get a URL like:
   ```
   https://nama-emi-backend.onrender.com
   ```

---

### **Step 3: Set Up MongoDB Atlas**

#### **A. Create MongoDB Account**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a **Free Cluster**

#### **B. Configure Database**
1. Click **"Connect"**
2. **Whitelist IP**: Add `0.0.0.0/0` (allow all)
3. **Create User**: 
   - Username: `namaemi`
   - Password: (create strong password)
4. **Get Connection String**:
   ```
   mongodb+srv://namaemi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/nama-emi
   ```

#### **C. Add to Render**
1. Go to Render dashboard
2. Your web service → **Environment**
3. Update `MONGODB_URI` with your connection string
4. Click **"Save Changes"**
5. Service will redeploy automatically

---

### **Step 4: Test Deployment**

#### **A. Test Backend**
```bash
# Test health endpoint
curl https://nama-emi-backend.onrender.com/api/health

# Should return: OK
```

#### **B. Test APK Download**
```bash
# Test APK download
curl -I https://nama-emi-backend.onrender.com/downloads/nama-emi.apk

# Should return: 200 OK
```

**Or open in browser**:
```
https://nama-emi-backend.onrender.com/downloads/nama-emi.apk
```

---

### **Step 5: Update Frontend for Production**

#### **A. Create Production Environment**

Create file: `.env.production`
```env
VITE_API_URL=https://nama-emi-backend.onrender.com
```

#### **B. Rebuild Frontend**
```bash
npm run build
```

#### **C. Deploy Frontend (Optional)**

**Option 1: Render Static Site**
1. Render → **New +** → **Static Site**
2. Connect repository
3. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://nama-emi-backend.onrender.com`

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option 3: Vercel**
```bash
npm install -g vercel
vercel --prod
```

---

### **Step 6: Rebuild APK with Production URL**

#### **A. Update Capacitor Config**

Edit `capacitor.config.ts`:
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
  }
};

export default config;
```

#### **B. Rebuild Everything**
```bash
# Build frontend
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK
cd android
./gradlew assembleRelease

# Copy new APK
cp app/build/outputs/apk/release/app-release.apk ../server/public/downloads/nama-emi.apk
```

#### **C. Commit and Push**
```bash
git add .
git commit -m "Update APK with production backend URL"
git push origin main
```

Render will auto-deploy the new APK!

---

## 📱 **Production URLs**

After deployment, you'll have:

```
Backend:  https://nama-emi-backend.onrender.com
Frontend: https://nama-emi-app.onrender.com (optional)
APK:      https://nama-emi-backend.onrender.com/downloads/nama-emi.apk
```

---

## 🌐 **Share with Customers**

### **Download Link**:
```
https://nama-emi-backend.onrender.com/downloads/nama-emi.apk
```

### **Instructions for Customers**:
```
1. Download Nama EMI App:
   https://nama-emi-backend.onrender.com/downloads/nama-emi.apk

2. Install the app

3. Scan QR code from admin panel

4. Done!
```

### **Create QR Code**:
Create a QR code for the download link at:
- https://qr-code-generator.com
- Or use: https://www.qr-code-generator.com/

---

## ⚠️ **Important Notes**

### **Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Good for testing
- Upgrade to Starter ($7/month) for production

### **APK Size Limit**:
- Render has no file size limit for static files
- Your APK (3.2 MB) is well within limits

### **Auto-Deploy**:
- Every `git push` triggers auto-deploy
- New APK available in ~2 minutes

---

## 🔧 **Quick Commands**

### **Deploy to Render**:
```bash
# Commit and push
git add .
git commit -m "Deploy to production"
git push origin main

# Render auto-deploys!
```

### **Update APK**:
```bash
# Rebuild APK
cd android && ./gradlew assembleRelease

# Copy to server
cp app/build/outputs/apk/release/app-release.apk ../server/public/downloads/nama-emi.apk

# Commit and push
git add server/public/downloads/nama-emi.apk
git commit -m "Update APK"
git push origin main
```

### **Test Production**:
```bash
# Test backend
curl https://nama-emi-backend.onrender.com/api/health

# Test APK download
curl -I https://nama-emi-backend.onrender.com/downloads/nama-emi.apk
```

---

## ✅ **Deployment Checklist**

- [ ] MongoDB Atlas cluster created
- [ ] Connection string obtained
- [ ] Render account created
- [ ] Web service configured
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] APK uploaded to server/public/downloads/
- [ ] APK download tested
- [ ] Frontend built with production URL
- [ ] APK rebuilt with production backend
- [ ] Everything committed to GitHub
- [ ] Production URLs shared with customers

---

## 🎯 **Summary**

**Deployment Flow**:
1. ✅ Commit APK to Git
2. ✅ Deploy backend to Render
3. ✅ Set up MongoDB Atlas
4. ✅ Test APK download
5. ✅ Rebuild APK with production URL
6. ✅ Share download link

**Result**:
- Backend running 24/7 on Render
- APK downloadable from anywhere
- No localhost dependency
- Ready for production!

**Your app is ready for worldwide deployment!** 🚀
