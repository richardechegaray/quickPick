package com.quickpick.apis;

import com.quickpick.payloads.LoginPayload;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface LoginAPI {

    @POST("login")
    Call<Boolean> login(@Body LoginPayload loginPayload);
}
