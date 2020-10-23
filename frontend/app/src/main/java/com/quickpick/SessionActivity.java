package com.quickpick;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class SessionActivity extends AppCompatActivity {

    private Button startSwipingButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        registerButtons();
        setOnClickListeners();
    }

    private void registerButtons() {
        startSwipingButton = findViewById(R.id.start_swiping_button);
    }

    private void setOnClickListeners() {
        startSwipingButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(getApplicationContext(), SwipeActivity.class));
            }
        });

    }
}