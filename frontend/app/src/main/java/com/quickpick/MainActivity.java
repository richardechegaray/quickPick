package com.quickpick;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.facebook.AccessToken;
import com.quickpick.payloads.SessionPayload;
import com.quickpick.repositories.SessionRepository;

public class MainActivity extends AppCompatActivity {

    private Button createNewList;
    private Button viewEditLists;
    private Button joinSession;
    private Button viewOldSessions;
    private Button createSession;

    private String facebookAccessToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
        }
        facebookAccessToken = accessToken.getToken();

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

        joinSession.setOnClickListener(view -> showAlertDialog());

        viewOldSessions.setOnClickListener(view ->
                startActivity(new Intent(getBaseContext(), ViewOldSessionsActivity.class))
        );

        createSession.setOnClickListener(view -> {
            SessionPayload payload = new SessionPayload();
            navigateToSessionActivity(payload);
            // TODO: Update this to do a POST to the server to create the session
        });
    }

    private void showAlertDialog() {
        AlertDialog dialog = new AlertDialog.Builder(MainActivity.this)
                .setTitle(getString(R.string.enter_session_id_title))
                .setView(R.layout.dialog_join_session)
                .create();
        dialog.show();

        EditText sessionCode = dialog.findViewById(R.id.session_code_edit_text);
        Button cancelButton = dialog.findViewById(R.id.dialog_cancel_button);
        Button joinButton = dialog.findViewById(R.id.dialog_join_button);

        if (cancelButton != null) {
            cancelButton.setOnClickListener(button -> dialog.dismiss());
        }
        if (joinButton != null && sessionCode != null) {
            joinButton.setOnClickListener(button -> {
                SessionRepository.getInstance().joinSession(this::navigateToSessionActivity, sessionCode.getText().toString(), facebookAccessToken);
                dialog.dismiss();
            });
        }
    }

    private void navigateToSessionActivity(SessionPayload payload) {
        startActivity(new Intent(getBaseContext(), SessionActivity.class).putExtra("session", payload));
    }
}