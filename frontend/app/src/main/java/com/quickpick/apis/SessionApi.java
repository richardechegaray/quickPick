package com.quickpick.apis;

import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.PostChoicesRequest;
import com.quickpick.payloads.SessionPayload;
import com.quickpick.payloads.UpdateListRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface SessionApi {

    @POST("session")
    Call<SessionPayload> createSession(@Header("facebooktoken") String facebookToken);

    @GET("session/{sessionId}")
    Call<SessionPayload> getSession(@Header("facebooktoken") String facebookToken, @Path("sessionId") String sessionId);

    @POST("session/{sessionId}")
    Call<SessionPayload> joinSession(@Header("facebooktoken") String facebookToken, @Path("sessionId") String sessionId);

    @POST("session/{sessionId}/run")
    Call<Void> startSession(@Header("facebooktoken") String facebookToken, @Path("sessionId") String sessionId);

    @POST("session/{sessionId}/choices")
    Call<Void> postChoices(@Header("facebooktoken") String facebookToken, @Path("sessionId") String sessionId,
                           @Body PostChoicesRequest request);

    @PUT("session/{sessionId}")
    Call<SessionPayload> updateList(@Header("facebooktoken") String facebookToken, @Path("sessionId") String sessionId,
                                    @Body UpdateListRequest request);

    @GET("session/{sessionId}/list")
    Call<ListPayload> getSessionList(@Header("facebooktoken") String facebookToken, @Path("sessionId") String sessionId);

}
