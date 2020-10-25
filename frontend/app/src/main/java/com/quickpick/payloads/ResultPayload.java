package com.quickpick.payloads;

import androidx.annotation.Nullable;

import java.util.Optional;

public class ResultPayload {

    @Nullable
    private IdeaPayload idea;

    private int score;

    public IdeaPayload getIdea() {
        return Optional.ofNullable(idea).orElse(new IdeaPayload());
    }

    public int getScore() {
        return score;
    }
}
