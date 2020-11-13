package com.quickpick;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.facebook.AccessToken;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textfield.TextInputEditText;
import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ParticipantPayload;
import com.quickpick.payloads.SessionPayload;
import com.quickpick.receivers.FirebaseIntentReceiver;
import com.quickpick.repositories.ListRepository;
import com.quickpick.repositories.RunnableUtils;
import com.quickpick.repositories.SessionRepository;
import com.quickpick.viewmodels.ListViewModel;
import com.quickpick.viewmodels.SessionViewModel;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class SessionActivity extends AppCompatActivity {

    private UserAdapter adapter;

    private FirebaseIntentReceiver<SessionPayload> sessionReceiver;

    private FirebaseIntentReceiver<ListPayload> listReceiver;

    private AccessToken accessToken;

    private Button startSwipingButton;

    private TextInputEditText listEditText;

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
        startSwipingButton = findViewById(R.id.start_swiping_button);
        listEditText = findViewById(R.id.session_list_edit_text);

        sessionReceiver = new FirebaseIntentReceiver<>(FirebaseIntentReceiver.SESSION_RECEIVER_TAG, SessionPayload.INTENT_KEY);
        listReceiver = new FirebaseIntentReceiver<>(FirebaseIntentReceiver.LIST_RECEIVER_TAG, ListPayload.INTENT_KEY);

        ViewModelProvider provider = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory());
        observeSession(provider.get(SessionViewModel.class));
        setUpListEditText(provider.get(ListViewModel.class));
        setOnClickListeners();
        setUpRecyclerView();
    }

    private void observeSession(SessionViewModel sessionViewModel) {
        TextView sessionKeyView = findViewById(R.id.session_key_text);
        sessionViewModel.getSession().observe(this, newSession ->
        {
            boolean isOwner = newSession.getCreator().equals(accessToken.getUserId());
            if ("running".equals(newSession.getStatus())) {
                startActivity(new Intent(getApplicationContext(), SwipeActivity.class).addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY));
                return;
            }
            if (isOwner) {
                ListRepository.getInstance().callGetLists(() -> {},
                        () -> Toast.makeText(this, "Failed to get lists", Toast.LENGTH_SHORT).show(),
                        accessToken.getToken());
            }
            listEditText.setText(newSession.getListName());
            listEditText.setEnabled(isOwner);
            startSwipingButton.setEnabled(isOwner);
            sessionKeyView.setText(String.format(getString(R.string.session_code_string_format), newSession.getPin()));
            adapter.updateUsers(newSession.getParticipants());
            adapter.notifyDataSetChanged();
        });
    }

    private void setUpListEditText(ListViewModel listViewModel) {
        listEditText.setFocusable(false);
        listEditText.setOnClickListener(view ->
                {
                    List<ListPayload> lists = listViewModel.getLists().getValue().getLists();
                    String[] listNames = lists.stream().map(ListPayload::getName).toArray(String[]::new);
                    List<String> listIds = lists.stream().map(ListPayload::getId).collect(Collectors.toList());
                    final int[] selectedItem = new int[1];
                    new MaterialAlertDialogBuilder(this)
                            .setTitle(getString(R.string.session_list_text))
                            .setNeutralButton(getString(R.string.dialog_cancel_button_text),
                                    (dialog, which) -> RunnableUtils.showToast(this, getString(R.string.select_list_cancelled)).run())
                            .setPositiveButton(getString(R.string.dialog_select_button_text),
                                    (dialog, which) -> SessionRepository.getInstance().updateList(RunnableUtils.DO_NOTHING,
                                            RunnableUtils.showToast(this, getString(R.string.select_list_failed)),
                                            accessToken.getToken(),
                                            listIds.get(selectedItem[0])))
                            .setSingleChoiceItems(listNames,
                                    0,
                                    (dialog, which) -> selectedItem[0] = which)
                            .show();
                }
        );
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
        startSwipingButton.setOnClickListener(view -> SessionRepository.getInstance().startSession(
                RunnableUtils.DO_NOTHING, accessToken.getToken()));
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(sessionReceiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT_ACTION));
        LocalBroadcastManager.getInstance(this).registerReceiver(listReceiver, new IntentFilter(MyFirebaseMessagingService.LIST_INTENT_ACTION));
        SessionRepository.getInstance().addSessionSource(sessionReceiver.getData());
        ListRepository.getInstance().addListSource(listReceiver.getData());
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(sessionReceiver);
        LocalBroadcastManager.getInstance(this).unregisterReceiver(listReceiver);
        SessionRepository.getInstance().removeSessionSource(sessionReceiver.getData());
        ListRepository.getInstance().removeListSource(listReceiver.getData());
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