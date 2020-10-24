package com.quickpick.repositories;

import android.util.Log;

import androidx.core.util.Consumer;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MediatorLiveData;

import com.quickpick.apis.RetrofitApiBuilder;
import com.quickpick.apis.SessionApi;
import com.quickpick.payloads.CreateSessionRequest;
import com.quickpick.payloads.FacebookTokenRequest;
import com.quickpick.payloads.SessionPayload;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.internal.EverythingIsNonNull;

public class SessionRepository {

    private static final String SESSION_DEBUG = "SESSION";

    private static final SessionRepository SESSION_REPOSITORY = new SessionRepository();

    private final SessionApi sessionApi;

    private final MediatorLiveData<SessionPayload> session;

    private SessionRepository() {
        sessionApi = RetrofitApiBuilder.getApi(SessionApi.class);
        session = new MediatorLiveData<>();
    }

    public static SessionRepository getInstance() {
        return SESSION_REPOSITORY;
    }

    public LiveData<SessionPayload> getSession() {
        return session;
    }

    public void addSessionSource(LiveData<SessionPayload> source) {
        session.addSource(source, session::setValue);
    }

    public void removeSessionSource(LiveData<SessionPayload> source) {
        session.removeSource(source);
    }

    public void createSession(Consumer<SessionPayload> consumer, String facebookToken) {
        // TODO: Remove hard-coded limit of 6 on party size
        Call<SessionPayload> createSessionCall = sessionApi.createSession(new CreateSessionRequest(facebookToken, 6));
        createSessionCall.enqueue(new SessionRepositoryCallback(consumer));
    }

    public void joinSession(Consumer<SessionPayload> consumer, String sessionId, String
            facebookToken) {
        Call<SessionPayload> joinSessionCall = sessionApi.joinSession(sessionId, new FacebookTokenRequest(facebookToken));
        joinSessionCall.enqueue(new SessionRepositoryCallback(consumer));
    }

    private class SessionRepositoryCallback implements Callback<SessionPayload> {
        private final Consumer<SessionPayload> onSuccessCallback;

        SessionRepositoryCallback(Consumer<SessionPayload> onSuccessCallback) {
            this.onSuccessCallback = onSuccessCallback;
        }

        @Override
        @EverythingIsNonNull
        public void onResponse(Call<SessionPayload> call, Response<SessionPayload> response) {
            Log.d(SESSION_DEBUG, response.toString());
            if (response.isSuccessful()) {
                session.setValue(response.body());
                onSuccessCallback.accept(response.body());
            }
        }

        @Override
        @EverythingIsNonNull
        public void onFailure(Call<SessionPayload> call, Throwable t) {
            Log.d(SESSION_DEBUG, call.request().toString(), t);
        }
    }
}
