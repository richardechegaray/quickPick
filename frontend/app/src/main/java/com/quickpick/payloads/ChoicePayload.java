package com.quickpick.payloads;

public class ChoicePayload {

    private final IdeaPayload idea;

    private final boolean choice;

    public ChoicePayload(IdeaPayload idea, boolean choice) {
        this.idea = idea;
        this.choice = choice;
    }
}
