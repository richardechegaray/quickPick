package com.quickpick.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import java.io.Serializable;

public class FirebaseIntentReceiver<T extends Serializable> extends BroadcastReceiver {

    public static final String SESSION_RECEIVER_TAG = "SESSION_RECEIVER";

    private final String debugTag;
    private final String intentKey;
    private final MutableLiveData<T> data = new MutableLiveData<>();

    public FirebaseIntentReceiver(String debugTag, String intentKey) {
        this.debugTag = debugTag;
        this.intentKey = intentKey;
    }

    public LiveData<T> getData() {
        return data;
    }

    @SuppressWarnings("unchecked")
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(debugTag, "Received");
        try {
            data.setValue((T) intent.getSerializableExtra(intentKey));
        } catch (ClassCastException e) {
            Log.d(debugTag, e.toString());
        }
    }
}
