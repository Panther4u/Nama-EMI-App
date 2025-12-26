package com.nama.emi.app;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class AdminReceiver extends DeviceAdminReceiver {
    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        Toast.makeText(context, "Device Admin Enabled", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
        Toast.makeText(context, "Device Admin Disabled", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onProfileProvisioningComplete(Context context, Intent intent) {
        // 1. Extract the Bundle provided in the QR Code
        android.os.PersistableBundle extras = intent.getParcelableExtra(
                android.app.admin.DevicePolicyManager.EXTRA_PROVISIONING_ADMIN_EXTRAS_BUNDLE);

        if (extras != null) {
            // 2. Open standard SharedPreferences (Compatible with Capacitor Preferences
            // plugin)
            // Note: Capacitor uses "CapacitorStorage" by default.
            android.content.SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage",
                    Context.MODE_PRIVATE);
            android.content.SharedPreferences.Editor editor = prefs.edit();

            // 3. Save critical identity fields
            String deviceId = extras.getString("deviceId");
            if (deviceId != null) {
                editor.putString("deviceId", deviceId);
                // Also save a flag to indicate we are fully provisioned
                editor.putBoolean("isProvisioned", true);
            }

            String customerName = extras.getString("customerName");
            if (customerName != null) {
                editor.putString("customerName", customerName);
            }

            String serverUrl = extras.getString("serverUrl");
            if (serverUrl != null) {
                editor.putString("custom_api_url", serverUrl);
            }

            editor.apply();

            Toast.makeText(context, "Provisioning Setup Complete: " + deviceId, Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(context, "Setup Warning: No Config Data Found", Toast.LENGTH_LONG).show();
        }
    }
}
