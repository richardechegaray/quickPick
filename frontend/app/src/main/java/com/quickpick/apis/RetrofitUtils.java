package com.quickpick.apis;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitUtils {

    private static final String SERVER_URL = "http://52.52.51.125:8081/";

    private static Retrofit retrofit;

    public static <T> T getApi(Class<T> apiClass) {
        if (retrofit == null) {
            HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
            interceptor.level(HttpLoggingInterceptor.Level.BODY);
            retrofit = new Retrofit.Builder().baseUrl(SERVER_URL)
                    .client(new OkHttpClient.Builder().addInterceptor(interceptor).build())
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit.create(apiClass);
    }
}
