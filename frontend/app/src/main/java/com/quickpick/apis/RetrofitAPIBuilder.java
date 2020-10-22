package com.quickpick.apis;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitAPIBuilder {

    private static final String SERVER_URL = "http://ec2-13-52-219-93.us-west-1.compute.amazonaws.com";

    private static final Retrofit retrofit = new Retrofit.Builder().baseUrl(SERVER_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    public static <T> T getApi(Class<T> apiClass) {
        return retrofit.create(apiClass);
    }
}
