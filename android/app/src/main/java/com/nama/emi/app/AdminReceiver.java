package com.nama.emi.app;

import android.app.admin.DeviceAdminReceiver;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.PersistableBundle;
import android.os.UserManager;
import android.widget.Toast;

public class AdminReceiver extends DeviceAdminReceiver {
    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        // Failsafe: Try to launch app here too
        launchApp(context);
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
    }

    @Override
    public void onProfileProvisioningComplete(Context context, Intent intent) {
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName admin = new ComponentName(context, AdminReceiver.class);

        // 1. Set Permission Policy to AUTO_GRANT
        // This ensures all runtime permissions (Camera, Location, etc.) are
        // automatically granted
        // without asking the user.
        try {
            dpm.setPermissionPolicy(admin, DevicePolicyManager.PERMISSION_POLICY_AUTO_GRANT);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 2. Explicitly Grant Critical Permissions to Self
        // Just to be absolutely sure, we grant specific permissions to our own package.
        String packageName = context.getPackageName();
        String[] permissions = {
                android.Manifest.permission.CAMERA,
                android.Manifest.permission.ACCESS_FINE_LOCATION,
                android.Manifest.permission.ACCESS_COARSE_LOCATION,
                android.Manifest.permission.READ_PHONE_STATE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                android.Manifest.permission.READ_EXTERNAL_STORAGE
        };

        for (String perm : permissions) {
            try {
                dpm.setPermissionGrantState(admin, packageName, perm,
                        DevicePolicyManager.PERMISSION_GRANT_STATE_GRANTED);
            } catch (Exception e) {
                // Ignore if permission doesn't exist on this API level
            }
        }

        // 3. Configure User Restrictions
        // Allow installing apps from unknown sources (if that was the request)
        // Note: By default this is allowed unless DISALLOW_INSTALL_UNKNOWN_SOURCES is
        // set to true.
        // We strictly ensure it is NOT disallowed.
        try {
            dpm.clearUserRestriction(admin, UserManager.DISALLOW_INSTALL_UNKNOWN_SOURCES);
            dpm.clearUserRestriction(admin, UserManager.DISALLOW_INSTALL_APPS);

            // Optional: Prevent user from uninstalling apps (if needed)
            // dpm.addUserRestriction(admin, UserManager.DISALLOW_UNINSTALL_APPS);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 4. Extract and Save Provisioning Data
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
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 5. Set Profile Name
        try {
            dpm.setProfileName(admin, "Nama EMI Device");
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 6. Force Launch App
        launchApp(context);
    }

    private void launchApp(Context context) {
        try {
            Intent launch = new Intent(context, ProvisioningCompleteActivity.class);
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launch);
            Toast.makeText(context, "Setup Complete. Launching...", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            e.printStackTrace();
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
