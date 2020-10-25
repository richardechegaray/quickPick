package com.quickpick.payloads;

import java.util.List;

public class PostChoicesRequest {

    private final String facebookToken;
    private List<ChoicePayload> choices;

    public PostChoicesRequest(String facebookToken, List<ChoicePayload> choices) {
        this.facebookToken = facebookToken;
        this.choices = choices;
    }
}