package com.quickpick.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.facebook.AccessToken;
import com.quickpick.R;
import com.quickpick.payloads.CreateOrUpdateListRequest;
import com.quickpick.payloads.IdeaPayload;
import com.quickpick.payloads.ListPayload;
import com.quickpick.repositories.ListRepository;
import com.quickpick.repositories.RunnableUtils;
import com.quickpick.viewmodels.ListViewModel;

import java.util.List;
import java.util.Optional;

import static com.quickpick.activities.ViewOrUpdateListsActivity.IS_UPDATE_LIST;

public class CreateOrUpdateListActivity extends AppCompatActivity {

    private AccessToken accessToken;

    private ListEntriesRecyclerViewAdapter adapter;

    private EditText listName;
    private EditText listDescription;

    private Button addEntriesButton;
    private Button submitListButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_or_update_list);
        accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
            finish();
            return;
        }
        ListPayload currentListToDisplay;
        boolean isUpdateList = getIntent().getBooleanExtra(IS_UPDATE_LIST, false);
        Optional<ActionBar> actionBar = Optional.ofNullable(getSupportActionBar());

        findViews();

        if (isUpdateList) {
            actionBar.ifPresent(bar -> bar.setTitle("Update List"));
            currentListToDisplay = new ViewModelProvider.NewInstanceFactory()
                    .create(ListViewModel.class).getList().getValue();
            submitListButton.setText(R.string.create_or_update_list_update_button_text);
        } else {
            actionBar.ifPresent(bar -> bar.setTitle("Create List"));
            currentListToDisplay = new ListPayload();
            submitListButton.setText(R.string.create_or_update_list_create_button_text);
        }
        listName.setText(currentListToDisplay.getName());
        listDescription.setText(currentListToDisplay.getDescription());

        setUpOnClickListeners(isUpdateList, currentListToDisplay.getId());

        setUpRecyclerView(currentListToDisplay.getIdeas());
    }

    private void findViews() {
        listName = findViewById(R.id.create_or_update_list_name_edit_text);
        listName.addTextChangedListener(new NameEditTextWatcher(findViewById(R.id.create_or_update_list_name_edit_text_layout)));
        listDescription = findViewById(R.id.create_or_update_list_description_edit_text);
        addEntriesButton = findViewById(R.id.create_or_update_list_add_entries_button);
        submitListButton = findViewById(R.id.create_or_update_list_submit_list_button);
    }

    private void setUpOnClickListeners(boolean isUpdateList, String listId) {
        addEntriesButton.setOnClickListener(view -> adapter.addNewListEntry());
        submitListButton.setOnClickListener(view -> {
            ListPayload newListPayload = new ListPayload(listName.getText().toString(),
                    listDescription.getText().toString(), adapter.getListEntries());

            if (isUpdateList) {
                ListRepository.getInstance().callUpdateList(this::finish,
                        RunnableUtils.showToast(this, "Failed to update list"),
                        accessToken.getToken(),
                        listId,
                        new CreateOrUpdateListRequest(newListPayload));
            } else {
                ListRepository.getInstance().callCreateList(this::finish,
                        RunnableUtils.showToast(this, "Failed to create list"),
                        accessToken.getToken(),
                        new CreateOrUpdateListRequest(newListPayload));
            }
        });
    }

    private void setUpRecyclerView(List<IdeaPayload> ideasToDisplay) {
        RecyclerView recyclerView = findViewById(R.id.rv_entries);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.addItemDecoration(new DividerItemDecoration(recyclerView.getContext(),
                layoutManager.getOrientation()));
        adapter = new ListEntriesRecyclerViewAdapter(this, ideasToDisplay);
        recyclerView.setAdapter(adapter);
    }
}