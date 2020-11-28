package com.quickpick.payloads;

import androidx.annotation.Nullable;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class ListPayload implements Serializable {

    @Nullable
    private String name;

    @Nullable
    private String description;

    @Nullable
    @SerializedName("_id")
    private String id;

    @Nullable
    private List<IdeaPayload> ideas;

    public ListPayload(String name, String description, List<IdeaPayload> ideas) {
        this.name = name;
        this.description = description;
        this.ideas = ideas;
    }

    public List<IdeaPayload> getIdeas() {
        return Collections.unmodifiableList(Optional.ofNullable(ideas).orElse(new ArrayList<>()));
    }

    public String getName() {
        return Optional.ofNullable(name).orElse("");
    }

    public String getId() {
        return Optional.ofNullable(id).orElse("");
    }

    public String getDescription() {
        return Optional.ofNullable(description).orElse("");
    }

}
