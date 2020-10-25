package com.quickpick.payloads;

import androidx.annotation.Nullable;

public class ChoicePayload {

    private IdeaPayload idea;

    private boolean choice;

    public ChoicePayload(IdeaPayload idea, boolean choice) {
        this.idea = idea;
        this.choice = choice;
    }
}
