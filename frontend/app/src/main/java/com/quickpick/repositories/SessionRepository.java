package com.quickpick.repositories;

import android.util.Log;

import androidx.core.util.Consumer;
import androidx.lifecycle.LiveData;

import com.quickpick.apis.RetrofitApiBuilder;
import com.quickpick.apis.SessionApi;
import com.quickpick.payloads.FacebookTokenPayload;
import com.quickpick.payloads.SessionPayload;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.internal.EverythingIsNonNull;

public class SessionRepository {

    private LiveData<String> sessionInfo;

    private final SessionApi sessionApi;

    private static final SessionRepository SESSION_REPOSITORY = new SessionRepository();

    private static final String SESSION = "SESSION";

    private SessionRepository() {
        sessionApi = RetrofitApiBuilder.getApi(SessionApi.class);
    }

    public static SessionRepository getInstance() {
        return SESSION_REPOSITORY;
    }

    public LiveData<String> getSessionInfo() {
        return sessionInfo;
    }

    public void setSessionInfo(LiveData<String> sessionInfo) {
        this.sessionInfo = sessionInfo;
    }

    public void joinSession(Consumer<SessionPayload> consumer, String sessionId, String facebookToken) {
        Call<SessionPayload> joinSessionCall = sessionApi.joinSession(sessionId, new FacebookTokenPayload(facebookToken));
        joinSessionCall.enqueue(new Callback<SessionPayload>() {
            @Override
            @EverythingIsNonNull
            public void onResponse(Call<SessionPayload> call, Response<SessionPayload> response) {
                Log.d(SESSION, response.toString());
                if (response.isSuccessful()) {
                    consumer.accept(response.body());
                }
            }

            @Override
            @EverythingIsNonNull
            public void onFailure(Call<SessionPayload> call, Throwable t) {
                Log.d(SESSION, call.request().toString(), t);
            }
        });
    }
}
