package com.quickpick;

import android.content.IntentFilter;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.quickpick.receivers.SessionReceiver;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.SessionViewModel;

public class SessionActivity extends AppCompatActivity {

    private SessionReceiver receiver;

    private TextView sessionKeyView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        sessionKeyView = findViewById(R.id.session_key_text_view);
        receiver = new SessionReceiver();
        SessionRepository.getInstance().setSessionInfo(receiver.getData());
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT));
        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);
        model.getSessionInfo().observe(this, new Observer<String>() {
            @Override
            public void onChanged(String s) {
                sessionKeyView.setText(s);
            }
        });
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(receiver);
    }
}