package com.quickpick;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;

public class LoginActivity extends AppCompatActivity {

    private LoginButton facebookLoginButton;

    private CallbackManager facebookCallbackManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Check token prior to inflating layout, in case we are already logged in
        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken != null && !accessToken.isExpired()) {
            callLogin(accessToken.getToken());
        }
        setContentView(R.layout.activity_login);

        // TODO: Delete this when facebook login is required
        findViewById(R.id.temp_bypass_button).setOnClickListener(view -> navigateToMainActivity());

        facebookLoginButton = findViewById(R.id.login_button);

        facebookCallbackManager = CallbackManager.Factory.create();
        registerFBButtonCallback();
    }

    private void registerFBButtonCallback() {
        facebookLoginButton.setPermissions("email");
        facebookLoginButton.registerCallback(facebookCallbackManager, new FacebookCallback<LoginResult>() {
            @Override
            public void onSuccess(LoginResult loginResult) {
                callLogin(loginResult.getAccessToken().getToken());
            }

            @Override
            public void onCancel() {
                Toast.makeText(getBaseContext(), "We need FB login to work!", Toast.LENGTH_LONG).show();
            }

            @Override
            public void onError(FacebookException exception) {
                Toast.makeText(getBaseContext(), "Error, try again!", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void callLogin(String facebookToken) {
        // Get FirebaseToken first, then on completion, call the login API
//        TODO: Uncomment to get FirebaseToken when FCMClient is merged
//        FirebaseMessaging.getInstance().getToken()
//                .addOnCompleteListener(new OnCompleteListener<String>() {
//                    @Override
//                    public void onComplete(@NonNull Task<String> task) {
//                        if (!task.isSuccessful()) {
//                            Log.w("FirebaseToken", "Fetching FCM registration token failed", task.getException());
//                            return;
//                        }
//
//                        // Get new FCM registration token
//
//                        String firebaseToken = task.getResult();
//                        Log.d("FirebaseToken", firebaseToken);
//                        LoginAPI loginApi = RetrofitAPIBuilder.getApi(LoginAPI.class);
//                        Call<Boolean> loginCall = loginApi.login(new LoginPayload(facebookToken, firebaseToken));
//                        loginCall.enqueue(new Callback<Boolean>() {
//                            @Override
//                            public void onResponse(Call<Boolean> call, Response<Boolean> response) {
//                                navigateToMainActivity();
//                            }
//
//                            @Override
//                            public void onFailure(Call<Boolean> call, Throwable t) {
//                                Log.d("Login", call.request().toString(), t);
//                                Toast.makeText(getBaseContext(), "Error, try again!", Toast.LENGTH_LONG).show();
//                            }
//                        });
//                    }
//                });
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