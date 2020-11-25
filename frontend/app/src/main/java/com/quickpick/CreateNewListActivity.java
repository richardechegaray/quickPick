package com.quickpick;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.quickpick.payloads.IdeaPayload;

import java.util.ArrayList;
import java.util.List;

public class CreateNewListActivity extends AppCompatActivity implements MyRecyclerViewAdapter.ItemClickListener {

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

        editName = (EditText) findViewById(R.id.create_list_name_exit_text);

        editDescription = (EditText) findViewById(R.id.create_list_description_edit_text);

        addEntries = findViewById(R.id.create_list_add_entries_button);

        addEntries.setOnClickListener(view -> addEntriesDialog());


        // TODO: do we need this or not?
        List<IdeaPayload> example = new ArrayList<>();
        IdeaPayload ex = new IdeaPayload();
        ex.setDescription("test");
        ex.setName("name");
        example.add(ex);

        // set up the RecyclerView
        RecyclerView recyclerView = findViewById(R.id.rv_entries);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MyRecyclerViewAdapter(this, new ArrayList<>()); // need to pass in editview data here ?
        adapter.setClickListener(this);
        recyclerView.setAdapter(adapter);
    }

    @Override
    public void onItemClick(View view, int position) {
        Toast.makeText(this, "You clicked " + adapter.getItem(position) + " on row number " + position, Toast.LENGTH_SHORT).show();
    }

    private void addEntriesDialog() {
        AlertDialog dialog = new AlertDialog.Builder(CreateNewListActivity.this)
                .setTitle(getString(R.string.add_entries_title))
                .setView(R.layout.dialog_add_entries)
                .create();
        dialog.show();
    }

}