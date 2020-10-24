package com.quickpick.payloads;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

public class SessionPayload implements Serializable {

    public static final String INTENT_KEY = "SessionPayload";

    private String pin;

    private String status;

    private List<ParticipantPayload> participants;

    private ListPayload list;

    public String getPin() {
        return pin;
    }

    public String getStatus() {
        return status;
    }

    public List<ParticipantPayload> getParticipants() {
        return Collections.unmodifiableList(participants);
    }

}
