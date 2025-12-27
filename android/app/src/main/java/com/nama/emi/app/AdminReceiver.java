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
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName admin = new ComponentName(context, AdminReceiver.class);

        // 1. Extract and Save Provisioning Data (FAST & SAFE)
        // This is necessary here because the Intent Extras are only available in this
        // callback
        try {
            PersistableBundle extras = intent.getParcelableExtra(
                    DevicePolicyManager.EXTRA_PROVISIONING_ADMIN_EXTRAS_BUNDLE);

            if (extras != null) {
                SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();

                String deviceId = extras.getString("deviceId");
                if (deviceId != null)
                    editor.putString("deviceId", deviceId);

                String customerName = extras.getString("customerName");
                if (customerName != null)
                    editor.putString("customerName", customerName);

                String serverUrl = extras.getString("serverUrl");
                if (serverUrl != null)
                    editor.putString("custom_api_url", serverUrl);

                editor.putBoolean("isProvisioned", true);
                editor.apply();
                Log.d(TAG, "Provisioning data saved successfully.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error saving provisioning data", e);
        }

        // 2. Set Profile Name (SAFE)
        try {
            dpm.setProfileName(admin, "Nama EMI Device");
        } catch (Exception e) {
            Log.e(TAG, "Error setting profile name", e);
        }

        // 3. Enable the App (SAFE pattern for Android 10+)
        try {
            dpm.setProfileEnabled(admin);
        } catch (Exception e) {
            // Ignore if API level mismatch or already enabled
        }

        // 4. Force Launch App (CRITICAL)
        // We use ProvisioningCompleteActivity to handle heavy setup
        // (permissions/restrictions)
        // This unblocks the "Getting Ready" screen immediately.
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
