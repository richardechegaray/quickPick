package com.quickpick;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {

    private Button createNewList, viewEditLists, joinSession, viewOldSessions, createSession;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        registerButtons();
    }

    private void registerButtons() {
        createNewList = findViewById(R.id.create_new_list_button);
        viewEditLists = findViewById(R.id.view_edit_lists_button);
        joinSession = findViewById(R.id.join_session_button);
        viewOldSessions = findViewById(R.id.view_old_sessions_button);
        createSession = findViewById(R.id.create_session_button);
    }
}