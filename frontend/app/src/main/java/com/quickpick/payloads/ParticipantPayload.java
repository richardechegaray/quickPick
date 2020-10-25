package com.quickpick.payloads;

import androidx.annotation.Nullable;

import java.io.Serializable;
import java.util.Optional;

public class ParticipantPayload implements Serializable {

    @Nullable
    private String name;

    private String id;

    public String getName() {
        return Optional.ofNullable(name).orElse("");
    }
}
