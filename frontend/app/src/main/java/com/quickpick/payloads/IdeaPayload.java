package com.quickpick.payloads;

import androidx.annotation.Nullable;

import java.util.Optional;

public class IdeaPayload {

    @Nullable
    private final String name;

    @Nullable
    private final String description;

    @Nullable
    private final String picture;

    public String getName() {
        return Optional.ofNullable(name).orElse("");
    }

    public String getDescription() {
        return Optional.ofNullable(description).orElse("");
    }

    public IdeaPayload() {
        name = "";
        description = "";
        picture = "";
    }

    public IdeaPayload(IdeaPayload idea) {
        this.name = idea.name;
        this.description = idea.description;
        this.picture = idea.picture;
    }

    public String getPicture() {
        return Optional.ofNullable(picture).orElse("");
    }

}
