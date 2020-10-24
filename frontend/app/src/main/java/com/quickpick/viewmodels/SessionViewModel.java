package com.quickpick.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.quickpick.payloads.SessionPayload;
import com.quickpick.repositories.SessionRepository;

public class SessionViewModel extends ViewModel {
    private LiveData<SessionPayload> session;

    public LiveData<SessionPayload> getSession() {
        if (session == null) {
            session = SessionRepository.getInstance().getSession();
        }
        return session;
    }

}
