package com.quickpick.apis;

import com.quickpick.payloads.BasicResponsePayload;
import com.quickpick.payloads.LoginPayload;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface LoginApi {

    @POST("login")
    Call<BasicResponsePayload> login(@Body LoginPayload loginPayload);
}
