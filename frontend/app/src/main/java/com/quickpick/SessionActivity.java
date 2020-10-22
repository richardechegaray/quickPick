package com.quickpick;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class SessionActivity extends AppCompatActivity {

    private Button foods, movies, sports;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        registerButtons();
        setOnClickListeners();
    }

    private void registerButtons() {
        foods = findViewById(R.id.food_button);
        movies = findViewById(R.id.movie_button);
        sports = findViewById(R.id.sport_button);
    }

    private void setOnClickListeners() {
        foods.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(getApplicationContext(), SwipeActivity.class));
            }
        });

        movies.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(getApplicationContext(), SwipeActivity.class));
            }
        });

        sports.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(getBaseContext(), SwipeActivity.class));
            }
        });

    }
}