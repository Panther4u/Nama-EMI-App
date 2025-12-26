package com.nama.emi.app;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class AdminReceiver extends DeviceAdminReceiver {
    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        // Failsafe: Try to launch app here too, just in case Provisioning Complete
        // doesn't fire
        launchApp(context);
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
    }

    @Override
    public void onProfileProvisioningComplete(Context context, Intent intent) {
        // 1. Get DPM
        android.app.admin.DevicePolicyManager dpm = (android.app.admin.DevicePolicyManager) context
                .getSystemService(Context.DEVICE_POLICY_SERVICE);
        android.content.ComponentName admin = new android.content.ComponentName(context, AdminReceiver.class);

        // 2. Mark User Setup Complete
        // Note: setUserProvisioningState is deprecated/removed in newer SDKs.
        // We rely on startActivity to finish setup.
        /*
         * try {
         * // dpm.setUserProvisioningState(android.app.admin.DevicePolicyManager.
         * STATE_USER_SETUP_COMPLETE);
         * } catch (Exception e) {
         * e.printStackTrace();
         * }
         */

        // 3. Extract and Save Data (Safe Mode)
        try {
            android.os.PersistableBundle extras = intent.getParcelableExtra(
                    android.app.admin.DevicePolicyManager.EXTRA_PROVISIONING_ADMIN_EXTRAS_BUNDLE);

            if (extras != null) {
                android.content.SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage",
                        Context.MODE_PRIVATE);
                android.content.SharedPreferences.Editor editor = prefs.edit();

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

        // 4. Set Profile Name (Optional)
        try {
            dpm.setProfileName(admin, "Nama EMI Device");
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 5. Force Launch App
        launchApp(context);
    }

    private void launchApp(Context context) {
        try {
            Intent launch = new Intent(context, ProvisioningCompleteActivity.class);
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launch);
            Toast.makeText(context, "Provisioning Complete. Starting App...", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to package manager launch
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
