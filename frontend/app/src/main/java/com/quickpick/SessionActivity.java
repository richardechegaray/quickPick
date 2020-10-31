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

    private UserAdapter adapter;

    private SessionReceiver receiver;

    private AccessToken accessToken;

    private Button startSwipingButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
            finish();
            return;
        }
        TextView sessionKeyView = findViewById(R.id.session_key_text);
        startSwipingButton = findViewById(R.id.start_swiping_button);

        receiver = new SessionReceiver();
        SessionViewModel model = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory())
                .get(SessionViewModel.class);
        setOnClickListeners();
        setUpRecyclerView();

        model.getSession().observe(this, newSession ->
        {
            if ("running".equals(newSession.getStatus())) {
                startActivity(new Intent(getApplicationContext(), SwipeActivity.class).addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY));
                return;
            }
            sessionKeyView.setText(String.format(getString(R.string.session_code_string_format), newSession.getPin()));
            startSwipingButton.setEnabled(newSession.getCreator().equals(accessToken.getUserId()));
            adapter.updateUsers(newSession.getParticipants());
            adapter.notifyDataSetChanged();
        });

    }

    private void setUpRecyclerView() {
        RecyclerView recyclerView = findViewById(R.id.user_recycler_view);
        recyclerView.setHasFixedSize(true);
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        adapter = new UserAdapter(new ArrayList<>());
        recyclerView.setAdapter(adapter);
    }

    private void setOnClickListeners() {
        startSwipingButton.setOnClickListener(view ->
                SessionRepository.getInstance().startSession(
                        () -> {
                        }, accessToken.getToken()));
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