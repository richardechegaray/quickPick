package com.quickpick.activities;

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
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.facebook.AccessToken;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.quickpick.MyFirebaseMessagingService;
import com.quickpick.R;
import com.quickpick.payloads.ListPayload;
import com.quickpick.payloads.ListsPayload;
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
import java.util.Optional;
import java.util.stream.Collectors;

public class SessionActivity extends AppCompatActivity {

    private UserAdapter adapter;

    private FirebaseIntentReceiver<SessionPayload> sessionReceiver;

    private AccessToken accessToken;

    private Button startSwipingButton;

    private TextInputEditText listEditText;
    private TextInputLayout listEditTextLayout;

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
        listEditTextLayout = findViewById(R.id.session_list_text_field);

        sessionReceiver = new FirebaseIntentReceiver<>(FirebaseIntentReceiver.SESSION_RECEIVER_TAG, SessionPayload.INTENT_KEY);

        ViewModelProvider provider = new ViewModelProvider(this, new ViewModelProvider.NewInstanceFactory());
        SessionViewModel sessionViewModel = provider.get(SessionViewModel.class);
        observeSession(sessionViewModel);
        setUpListEditText(provider.get(ListViewModel.class));
        setUpStartSwipingButton(sessionViewModel);
        setUpRecyclerView();
    }

    private void observeSession(SessionViewModel sessionViewModel) {
        TextView sessionKeyView = findViewById(R.id.session_key_text);
        TextView sessionUserCount = findViewById(R.id.session_user_count);
        sessionViewModel.getSession().observe(this, newSession ->
        {
            boolean isOwner = newSession.getCreator().equals(accessToken.getUserId());
            if ("running".equals(newSession.getStatus())) {
                SessionRepository.getInstance().callGetSessionList(
                        () -> startActivity(new Intent(getApplicationContext(), SwipeActivity.class).addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY)),
                        RunnableUtils.showToast(this, getString(R.string.get_list_failed)),
                        accessToken.getToken());
            }
            if (isOwner) {
                ListRepository.getInstance().callGetLists(RunnableUtils.DO_NOTHING,
                        RunnableUtils.showToast(this, getString(R.string.get_lists_failed)),
                        accessToken.getToken());
            }
            sessionUserCount.setText(String.format(getString(R.string.session_user_count_format), newSession.getParticipants().size()));
            listEditText.setText(newSession.getListName());
            listEditText.setEnabled(isOwner);
            if (newSession.getListName().isEmpty() && isOwner) {
                listEditTextLayout.setError("Select a list");
                startSwipingButton.setEnabled(false);
            } else {
                listEditTextLayout.setError(null);
                startSwipingButton.setEnabled(isOwner);
            }
            sessionKeyView.setText(String.format(getString(R.string.session_code_string_format), newSession.getPin()));
            adapter.updateUsers(newSession.getParticipants());
            adapter.notifyDataSetChanged();
        });
    }

    private void setUpListEditText(ListViewModel listViewModel) {
        listEditText.setFocusable(false);
        listEditText.setOnClickListener(view ->
                {
                    List<ListPayload> lists = Optional.ofNullable(listViewModel.getLists().getValue()).orElse(new ListsPayload()).getLists();
                    String[] listNames = lists.stream().map(ListPayload::getName).toArray(String[]::new);
                    List<String> listIds = lists.stream().map(ListPayload::getId).collect(Collectors.toList());
                    final int[] selectedItem = new int[1];
                    new MaterialAlertDialogBuilder(this)
                            .setTitle(getString(R.string.session_list_text))
                            .setNeutralButton(getString(R.string.dialog_cancel_button_text),
                                    (dialog, which) -> {})
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
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.addItemDecoration(new DividerItemDecoration(recyclerView.getContext(),
                layoutManager.getOrientation()));
        adapter = new UserAdapter(new ArrayList<>());
        recyclerView.setAdapter(adapter);
    }

    private void setUpStartSwipingButton(SessionViewModel sessionViewModel) {
        startSwipingButton.setOnClickListener(view -> {
            SessionPayload payload = sessionViewModel.getSession().getValue();
            if (payload == null || payload.getListId() == null || payload.getListId().isEmpty()) {
                RunnableUtils.showToast(this, getString(R.string.missing_list)).run();
            } else {
                SessionRepository.getInstance().startSession(
                        RunnableUtils.DO_NOTHING, accessToken.getToken());
            }
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        LocalBroadcastManager.getInstance(this).registerReceiver(sessionReceiver, new IntentFilter(MyFirebaseMessagingService.SESSION_INTENT_ACTION));
        SessionRepository.getInstance().addSessionSource(sessionReceiver.getData());
    }

    @Override
    protected void onStop() {
        super.onStop();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(sessionReceiver);
        SessionRepository.getInstance().removeSessionSource(sessionReceiver.getData());
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