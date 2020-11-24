package com.quickpick.payloads;

import androidx.annotation.Nullable;

import java.util.Optional;

public class IdeaPayload {

    @Nullable
    private  String name;

    @Nullable
    private  String description;

    @Nullable
    private final String picture;

    public String getName() {
        return Optional.ofNullable(name).orElse("");
    }

    public String getDescription() {
        return Optional.ofNullable(description).orElse("");
    }

    public void setName(String newName) {
        this.name = newName;
    }

    public void setDescription(String newDescription) {
        this.description = newDescription;
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
