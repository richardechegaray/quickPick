package com.quickpick.activities;

import android.text.Editable;
import android.text.TextWatcher;

import com.google.android.material.textfield.TextInputLayout;

public class NameEditTextWatcher implements TextWatcher {
    private final TextInputLayout view;

    public NameEditTextWatcher(TextInputLayout view) {
        this.view = view;
    }

    @Override
    public void onTextChanged(CharSequence cs, int arg1, int arg2, int arg3) {
        // intentionally empty
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
        // intentionally empty
    }
}

