package com.quickpick.payloads;

public class LoginPayload {

    private String facebookToken;

    private String firebaseToken;

    public LoginPayload(String facebookToken, String firebaseToken) {
        this.facebookToken = facebookToken;
        this.firebaseToken = firebaseToken;
    }
}
