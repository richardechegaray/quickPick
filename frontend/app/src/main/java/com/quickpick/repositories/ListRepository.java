package com.quickpick.repositories;

import androidx.lifecycle.MediatorLiveData;

import com.quickpick.apis.ListApi;
import com.quickpick.apis.RetrofitApiBuilder;
import com.quickpick.payloads.ListPayload;

public class ListRepository {

    private static final String LIST_DEBUG = "LIST";

    private static final ListRepository LIST_REPOSITORY = new ListRepository();

    private final ListApi listApi;

    private final MediatorLiveData<ListPayload> list;

    private ListRepository() {
        listApi = RetrofitApiBuilder.getApi(ListApi.class);
        list = new MediatorLiveData<>();
    }

    public static ListRepository getInstance() {
        return LIST_REPOSITORY;
    }

}
