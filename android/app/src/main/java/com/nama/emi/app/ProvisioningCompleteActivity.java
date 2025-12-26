package com.nama.emi.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

/**
 * This activity is launched after provisioning to signal to Android that setup
 * is complete.
 * It immediately redirects to MainActivity.
 */
public class ProvisioningCompleteActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Immediately launch the main app
        Intent mainIntent = new Intent(this, MainActivity.class);
        mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(mainIntent);

        // Finish this activity
        finish();
    }
}
