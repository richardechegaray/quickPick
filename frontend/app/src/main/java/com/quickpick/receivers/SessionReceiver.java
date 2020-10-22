package com.quickpick.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

public class SessionReceiver extends BroadcastReceiver {

    private final MutableLiveData<String> data = new MutableLiveData<>();

    public LiveData<String> getData() {
        return data;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("UNIQUE_TAG", "Received");
        data.setValue(intent.getStringExtra("SessionKey"));
    }
}
