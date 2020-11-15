package com.quickpick.payloads;

import androidx.annotation.Nullable;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class SessionPayload implements Serializable {

    public static final String INTENT_KEY = "SessionPayload";

    @Nullable
    private String pin;

    @Nullable
    private String status;

    @Nullable
    private List<ParticipantPayload> participants;

    @Nullable
    private List<ResultPayload> results;

    @Nullable
    @SerializedName("listID")
    private String listId;

    private String listName;

    @Nullable
    private String creator;

    public String getPin() {
        return Optional.ofNullable(pin).orElse("");
    }

    public String getStatus() {
        return Optional.ofNullable(status).orElse("");
    }

    public List<ParticipantPayload> getParticipants() {
        return Collections.unmodifiableList(Optional.ofNullable(participants).orElse(new ArrayList<>()));
    }

    public List<ResultPayload> getResults() {
        return Collections.unmodifiableList(Optional.ofNullable(results).orElse(new ArrayList<>()));
    }

    public String getListId() {
        return Optional.ofNullable(listId).orElse("");
    }

    public String getListName() {
        return Optional.ofNullable(listName).orElse("");
    }

    public String getCreator() {
        return Optional.ofNullable(creator).orElse("");
    }

}
