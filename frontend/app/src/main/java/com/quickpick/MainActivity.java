package com.quickpick;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private Button createNewList;
    private Button viewEditLists;
    private Button joinSession;
    private Button viewOldSessions;
    private Button createSession;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        registerButtons();
        setOnClickListeners();
    }

    private void registerButtons() {
        createNewList = findViewById(R.id.create_new_list_button);
        viewEditLists = findViewById(R.id.view_edit_lists_button);
        joinSession = findViewById(R.id.join_session_button);
        viewOldSessions = findViewById(R.id.view_old_sessions_button);
        createSession = findViewById(R.id.create_session_button);
    }

    private void setOnClickListeners() {
        createNewList.setOnClickListener(view ->
                startActivity(new Intent(getApplicationContext(), CreateNewListActivity.class))
        );

        viewEditLists.setOnClickListener(view ->
                startActivity(new Intent(getApplicationContext(), ViewEditListsActivity.class))
        );

        joinSession.setOnClickListener(view ->
                new AlertDialog.Builder(MainActivity.this)
                        .setMessage(getString(R.string.enter_session_id_title))
                        .setTitle(getString(R.string.enter_session_id_title))
                        .create()
                        .show());

        viewOldSessions.setOnClickListener(view ->

                startActivity(new Intent(getBaseContext(), ViewOldSessionsActivity.class))
        );

        createSession.setOnClickListener(view ->

                startActivity(new Intent(getBaseContext(), SessionActivity.class))
        );
    }
}