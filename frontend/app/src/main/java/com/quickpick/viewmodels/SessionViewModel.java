package com.quickpick.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.quickpick.repositories.SessionRepository;

public class SessionViewModel extends ViewModel {
    private LiveData<String> sessionInfo;

    public LiveData<String> getSessionInfo() {
        if (sessionInfo == null) {
            sessionInfo = SessionRepository.getInstance().getSessionInfo();
        }
        return sessionInfo;
    }

}
