package com.quickpick;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.quickpick.payloads.SessionPayload;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String FIREBASE_MESSAGING_SERVICE_DEBUG = "FIREBASE_MESSAGING_SERVICE";

    public static final String SESSION_INTENT = "SESSION_CODE";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Log.d(FIREBASE_MESSAGING_SERVICE_DEBUG, "Received message from " + remoteMessage.getFrom());
        Intent intent = new Intent(SESSION_INTENT);
        // TODO: Use GSON to parse the remote data
        intent = intent.putExtra(SessionPayload.INTENT_KEY, remoteMessage.getData().get("SessionKey"));
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
        Log.d(FIREBASE_MESSAGING_SERVICE_DEBUG, "Refreshed token: " + token);
        // TODO: Send this token to the server
    }

}
