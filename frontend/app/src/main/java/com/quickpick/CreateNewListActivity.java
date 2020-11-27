package com.quickpick;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

public class CreateNewListActivity extends AppCompatActivity {

    // TODO: figure out whether or not these private variables will be used in multiple methods
    private Button addEntries;

    private Button createList;

    private EditText editName;

    private EditText editDescription;

    private MyRecyclerViewAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_new_list);

        editName = (EditText) findViewById(R.id.create_list_name_edit_text);

        editDescription = (EditText) findViewById(R.id.create_list_description_edit_text);

        addEntries = findViewById(R.id.create_list_add_entries_button);

        addEntries.setOnClickListener(view -> adapter.addNewListEntry());

        createList = findViewById(R.id.create_list_create_list_button);

        createList.setOnClickListener(view -> {

        });

        // set up the RecyclerView
        RecyclerView recyclerView = findViewById(R.id.rv_entries);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.addItemDecoration(new DividerItemDecoration(recyclerView.getContext(),
                layoutManager.getOrientation()));
        adapter = new MyRecyclerViewAdapter(this, new ArrayList<>());
        recyclerView.setAdapter(adapter);
    }

}