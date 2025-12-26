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
    public void removeDeviceOwner(PluginCall call) {
        Context context = getContext();
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(context, AdminReceiver.class);

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
}
