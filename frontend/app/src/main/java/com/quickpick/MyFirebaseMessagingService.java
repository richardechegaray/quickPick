package com.quickpick;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.gson.Gson;
import com.quickpick.payloads.SessionPayload;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String FIREBASE_MESSAGING_SERVICE_DEBUG = "FIREBASE_MESSAGING_SERVICE";

    public static final String SESSION_INTENT = "SESSION_CODE";

    private static final Map<String, Class<? extends Serializable>> TYPE_TO_CLASS_MAP = getTypeToClassMap();

    private static Map<String, Class<? extends Serializable>> getTypeToClassMap() {
        Map<String, Class<? extends Serializable>> map = new HashMap<>();
        map.put("session", SessionPayload.class);
        return map;
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

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        // TODO: handle getting sent a list
        Log.d(FIREBASE_MESSAGING_SERVICE_DEBUG, "Received message from " + remoteMessage.getFrom());
        Intent intent = new Intent(SESSION_INTENT);
        Map<String, String> data = remoteMessage.getData();
        String jsonObjectType = data.get("type");
        Class<? extends Serializable> jsonObjectClass = TYPE_TO_CLASS_MAP.get(jsonObjectType);

        intent = intent.putExtra(SessionPayload.INTENT_KEY, getPayload(data.get(jsonObjectType), jsonObjectClass));
        LocalBroadcastManager.getInstance(getBaseContext()).sendBroadcast(intent);
    }

    private <T> T getPayload(String json, Class<T> targetObjectClass) {
        return new Gson().fromJson(json, targetObjectClass);
    }

}
