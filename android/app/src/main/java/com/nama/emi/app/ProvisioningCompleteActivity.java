package com.nama.emi.app;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.UserManager;
import android.widget.Toast;

/**
 * This activity is launched after provisioning to signal to Android that setup
 * is complete.
 * It performs post-provisioning configuration (permissions, restrictions) and
 * then
 * redirects to MainActivity.
 */
public class ProvisioningCompleteActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Perform Device Owner Configuration here (moved from AdminReceiver)
        configureDeviceOwner();

        // Immediately launch the main app
        Intent mainIntent = new Intent(this, MainActivity.class);
        mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(mainIntent);

        // Finish this activity
        finish();
    }

    private void configureDeviceOwner() {
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
            ComponentName admin = new ComponentName(this, AdminReceiver.class);

            if (dpm.isDeviceOwnerApp(getPackageName())) {
                // 1. Set Permission Policy to AUTO_GRANT
                dpm.setPermissionPolicy(admin, DevicePolicyManager.PERMISSION_POLICY_AUTO_GRANT);

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

                for (String perm : permissions) {
                    try {
                        dpm.setPermissionGrantState(admin, packageName, perm,
                                DevicePolicyManager.PERMISSION_GRANT_STATE_GRANTED);
                    } catch (Exception ignored) {
                    }
                }

                // 3. Configure User Restrictions
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_INSTALL_UNKNOWN_SOURCES);
                dpm.clearUserRestriction(admin, UserManager.DISALLOW_INSTALL_APPS);

                // Optional: Prevent user from uninstalling apps
                // dpm.addUserRestriction(admin, UserManager.DISALLOW_UNINSTALL_APPS);

                Toast.makeText(this, "Device Configured Successfully", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
