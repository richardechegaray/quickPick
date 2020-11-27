package com.quickpick.apis;

import com.quickpick.payloads.CreateListRequest;
import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ListsPayload;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ListApi {

    @GET("list/{listId}")
    Call<ListPayload> getList(@Header("facebooktoken") String facebookToken, @Path("listId") String listId);

    @POST("list")
    Call<ListPayload> createList(@Header("facebooktoken") String facebookToken, @Body CreateListRequest request);

    @DELETE("list/{listId}")
    Call<Void> deleteList(@Header("facebooktoken") String facebookToken, @Path("listId") String listId);

    @GET("list")
    Call<ListsPayload> getLists(@Header("facebooktoken") String facebookToken);
}
