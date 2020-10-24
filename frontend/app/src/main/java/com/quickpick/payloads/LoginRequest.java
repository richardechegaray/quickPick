package com.quickpick.payloads;

public class LoginRequest {

    private final String facebookToken;

    private final String firebaseToken;

    public LoginRequest(String facebookToken, String firebaseToken) {
        this.facebookToken = facebookToken;
        this.firebaseToken = firebaseToken;
    }
}
