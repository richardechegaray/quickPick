package com.quickpick.apis;

import com.quickpick.payloads.CreateListRequest;
import com.quickpick.payloads.FacebookTokenRequest;
import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ListsPayload;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ListApi {

    @GET("list/{listId}")
    Call<ListPayload> getList(@Path("listId") String listId, @Body FacebookTokenRequest request);

    @POST("list")
    Call<ListPayload> createList(@Body CreateListRequest request);

    @GET("list")
    Call<ListsPayload> getLists(@Body FacebookTokenRequest request);
}
