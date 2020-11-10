package com.quickpick.payloads;

public class LoginRequest {

    private final String firebaseToken;

    public LoginRequest(String firebaseToken) {
        this.firebaseToken = firebaseToken;
    }
}
