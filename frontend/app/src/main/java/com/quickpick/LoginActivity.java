package com.quickpick;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        findViewById(R.id.login_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Don't allow navigation back to LoginActivity via back button
                startActivity(new Intent(LoginActivity.this, MainActivity.class)
                                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
            }
        });
    }
}