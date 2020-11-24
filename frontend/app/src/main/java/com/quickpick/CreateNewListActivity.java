package com.quickpick;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

public class CreateNewListActivity extends AppCompatActivity {

    // TODO: figure out whether or not these private variables will be used in multiple methods
    private Button addEntries;

    private Button createList;

    private EditText editName;

    private EditText editDescription;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_new_list);

        editName = (EditText) findViewById(R.id.create_list_name_exit_text);

        editDescription = (EditText) findViewById(R.id.create_list_description_edit_text);

        addEntries = findViewById(R.id.create_list_add_entries_button);

        addEntries.setOnClickListener(view -> addEntriesDialog());
    }

    private void addEntriesDialog() {
        AlertDialog dialog = new AlertDialog.Builder(CreateNewListActivity.this)
                .setTitle(getString(R.string.add_entries_title))
                .setView(R.layout.dialog_add_entries)
                .create();
        dialog.show();
    }
}