package com.quickpick;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.quickpick.receivers.SessionReceiver;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.SessionViewModel;

public class SessionActivity extends AppCompatActivity {

    private Button startSwipingButton;

    private TextView sessionKeyView;

    private SessionReceiver receiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        receiver = new SessionReceiver();
        SessionRepository.getInstance().setSessionInfo(receiver.getData());
        registerViews();
        setOnClickListeners();
    }

    private void registerViews() {
        startSwipingButton = findViewById(R.id.start_swiping_button);
        sessionKeyView = findViewById(R.id.session_key_text_view);
    }

    private void setOnClickListeners() {
        startSwipingButton.setOnClickListener(view ->
                startActivity(new Intent(getApplicationContext(), SwipeActivity.class)));
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT));
        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);
        model.getSessionInfo().observe(this, newText ->
                sessionKeyView.setText(newText));
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(receiver);
    }
}