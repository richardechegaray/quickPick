package com.quickpick;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.facebook.AccessToken;
import com.quickpick.payloads.CreateListRequest;
import com.quickpick.payloads.ListPayload;
import com.quickpick.repositories.ListRepository;
import com.quickpick.repositories.RunnableUtils;

import java.util.ArrayList;

public class CreateNewListActivity extends AppCompatActivity {

    // TODO: figure out whether or not these private variables will be used in multiple methods
    private Button addEntries;

    private Button createList;

    private EditText editName;

    private EditText editDescription;

    private AccessToken accessToken;

    private MyRecyclerViewAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_new_list);
        accessToken = AccessToken.getCurrentAccessToken();
        if (accessToken == null || accessToken.isExpired()) {
            startActivity(new Intent(getBaseContext(), LoginActivity.class));
            finish();
            return;
        }

        editName = (EditText) findViewById(R.id.create_list_name_edit_text);

        editDescription = (EditText) findViewById(R.id.create_list_description_edit_text);

        addEntries = findViewById(R.id.create_list_add_entries_button);

        addEntries.setOnClickListener(view -> adapter.addNewListEntry());

        createList = findViewById(R.id.create_list_create_list_button);

        createList.setOnClickListener(view -> {
            ListPayload lp = new ListPayload(editName.toString(), editDescription.toString(), adapter.getmData());

            ListRepository.getInstance().callCreateList(() -> finish(),
                    RunnableUtils.showToast(this, "failing"),
                    accessToken.getToken(),
                    new CreateListRequest(lp));
        });

        // set up the RecyclerView
        RecyclerView recyclerView = findViewById(R.id.rv_entries);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MyRecyclerViewAdapter(this, new ArrayList<>());
        recyclerView.setAdapter(adapter);
    }

}