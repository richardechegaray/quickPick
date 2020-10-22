package com.quickpick.payloads;

import java.util.List;

public class SessionPayload {

    private String pin;

    private String status;

    private List<ParticipantPayload> participants;

    public SessionPayload() {
    }
}
