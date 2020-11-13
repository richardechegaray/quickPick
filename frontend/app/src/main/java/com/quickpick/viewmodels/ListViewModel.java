package com.quickpick.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ListsPayload;
import com.quickpick.repositories.ListRepository;

public class ListViewModel extends ViewModel {
    private LiveData<ListsPayload> lists;

    private LiveData<ListPayload> list;

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
}
