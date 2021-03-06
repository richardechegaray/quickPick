package com.quickpick.repositories;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MediatorLiveData;
import androidx.lifecycle.MutableLiveData;

import com.quickpick.apis.RetrofitUtils;
import com.quickpick.apis.SessionApi;
import com.quickpick.payloads.ChoicePayload;
import com.quickpick.payloads.ListPayload;
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

    private final MutableLiveData<ListPayload> sessionList;

    private SessionRepository() {
        sessionApi = RetrofitUtils.getApi(SessionApi.class);
        session = new MediatorLiveData<>();
        sessionList = new MutableLiveData<>();
    }

    public static SessionRepository getInstance() {
        return SESSION_REPOSITORY;
    }

    public LiveData<SessionPayload> getSession() {
        return session;
    }

    public LiveData<ListPayload> getSessionList() {
        return sessionList;
    }

    public void addSessionSource(LiveData<SessionPayload> source) {
        session.addSource(source, session::setValue);
    }

    public void removeSessionSource(LiveData<SessionPayload> source) {
        session.removeSource(source);
    }

    public void createSession(Runnable callback, String facebookToken) {
        Call<SessionPayload> createSessionCall = sessionApi.createSession(facebookToken);
        createSessionCall.enqueue(new RepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            callback.run();
        }, SESSION_DEBUG));
    }

    public void joinSession(Runnable successCallback, Runnable failureCallback, String sessionId, String facebookToken) {
        Call<SessionPayload> joinSessionCall = sessionApi.joinSession(facebookToken, sessionId);
        joinSessionCall.enqueue(new RepositoryCallback<>(responsePayload -> {
            session.setValue(responsePayload);
            successCallback.run();
        }, failureCallback, SESSION_DEBUG));
    }

    public void startSession(Runnable callback, String facebookToken) {
        Call<Void> startSessionCall = sessionApi.startSession(facebookToken, getCurrentSessionId());
        startSessionCall.enqueue(new RepositoryCallback<>(basicResponse -> callback.run(), SESSION_DEBUG));
    }

    public void postChoices(Runnable callback, String facebookToken, List<ChoicePayload> choices) {
        Call<Void> postChoicesCall = sessionApi.postChoices(facebookToken, getCurrentSessionId(), new PostChoicesRequest(choices));
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

    public void callGetSessionList(Runnable successCallback, Runnable failureCallback, String facebookToken) {
        Call<ListPayload> getSessionListCall = sessionApi.getSessionList(facebookToken, getCurrentSessionId());
        getSessionListCall.enqueue(new RepositoryCallback<>(responsePayload -> {
            sessionList.setValue(responsePayload);
            successCallback.run();
        }, failureCallback, SESSION_DEBUG));
    }

    private String getCurrentSessionId() {
        return Optional.ofNullable(session.getValue()).orElse(new SessionPayload()).getPin();
    }

}
