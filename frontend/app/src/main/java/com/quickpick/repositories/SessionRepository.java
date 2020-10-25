package com.quickpick.repositories;

import android.util.Log;

import androidx.core.util.Consumer;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MediatorLiveData;

import com.quickpick.apis.RetrofitApiBuilder;
import com.quickpick.apis.SessionApi;
import com.quickpick.payloads.BasicResponse;
import com.quickpick.payloads.ChoicePayload;
import com.quickpick.payloads.CreateSessionRequest;
import com.quickpick.payloads.FacebookTokenRequest;
import com.quickpick.payloads.PostChoicesRequest;
import com.quickpick.payloads.SessionPayload;

import java.util.List;
import java.util.Optional;

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

    public void createSession(Runnable callback, String facebookToken) {
        // TODO: Remove hard-coded limit of 6 on party size
        Call<SessionPayload> createSessionCall = sessionApi.createSession(new CreateSessionRequest(facebookToken, 6));
        createSessionCall.enqueue(new SessionRepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            callback.run();
        }));
    }

    public void joinSession(Runnable callback, String sessionId, String facebookToken) {
        Call<SessionPayload> joinSessionCall = sessionApi.joinSession(sessionId, new FacebookTokenRequest(facebookToken));
        joinSessionCall.enqueue(new SessionRepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            callback.run();
        }));
    }

    public void startSession(Runnable callback, String facebookToken) {
        Call<BasicResponse> startSessionCall = sessionApi.startSession(getCurrentSessionId(), new FacebookTokenRequest(facebookToken));
        startSessionCall.enqueue(new SessionRepositoryCallback<>(basicResponse -> callback.run()));
    }

    public void postChoices(Runnable callback, String facebookToken, List<ChoicePayload> choices) {
        Call<BasicResponse> postChoicesCall = sessionApi.postChoices(getCurrentSessionId(), new PostChoicesRequest(facebookToken, choices));
        postChoicesCall.enqueue(new SessionRepositoryCallback<>(basicResponse -> callback.run()));
    }

    private String getCurrentSessionId() {
        return Optional.ofNullable(session.getValue()).orElse(new SessionPayload()).getPin();
    }

    private static class SessionRepositoryCallback<T> implements Callback<T> {
        private final Consumer<T> onSuccessCallback;

        SessionRepositoryCallback(Consumer<T> onSuccessCallback) {
            this.onSuccessCallback = onSuccessCallback;
        }

        @Override
        @EverythingIsNonNull
        public void onResponse(Call<T> call, Response<T> response) {
            Log.d(SESSION_DEBUG, response.toString());
            if (response.isSuccessful()) {
                onSuccessCallback.accept(response.body());
            }
        }

        @Override
        @EverythingIsNonNull
        public void onFailure(Call<T> call, Throwable t) {
            Log.d(SESSION_DEBUG, call.request().toString(), t);
        }
    }
}
