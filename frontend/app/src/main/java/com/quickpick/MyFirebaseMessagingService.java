package com.quickpick;

import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        Log.d("UNIQUE_TAG", "Received message from " + remoteMessage.getFrom());
    }

    @Override
    public void onDeletedMessages() {
        // TODO: this is called when there are too many outstanding messages
        // or when the app hasn't connected to FCM in too long
        // should do a full sync in this case
    }

    @Override
    public void onNewToken(String token) {
        Log.d("UNIQUE_TAG", "Refreshed token: " + token);
        // TODO: Send this token to the server
    }

}
