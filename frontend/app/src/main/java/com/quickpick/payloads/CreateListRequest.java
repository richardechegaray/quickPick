package com.quickpick.payloads;

public class CreateListRequest {

    private final String facebookToken;

    private final ListPayload list;

    public CreateListRequest(String facebookToken, ListPayload list) {
        this.facebookToken = facebookToken;
        this.list = list;
    }

}
