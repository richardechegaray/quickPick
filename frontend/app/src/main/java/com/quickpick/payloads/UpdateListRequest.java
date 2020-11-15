package com.quickpick.payloads;

import com.google.gson.annotations.SerializedName;

public class UpdateListRequest {

    @SerializedName("listID")
    private final String listId;

    public UpdateListRequest(String listId) {
        this.listId = listId;
    }
}
