package com.quickpick.activities;

import android.text.Editable;
import android.text.TextWatcher;
import android.widget.TextView;

public class NameEditTextWatcher implements TextWatcher {
    private TextView view;

    public NameEditTextWatcher(TextView view) {
        this.view = view;
    }

    @Override
    public void onTextChanged(CharSequence cs, int arg1, int arg2, int arg3) {

    }

    @Override
    public void afterTextChanged(Editable editable) {
        if (editable.toString().isEmpty()) {
            view.setError("Name is required");
        } else {
            view.setError(null);
        }
    }

    @Override
    public void beforeTextChanged(CharSequence arg0, int arg1, int arg2, int arg3) {
    }
}

