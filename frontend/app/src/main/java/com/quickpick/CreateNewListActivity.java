package com.quickpick;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

import com.facebook.AccessToken;
import com.quickpick.repositories.RunnableUtils;
import com.quickpick.repositories.SessionRepository;

public class CreateNewListActivity extends AppCompatActivity {

    private Button addEntries;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_new_list);

        addEntries = findViewById(R.id.create_list_add_entries_button);

        addEntries.setOnClickListener(view -> addEntriesDialog());
    }

    private void addEntriesDialog() {
        AlertDialog dialog = new AlertDialog.Builder(CreateNewListActivity.this)
                .setTitle(getString(R.string.add_entries_title))
                .setView(R.layout.dialog_add_entries)
                .create();
        dialog.show();

//        EditText sessionCode = dialog.findViewById(R.id.session_code_edit_text);
//        Button cancelButton = dialog.findViewById(R.id.dialog_cancel_button);
//        Button joinButton = dialog.findViewById(R.id.dialog_join_button);
//
//        if (cancelButton != null) {
//            cancelButton.setOnClickListener(button -> dialog.dismiss());
//        }

    }
}