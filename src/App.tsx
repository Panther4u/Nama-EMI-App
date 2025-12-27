import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DeviceProvider } from "@/context/DeviceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MobileClient from "./pages/mobile/MobileClient";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// Check if running on native mobile platform
const isMobileApp = Capacitor.isNativePlatform();

// Check if this is the admin variant
const useAppVariant = () => {
  const [isAdminApp, setIsAdminApp] = useState(false);

  useEffect(() => {
    if (isMobileApp) {
      CapApp.getInfo().then(info => {
        // Admin APK has applicationId "com.nama.emi.admin"
        setIsAdminApp(info.id === 'com.nama.emi.admin');
      });
    }
  }, []);

  return { isAdminApp, isMobileApp };
};

import Entry from "./Entry";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { isAdminApp, isMobileApp } = useAppVariant();

  // User APK on mobile: block admin access
  if (isMobileApp && !isAdminApp) {
    return <Navigate to="/mobile" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAdminApp, isMobileApp } = useAppVariant();

  return (
    <Routes>
      {/* User APK: Only show lockscreen, block admin access */}
      {isMobileApp && !isAdminApp ? (
        <>
          <Route path="/" element={<Navigate to="/mobile" replace />} />
          <Route path="/mobile" element={<MobileClient />} />
          <Route path="/mobile/:deviceId" element={<MobileClient />} />
          <Route path="*" element={<Navigate to="/mobile" replace />} />
        </>
      ) : isMobileApp && isAdminApp ? (
        <>
          {/* Admin APK: Full admin access on mobile */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      ) : (
        <>
          {/* Web App: Full admin access */}
          <Route path="/" element={<Entry />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/mobile" element={<MobileClient />} />
          <Route path="/mobile/:deviceId" element={<MobileClient />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <DeviceProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="mobile-wrapper">
                <div className="mobile-container">
                  <AppRoutes />
                </div>
              </div>
            </BrowserRouter>
          </DeviceProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
