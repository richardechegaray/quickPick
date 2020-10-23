package com.quickpick.payloads;

import java.io.Serializable;
import java.util.List;

public class SessionPayload implements Serializable {

    private String pin;

    private String status;

    private List<ParticipantPayload> participants;

    public SessionPayload() {
    }
}
