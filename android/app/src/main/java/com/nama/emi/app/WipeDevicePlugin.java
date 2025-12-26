package com.nama.emi.app;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WipeDevice")
public class WipeDevicePlugin extends Plugin {

    @PluginMethod
    public void wipe(PluginCall call) {
        Context context = getContext();
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(context, AdminReceiver.class);

        if (dpm.isAdminActive(adminComponent)) {
            try {
                // Determine wipe flags. 0 is standard factory reset.
                // WIPE_EXTERNAL_STORAGE might be needed depending on OS version usage, but 0 is
                // safest "Factory Reset".
                dpm.wipeData(0);
                call.resolve();
            } catch (SecurityException e) {
                call.reject("Security Exception: " + e.getMessage());
            } catch (Exception e) {
                call.reject("Wipe Failed: " + e.getMessage());
            }
        } else {
            call.reject("Device Admin not active");
        }
    }

    @PluginMethod
    public void getSimInfo(PluginCall call) {
        try {
            android.telephony.TelephonyManager tm = (android.telephony.TelephonyManager) getContext()
                    .getSystemService(Context.TELEPHONY_SERVICE);
            String carrier = tm.getSimOperatorName();
            if (carrier == null || carrier.isEmpty()) {
                carrier = tm.getNetworkOperatorName();
            }
            if (carrier == null || carrier.isEmpty()) {
                carrier = "Unknown / No SIM";
            }

            JSObject ret = new JSObject();
            ret.put("carrier", carrier);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to get SIM info: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getAdminStatus(PluginCall call) {
        Context context = getContext();
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(context, AdminReceiver.class);

        JSObject ret = new JSObject();
        ret.put("isAdminActive", dpm.isAdminActive(adminComponent));
        ret.put("isDeviceOwner", dpm.isDeviceOwnerApp(context.getPackageName()));
        call.resolve(ret);
    }

    @PluginMethod
    public void requestAdmin(PluginCall call) {
        Context context = getContext();
        ComponentName adminComponent = new ComponentName(context, AdminReceiver.class);
        android.content.Intent intent = new android.content.Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Required for Nama EMI application security.");
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void removeDeviceOwner(PluginCall call) {
        Context context = getContext();
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);

        try {
            if (dpm.isDeviceOwnerApp(context.getPackageName())) {
                dpm.clearDeviceOwnerApp(context.getPackageName());
                call.resolve();
            } else {
                call.reject("App is not Device Owner");
            }
        } catch (Exception e) {
            call.reject("Failed to release control: " + e.getMessage());
        }
    }

    @PluginMethod
    public void enforceDeviceRestrictions(PluginCall call) {
        Context context = getContext();
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(context, AdminReceiver.class);

        if (dpm.isDeviceOwnerApp(context.getPackageName())) {
            try {
                // Disable factory reset
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_FACTORY_RESET);

                // Disable safe mode
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_SAFE_BOOT);

                // Disable adding users
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_ADD_USER);

                // Disable USB file transfer
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_USB_FILE_TRANSFER);

                // Disable uninstalling apps
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_UNINSTALL_APPS);

                // Disable modifying accounts
                dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_MODIFY_ACCOUNTS);

                // Set lock task packages (kiosk mode)
                dpm.setLockTaskPackages(adminComponent, new String[] { context.getPackageName() });

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Device restrictions enforced");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to enforce restrictions: " + e.getMessage());
            }
        } else {
            call.reject("App is not Device Owner");
        }
    }

    @PluginMethod
    public void disableCamera(PluginCall call) {
        DevicePolicyManager dpm = (DevicePolicyManager) getContext().getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(getContext(), AdminReceiver.class);

        boolean disable = call.getBoolean("disable", true);

        if (dpm.isDeviceOwnerApp(getContext().getPackageName())) {
            dpm.setCameraDisabled(adminComponent, disable);
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("cameraDisabled", disable);
            call.resolve(ret);
        } else {
            call.reject("Not Device Owner");
        }
    }

    @PluginMethod
    public void disableScreenCapture(PluginCall call) {
        DevicePolicyManager dpm = (DevicePolicyManager) getContext().getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(getContext(), AdminReceiver.class);

        boolean disable = call.getBoolean("disable", true);

        if (dpm.isDeviceOwnerApp(getContext().getPackageName())) {
            dpm.setScreenCaptureDisabled(adminComponent, disable);
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("screenCaptureDisabled", disable);
            call.resolve(ret);
        } else {
            call.reject("Not Device Owner");
        }
    }

    @PluginMethod
    public void setNetworkRestrictions(PluginCall call) {
        DevicePolicyManager dpm = (DevicePolicyManager) getContext().getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(getContext(), AdminReceiver.class);

        boolean disableWifi = call.getBoolean("disableWifi", false);
        boolean disableMobileData = call.getBoolean("disableMobileData", false);

        if (dpm.isDeviceOwnerApp(getContext().getPackageName())) {
            try {
                if (disableWifi) {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI);
                } else {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_WIFI);
                }

                if (disableMobileData) {
                    dpm.addUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_MOBILE_NETWORKS);
                } else {
                    dpm.clearUserRestriction(adminComponent, android.os.UserManager.DISALLOW_CONFIG_MOBILE_NETWORKS);
                }

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("wifiDisabled", disableWifi);
                ret.put("mobileDataDisabled", disableMobileData);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to set network restrictions: " + e.getMessage());
            }
        } else {
            call.reject("Not Device Owner");
        }
    }

    @PluginMethod
    public void lockDevice(PluginCall call) {
        DevicePolicyManager dpm = (DevicePolicyManager) getContext().getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(getContext(), AdminReceiver.class);

        if (dpm.isAdminActive(adminComponent)) {
            dpm.lockNow();
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Device locked");
            call.resolve(ret);
        } else {
            call.reject("Device Admin not active");
        }
    }

    @PluginMethod
    public void startLockTaskMode(PluginCall call) {
        // Must be called from the Activity context to pin the screen
        if (getActivity() != null) {
            getActivity().startLockTask();
            call.resolve();
        } else {
            call.reject("Activity not found");
        }
    }

    @PluginMethod
    public void stopLockTaskMode(PluginCall call) {
        if (getActivity() != null) {
            getActivity().stopLockTask();
            call.resolve();
        } else {
            call.reject("Activity not found");
        }
    }

    @PluginMethod
    public void checkTamperAttempts(PluginCall call) {
        Context context = getContext();
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(context, AdminReceiver.class);

        JSObject result = new JSObject();

        // Check if still Device Owner
        boolean isDeviceOwner = dpm.isDeviceOwnerApp(context.getPackageName());
        result.put("isDeviceOwner", isDeviceOwner);

        // Check if admin is active
        boolean isAdminActive = dpm.isAdminActive(adminComponent);
        result.put("isAdminActive", isAdminActive);

        // Check if developer options enabled
        try {
            boolean devOptionsEnabled = android.provider.Settings.Global.getInt(
                    context.getContentResolver(),
                    android.provider.Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) != 0;
            result.put("developerOptionsEnabled", devOptionsEnabled);
        } catch (Exception e) {
            result.put("developerOptionsEnabled", false);
        }

        // Check if ADB enabled
        try {
            boolean adbEnabled = android.provider.Settings.Global.getInt(
                    context.getContentResolver(),
                    android.provider.Settings.Global.ADB_ENABLED, 0) != 0;
            result.put("adbEnabled", adbEnabled);
        } catch (Exception e) {
            result.put("adbEnabled", false);
        }

        // Overall tamper status
        boolean tampered = !isDeviceOwner || !isAdminActive;
        result.put("tampered", tampered);

        call.resolve(result);
    }
}
