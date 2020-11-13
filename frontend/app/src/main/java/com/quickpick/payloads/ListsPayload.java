package com.quickpick.payloads;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class ListsPayload {

    @Nullable
    private List<ListPayload> lists;

    public List<ListPayload> getLists() {
        return Collections.unmodifiableList(Optional.ofNullable(lists).orElse(new ArrayList<>()));
    }
}
