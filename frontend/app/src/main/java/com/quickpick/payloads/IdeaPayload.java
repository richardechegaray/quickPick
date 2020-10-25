package com.quickpick.payloads;

import androidx.annotation.Nullable;

import java.util.Optional;

public class IdeaPayload {

    @Nullable
    private final String name;

    @Nullable
    private final String description;

    @Nullable
    private final String imageUrl;

    public String getName() {
        return Optional.ofNullable(name).orElse("");
    }

    public String getDescription() {
        return Optional.ofNullable(description).orElse("");
    }

    public String getImageUrl() {
        // TODO: Return actual URL
        return "https://www.rover.com/blog/wp-content/uploads/2019/05/puppy-in-bowl.jpg";
    }

    public IdeaPayload(IdeaPayload idea) {
        this.name = idea.name;
        this.description = idea.description;
        this.imageUrl = idea.imageUrl;
    }

}
