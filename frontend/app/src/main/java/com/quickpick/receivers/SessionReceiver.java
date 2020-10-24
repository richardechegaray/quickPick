package com.quickpick.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.quickpick.payloads.SessionPayload;

public class SessionReceiver extends BroadcastReceiver {

    private static final String SESSION_RECEIVER_DEBUG = "SESSION_RECEIVER";

    private final MutableLiveData<SessionPayload> session = new MutableLiveData<>();

    public LiveData<SessionPayload> getSession() {
        return session;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(SESSION_RECEIVER_DEBUG, "Received");
        session.setValue((SessionPayload) intent.getSerializableExtra(SessionPayload.INTENT_KEY));
    }
}
