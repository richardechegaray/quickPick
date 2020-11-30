package com.quickpick.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.quickpick.R;
import com.quickpick.apis.LoginApi;
import com.quickpick.apis.RetrofitUtils;
import com.quickpick.payloads.LoginRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.internal.EverythingIsNonNull;

import static androidx.lifecycle.Lifecycle.State.RESUMED;

public class LoginActivity extends AppCompatActivity {

    private static final String LOGIN = "LOGIN";

    private LoginButton facebookLoginButton;

    private CallbackManager facebookCallbackManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        facebookLoginButton = findViewById(R.id.login_button);

        facebookCallbackManager = CallbackManager.Factory.create();
        registerFBButtonCallback();
    }

    @Override
    protected void onResume() {
        super.onResume();
        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken != null && !accessToken.isExpired()) {
            getFirebaseTokenAndCallLogin(accessToken.getToken());
        }
    }

    private void registerFBButtonCallback() {
        facebookLoginButton.setPermissions("email");
        facebookLoginButton.registerCallback(facebookCallbackManager, new FacebookCallback<LoginResult>() {
            @Override
            public void onSuccess(LoginResult loginResult) {
                Log.d(LOGIN, "Login success");
            }

            @Override
            public void onCancel() {
                Toast.makeText(getBaseContext(), "We need Facebook login to work!", Toast.LENGTH_LONG).show();
            }

            @Override
            public void onError(FacebookException exception) {
                Toast.makeText(getBaseContext(), "Error, try again!", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void getFirebaseTokenAndCallLogin(String facebookToken) {
        // Get FirebaseToken first, then on completion, call the login API
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> callLogin(task, facebookToken));
    }

    private void callLogin(Task<String> firebaseTokenTask, String facebookToken) {
        if (!getLifecycle().getCurrentState().isAtLeast(RESUMED)) {
            Log.d(LOGIN, "Extraneous call");
            return;
        }
        if (!firebaseTokenTask.isSuccessful()) {
            Log.w("FirebaseToken", "Fetching FCM registration token failed", firebaseTokenTask.getException());
            return;
        }

        String firebaseToken = firebaseTokenTask.getResult();
        LoginApi loginApi = RetrofitUtils.getApi(LoginApi.class);
        Log.d(LOGIN, String.format("facebookToken: %s, firebaseToken: %s", facebookToken, firebaseToken));
        Call<Void> loginCall = loginApi.login(facebookToken, new LoginRequest(firebaseToken));
        loginCall.enqueue(new Callback<Void>() {
            @Override
            @EverythingIsNonNull
            public void onResponse(Call<Void> call, Response<Void> response) {
                Log.d(LOGIN, response.toString());
                if (response.isSuccessful()) {
                    navigateToMainActivity();
                }
            }

            @Override
            @EverythingIsNonNull
            public void onFailure(Call<Void> call, Throwable t) {
                Log.d(LOGIN, call.request().toString(), t);
                Toast.makeText(getBaseContext(), "Error, try again!", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void navigateToMainActivity() {
        // Set flags to not allow navigation back to LoginActivity via back button
        startActivity(new Intent(LoginActivity.this, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        facebookCallbackManager.onActivityResult(requestCode, resultCode, data); // passes result to FB SDK
        super.onActivityResult(requestCode, resultCode, data);
    }
}