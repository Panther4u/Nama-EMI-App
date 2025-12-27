package com.nama.emi.app;

import android.app.admin.DeviceAdminReceiver;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.PersistableBundle;
import android.util.Log;
import android.widget.Toast;

public class AdminReceiver extends DeviceAdminReceiver {
    private static final String TAG = "AdminReceiver";

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
    }

    @Override
    public void onProfileProvisioningComplete(Context context, Intent intent) {
        Log.d(TAG, "onProfileProvisioningComplete called");
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName admin = new ComponentName(context, AdminReceiver.class);

        // 1. Extract and Save Provisioning Data (FAST & SAFE)
        try {
            PersistableBundle extras = intent.getParcelableExtra(
                    DevicePolicyManager.EXTRA_PROVISIONING_ADMIN_EXTRAS_BUNDLE);

            if (extras != null) {
                Log.d(TAG, "Provisioning extras found");
                SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();

                String deviceId = extras.getString("deviceId");
                if (deviceId != null) {
                    editor.putString("deviceId", deviceId);
                    Log.d(TAG, "Saved deviceId: " + deviceId);
                }

                String customerName = extras.getString("customerName");
                if (customerName != null) {
                    editor.putString("customerName", customerName);
                    Log.d(TAG, "Saved customerName: " + customerName);
                }

                String serverUrl = extras.getString("serverUrl");
                if (serverUrl != null) {
                    editor.putString("custom_api_url", serverUrl);
                    Log.d(TAG, "Saved serverUrl: " + serverUrl);
                }

                editor.putBoolean("isProvisioned", true);
                editor.apply();
                Log.d(TAG, "All provisioning data saved successfully");
            } else {
                Log.w(TAG, "No provisioning extras found");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error saving provisioning data", e);
        }

        // 2. Set Organization Name
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                dpm.setOrganizationName(admin, "Nama EMI");
                Log.d(TAG, "Organization name set");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting organization name", e);
        }

        // 3. Set Profile Name
        try {
            dpm.setProfileName(admin, "Nama EMI Device");
            Log.d(TAG, "Profile name set");
        } catch (Exception e) {
            Log.e(TAG, "Error setting profile name", e);
        }

        // 4. Enable the Profile
        try {
            dpm.setProfileEnabled(admin);
            Log.d(TAG, "Profile enabled successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error enabling profile", e);
        }

        // 5. Launch Provisioning Complete Activity
        Log.d(TAG, "Launching ProvisioningCompleteActivity");
        launchApp(context);
    }

    private void launchApp(Context context) {
        try {
            Intent launch = new Intent(context, ProvisioningCompleteActivity.class);
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launch);
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch app", e);
            // Fallback
            try {
                Intent fallback = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                if (fallback != null) {
                    fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(fallback);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }
}
