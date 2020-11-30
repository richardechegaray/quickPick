package com.quickpick.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.facebook.AccessToken;
import com.facebook.login.LoginManager;
import com.quickpick.R;
import com.quickpick.repositories.ListRepository;
import com.quickpick.repositories.RunnableUtils;
import com.quickpick.repositories.SessionRepository;

public class MainActivity extends AppCompatActivity {

    private String facebookAccessToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (facebookTokenIsInvalid()) {
            navigateBackToLoginActivity();
            return;
        }
        setContentView(R.layout.activity_main);
        setOnClickListeners();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (facebookTokenIsInvalid()) {
            navigateBackToLoginActivity();
        }
    }

    private boolean facebookTokenIsInvalid() {
        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            navigateBackToLoginActivity();
            return true;
        }
        facebookAccessToken = accessToken.getToken();
        return false;
    }

    private void setOnClickListeners() {
        findViewById(R.id.create_new_list_button).setOnClickListener(view ->
                startActivity(new Intent(getApplicationContext(), CreateOrUpdateListActivity.class))
        );

        findViewById(R.id.view_edit_lists_button).setOnClickListener(view ->
                ListRepository.getInstance().callGetLists(
                        () -> startActivity(new Intent(getApplicationContext(), ViewOrUpdateListsActivity.class)),
                        RunnableUtils.showToast(this, getString(R.string.get_lists_failed)),
                        facebookAccessToken
                )
        );

        findViewById(R.id.join_session_button).setOnClickListener(view -> showAlertDialog());

        findViewById(R.id.view_old_sessions_button).setOnClickListener(view ->
                startActivity(new Intent(getBaseContext(), ViewOldSessionsActivity.class))
        );

        findViewById(R.id.create_session_button).setOnClickListener(view ->
                SessionRepository.getInstance().createSession(this::navigateToSessionActivity, facebookAccessToken)
        );

        findViewById(R.id.logout_button).setOnClickListener(view ->
                {
                    LoginManager.getInstance().logOut();
                    navigateBackToLoginActivity();
                    finish();
                }
        );
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
                SessionRepository.getInstance().joinSession(this::navigateToSessionActivity,
                        RunnableUtils.showToast(this, getString(R.string.invalid_code)),
                        sessionCode.getText().toString(), facebookAccessToken);
                dialog.dismiss();
            });
        }
    }

    private void navigateToSessionActivity() {
        // Should not be able to navigate back to the session activity
        startActivity(new Intent(getBaseContext(), SessionActivity.class).addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY));
    }

    private void navigateBackToLoginActivity() {
        startActivity(new Intent(getBaseContext(), LoginActivity.class).setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK));
    }
}