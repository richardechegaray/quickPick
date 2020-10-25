package com.quickpick.apis;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitApiBuilder {

    private static final String SERVER_URL = "http://52.52.51.125:8081/";

    private static final Retrofit retrofit = new Retrofit.Builder().baseUrl(SERVER_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    public static <T> T getApi(Class<T> apiClass) {
        return retrofit.create(apiClass);
    }
}
