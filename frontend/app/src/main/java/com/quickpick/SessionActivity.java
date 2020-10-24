package com.quickpick;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.facebook.AccessToken;
import com.quickpick.payloads.ParticipantPayload;
import com.quickpick.receivers.SessionReceiver;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.SessionViewModel;

import java.util.ArrayList;
import java.util.List;

public class SessionActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private UserAdapter adapter;
    private RecyclerView.LayoutManager layoutManager;

    private Button startSwipingButton;

    private TextView sessionKeyView;

    private SessionReceiver receiver;

    private String facebookAccessToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
            finish();
            return;
        }
        facebookAccessToken = accessToken.getToken();

        receiver = new SessionReceiver();
        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);
        registerViews();
        setOnClickListeners();

        recyclerView = findViewById(R.id.user_recycler_view);
        recyclerView.setHasFixedSize(true);
        layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        adapter = new UserAdapter(new ArrayList<>());
        recyclerView.setAdapter(adapter);

        model.getSession().observe(this, newSession ->
        {
            sessionKeyView.setText(String.format(getString(R.string.session_code_string_format), newSession.getPin()));
            adapter.updateUsers(newSession.getParticipants());
            adapter.notifyDataSetChanged();
        });

    }

    private void registerViews() {
        startSwipingButton = findViewById(R.id.start_swiping_button);
        sessionKeyView = findViewById(R.id.session_key_text);
    }

    private void setOnClickListeners() {
        startSwipingButton.setOnClickListener(view ->
                SessionRepository.getInstance().startSession(
                        basicResponse -> startActivity(new Intent(getApplicationContext(), SwipeActivity.class)), facebookAccessToken));
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT));
        SessionRepository.getInstance().addSessionSource(receiver.getSession());
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(receiver);
        SessionRepository.getInstance().removeSessionSource(receiver.getSession());
    }

    private static class UserAdapter extends RecyclerView.Adapter<UserAdapter.UserViewHolder> {
        private List<ParticipantPayload> users;

        private UserAdapter(List<ParticipantPayload> users) {
            this.users = users;
        }

        public void updateUsers(List<ParticipantPayload> newUsers) {
            users = newUsers;
        }

        @NonNull
        @Override
        public UserViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.recycler_view_user, parent, false);
            return new UserViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull UserViewHolder holder, int position) {
            String userName = users.get(position).getName();
            holder.textView.setText(userName);
        }

        @Override
        public int getItemCount() {
            return users.size();
        }

        private static class UserViewHolder extends RecyclerView.ViewHolder {
            public TextView textView;

            public UserViewHolder(@NonNull View view) {
                super(view);
                this.textView = view.findViewById(R.id.user_name_text_view);
            }
        }

    }
}