package com.quickpick.apis;

import com.quickpick.payloads.BasicResponse;
import com.quickpick.payloads.CreateSessionRequest;
import com.quickpick.payloads.FacebookTokenRequest;
import com.quickpick.payloads.PostChoicesRequest;
import com.quickpick.payloads.SessionPayload;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface SessionApi {

    @POST("session")
    Call<SessionPayload> createSession(@Body CreateSessionRequest request);

    @GET("session/{sessionId}")
    Call<SessionPayload> getSession(@Path("sessionId") String sessionId, @Body FacebookTokenRequest request);

    @POST("session/{sessionId}")
    Call<SessionPayload> joinSession(@Path("sessionId") String sessionId, @Body FacebookTokenRequest request);

    @POST("session/{sessionId}/run")
    Call<BasicResponse> startSession(@Path("sessionId") String sessionId, @Body FacebookTokenRequest request);

    @POST("session/{sessionId}/choices")
    Call<BasicResponse> postChoices(@Path("sessionId") String sessionId, @Body PostChoicesRequest request);

}
