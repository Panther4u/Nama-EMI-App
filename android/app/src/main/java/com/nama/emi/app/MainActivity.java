package com.nama.emi.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(WipeDevicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
