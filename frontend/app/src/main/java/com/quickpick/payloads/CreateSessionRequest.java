package com.quickpick.payloads;

public class CreateSessionRequest {

    private final String facebookToken;

    private final int size;

    public CreateSessionRequest(String facebookToken, int size) {
        this.facebookToken = facebookToken;
        this.size = size;
    }
}
