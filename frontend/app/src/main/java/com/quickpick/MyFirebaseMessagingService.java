package com.quickpick;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.gson.Gson;
import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.SessionPayload;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String FIREBASE_MESSAGING_SERVICE_DEBUG = "FIREBASE_MESSAGING_SERVICE";

    public static final String SESSION_INTENT_ACTION = "SESSION_INTENT";

    public static final String LIST_INTENT_ACTION = "LIST_INTENT";

    private static final Map<String, Class<? extends Serializable>> TYPE_TO_CLASS_MAP = getTypeToClassMap();

    private static Map<String, Class<? extends Serializable>> getTypeToClassMap() {
        Map<String, Class<? extends Serializable>> map = new HashMap<>();
        map.put("session", SessionPayload.class);
        map.put("list", ListPayload.class);
        return map;
    }

    private static Map<String, String> getTypeToIntentActionMap() {
        Map<String, String> map = new HashMap<>();
        map.put("session", SESSION_INTENT_ACTION);
        map.put("list", LIST_INTENT_ACTION);
        return map;
    }

    private static Map<String, String> getTypeToIntentKeyMap() {
        Map<String, String> map = new HashMap<>();
        map.put("session", SessionPayload.INTENT_KEY);
        map.put("list", ListPayload.INTENT_KEY);
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
        Log.d(FIREBASE_MESSAGING_SERVICE_DEBUG, "Received message from " + remoteMessage.getFrom());
        Map<String, String> data = remoteMessage.getData();
        Map<String, String> typeToIntentActionMap = getTypeToIntentActionMap();
        for (String key : getTypeToClassMap().keySet()) {
            if (data.containsKey(key)) {
                Intent intent = new Intent(typeToIntentActionMap.get(key));
                Class<? extends Serializable> jsonObjectClass = TYPE_TO_CLASS_MAP.get(key);
                intent = intent.putExtra(getTypeToIntentKeyMap().get(key), getPayload(data.get(key), jsonObjectClass));
                LocalBroadcastManager.getInstance(getBaseContext()).sendBroadcast(intent);
            }
        }
    }

    private <T> T getPayload(String json, Class<T> targetObjectClass) {
        return new Gson().fromJson(json, targetObjectClass);
    }

}
