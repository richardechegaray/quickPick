package com.quickpick.repositories;

import androidx.lifecycle.LiveData;

public class SessionRepository {

    private LiveData<String> sessionInfo;

    private static final SessionRepository SESSION_REPOSITORY = new SessionRepository();

    private SessionRepository() {
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
}
