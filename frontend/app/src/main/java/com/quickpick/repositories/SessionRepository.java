package com.quickpick.repositories;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MediatorLiveData;

import com.quickpick.apis.RetrofitUtils;
import com.quickpick.apis.SessionApi;
import com.quickpick.payloads.BasicResponse;
import com.quickpick.payloads.ChoicePayload;
import com.quickpick.payloads.CreateSessionRequest;
import com.quickpick.payloads.PostChoicesRequest;
import com.quickpick.payloads.SessionPayload;
import com.quickpick.payloads.UpdateListRequest;

import java.util.List;
import java.util.Optional;

import retrofit2.Call;

public class SessionRepository {

    private static final String SESSION_DEBUG = "SESSION";

    private static final SessionRepository SESSION_REPOSITORY = new SessionRepository();

    private final SessionApi sessionApi;

    private final MediatorLiveData<SessionPayload> session;

    private SessionRepository() {
        sessionApi = RetrofitUtils.getApi(SessionApi.class);
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
        Call<SessionPayload> createSessionCall = sessionApi.createSession(facebookToken, new CreateSessionRequest(6));
        createSessionCall.enqueue(new RepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            callback.run();
        }, SESSION_DEBUG));
    }

    public void joinSession(Runnable callback, String sessionId, String facebookToken) {
        Call<SessionPayload> joinSessionCall = sessionApi.joinSession(facebookToken, sessionId);
        joinSessionCall.enqueue(new RepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            callback.run();
        }, SESSION_DEBUG));
    }

    public void startSession(Runnable callback, String facebookToken) {
        Call<BasicResponse> startSessionCall = sessionApi.startSession(facebookToken, getCurrentSessionId());
        startSessionCall.enqueue(new RepositoryCallback<>(basicResponse -> callback.run(), SESSION_DEBUG));
    }

    public void postChoices(Runnable callback, String facebookToken, List<ChoicePayload> choices) {
        Call<BasicResponse> postChoicesCall = sessionApi.postChoices(facebookToken, getCurrentSessionId(), new PostChoicesRequest(choices));
        postChoicesCall.enqueue(new RepositoryCallback<>(basicResponse -> callback.run(), SESSION_DEBUG));
    }

    public void updateList(Runnable successCallback, Runnable failureCallback,
                           String facebookToken, String newListId) {
        Call<SessionPayload> updateListCall = sessionApi.updateList(facebookToken, getCurrentSessionId(), new UpdateListRequest(newListId));
        updateListCall.enqueue(new RepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            successCallback.run();
        }, failureCallback, SESSION_DEBUG));
    }

    private String getCurrentSessionId() {
        return Optional.ofNullable(session.getValue()).orElse(new SessionPayload()).getPin();
    }

}
