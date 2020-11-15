package com.quickpick.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ListsPayload;
import com.quickpick.repositories.ListRepository;
import com.quickpick.repositories.SessionRepository;

public class ListViewModel extends ViewModel {
    private LiveData<ListsPayload> lists;

    private LiveData<ListPayload> list;
    private LiveData<ListPayload> sessionList;

    public LiveData<ListsPayload> getLists() {
        if (lists == null) {
            lists = ListRepository.getInstance().getLists();
        }
        return lists;
    }

    public LiveData<ListPayload> getList() {
        if (list == null) {
            list = ListRepository.getInstance().getList();
        }
        return list;
    }

    public LiveData<ListPayload> getSessionList() {
        if (sessionList == null) {
            sessionList = SessionRepository.getInstance().getSessionList();
        }
        return sessionList;
    }
}
