package com.quickpick.apis;

import com.quickpick.payloads.BasicResponse;
import com.quickpick.payloads.LoginRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface LoginApi {

    @POST("login")
    Call<BasicResponse> login(@Header("facebooktoken") String facebookToken, @Body LoginRequest loginRequest);
}
