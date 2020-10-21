package com.quickpick;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    public static final String SESSION_INTENT = "SESSION_CODE";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Log.d("UNIQUE_TAG", "Received message from " + remoteMessage.getFrom());
        Intent intent = new Intent(SESSION_INTENT);
        intent = intent.putExtra("SessionKey", remoteMessage.getData().get("SessionKey"));
        LocalBroadcastManager.getInstance(getBaseContext()).sendBroadcast(intent);
    }

    @Override
    public void onDeletedMessages() {
        /*
         * TODO: this is called when there are too many outstanding messages
         * or when the app hasn't connected to FCM in too long
         * should do a full sync in this case
         */
    }

    @Override
    public void onNewToken(@NonNull String token) {
        Log.d("UNIQUE_TAG", "Refreshed token: " + token);
        // TODO: Send this token to the server
    }

}
