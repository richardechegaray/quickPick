package com.quickpick.payloads;

import java.util.List;

public class PostChoicesRequest {

    private final List<ChoicePayload> choices;

    public PostChoicesRequest(List<ChoicePayload> choices) {
        this.choices = choices;
    }
}