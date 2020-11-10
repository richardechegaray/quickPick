package com.quickpick.repositories;

import android.content.Context;
import android.widget.Toast;

public class CommonRunnables {
    public static final Runnable DO_NOTHING = () -> {};

    public static Runnable showToast(Context context, String text) {
        return () -> Toast.makeText(context, text, Toast.LENGTH_SHORT).show();
    }
}
