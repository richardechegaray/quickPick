package com.quickpick.repositories;

import android.util.Log;

import java.util.function.Consumer;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.internal.EverythingIsNonNull;

public class RepositoryCallback<T> implements Callback<T> {
    private final Consumer<T> onSuccessCallback;
    private final Runnable onFailureCallback;
    private final String debugTag;

    RepositoryCallback(Consumer<T> onSuccessCallback, String debugTag) {
        this(onSuccessCallback, () -> {}, debugTag);
    }

    RepositoryCallback(Consumer<T> onSuccessCallback, Runnable onFailureCallback, String debugTag) {
        this.onSuccessCallback = onSuccessCallback;
        this.onFailureCallback = onFailureCallback;
        this.debugTag = debugTag;
    }

    @Override
    @EverythingIsNonNull
    public void onResponse(Call<T> call, Response<T> response) {
        Log.d(debugTag, response.toString());
        if (response.isSuccessful()) {
            onSuccessCallback.accept(response.body());
        } else {
            onFailureCallback.run();
        }
    }

    @Override
    @EverythingIsNonNull
    public void onFailure(Call<T> call, Throwable t) {
        Log.d(debugTag, call.request().toString(), t);
        onFailureCallback.run();
    }
}
