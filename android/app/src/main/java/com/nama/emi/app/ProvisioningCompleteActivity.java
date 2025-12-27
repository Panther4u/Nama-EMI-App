package com.nama.emi.app;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.UserManager;
import android.util.Log;
import android.widget.Toast;

/**
 * This activity is launched after provisioning to signal to Android that setup
 * is complete.
 * It performs post-provisioning configuration (permissions, restrictions) and
 * then
 * redirects to MainActivity.
 */
public class ProvisioningCompleteActivity extends Activity {
    private static final String TAG = "ProvisionComplete";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "ProvisioningCompleteActivity onCreate started");

        // Perform Device Owner Configuration
        configureDeviceOwner();

        // Launch the main app
        Log.d(TAG, "Launching MainActivity");
        Intent mainIntent = new Intent(this, MainActivity.class);
        mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(mainIntent);

        // Finish this activity after a short delay
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "Finishing ProvisioningCompleteActivity");
                finish();
            }
        }, 500);
    }

    private void configureDeviceOwner() {
        Log.d(TAG, "Starting device owner configuration");
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
            ComponentName admin = new ComponentName(this, AdminReceiver.class);

            if (dpm.isDeviceOwnerApp(getPackageName())) {
                Log.d(TAG, "App is confirmed as Device Owner");

                // 1. Set Permission Policy to AUTO_GRANT
                dpm.setPermissionPolicy(admin, DevicePolicyManager.PERMISSION_POLICY_AUTO_GRANT);
                Log.d(TAG, "Permission policy set to AUTO_GRANT");

                // 2. Explicitly Grant Critical Permissions
                String packageName = getPackageName();
                String[] permissions = {
                        android.Manifest.permission.CAMERA,
                        android.Manifest.permission.ACCESS_FINE_LOCATION,
                        android.Manifest.permission.ACCESS_COARSE_LOCATION,
                        android.Manifest.permission.READ_PHONE_STATE,
                        android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                        android.Manifest.permission.READ_EXTERNAL_STORAGE
                };

                int grantedCount = 0;
                for (String perm : permissions) {
                    try {
                        dpm.setPermissionGrantState(admin, packageName, perm,
                                DevicePolicyManager.PERMISSION_GRANT_STATE_GRANTED);
                        grantedCount++;
                    } catch (Exception e) {
                        Log.w(TAG, "Failed to grant permission: " + perm, e);
                    }
                }
                Log.d(TAG, "Granted " + grantedCount + " of " + permissions.length + " permissions");

                // 3. Configure User Restrictions
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_INSTALL_UNKNOWN_SOURCES);
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_INSTALL_APPS);
                Log.d(TAG, "User restrictions configured");

                Toast.makeText(this, "Device Configured Successfully", Toast.LENGTH_SHORT).show();
                Log.d(TAG, "Device owner configuration completed successfully");
            } else {
                Log.w(TAG, "App is NOT a Device Owner - configuration skipped");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error during device owner configuration", e);
        }
    }
}
