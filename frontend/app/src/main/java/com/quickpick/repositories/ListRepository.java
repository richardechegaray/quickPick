package com.quickpick.repositories;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MediatorLiveData;
import androidx.lifecycle.MutableLiveData;

import com.quickpick.apis.ListApi;
import com.quickpick.apis.RetrofitUtils;
import com.quickpick.payloads.CreateListRequest;
import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ListsPayload;

import retrofit2.Call;

public class ListRepository {

    private static final String LIST_DEBUG = "LIST";

    private static final ListRepository LIST_REPOSITORY = new ListRepository();

    private final ListApi listApi;

    private final MediatorLiveData<ListPayload> list;

    private final MutableLiveData<ListsPayload> lists;

    private ListRepository() {
        listApi = RetrofitUtils.getApi(ListApi.class);
        list = new MediatorLiveData<>();
        lists = new MutableLiveData<>();
    }

    public static ListRepository getInstance() {
        return LIST_REPOSITORY;
    }

    public LiveData<ListsPayload> getLists() {
        return lists;
    }

    public LiveData<ListPayload> getList() {
        return list;
    }

    public void callGetLists(Runnable successCallback, Runnable failureCallback, String facebookToken) {
        Call<ListsPayload> getListsCall = listApi.getLists(facebookToken);
        getListsCall.enqueue(new RepositoryCallback<>(listsPayload -> {
            lists.setValue(listsPayload);
            successCallback.run();
        }, failureCallback, LIST_DEBUG));
    }

    public void callGetList(Runnable successCallback, Runnable failureCallback, String facebookToken, String listId) {
        Call<ListPayload> getListCall = listApi.getList(facebookToken, listId);
        getListCall.enqueue(new RepositoryCallback<>(listPayload -> {
            list.setValue(listPayload);
            successCallback.run();
        }, failureCallback, LIST_DEBUG));
    }

    public void callCreateList(Runnable successCallback, Runnable failureCallback, String facebookToken, CreateListRequest listRequest) {
        Call<ListPayload> createListCall = listApi.createList(facebookToken, listRequest);
        createListCall.enqueue(new RepositoryCallback<>(listPayload -> {
            list.setValue(listRequest.getList());
            successCallback.run();
        }, failureCallback, LIST_DEBUG));
    }

}
