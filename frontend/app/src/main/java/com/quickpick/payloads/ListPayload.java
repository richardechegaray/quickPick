package com.quickpick.payloads;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class ListPayload {

    private String name;

    private List<IdeaPayload> ideas;

    public List<IdeaPayload> getIdeas() {
        return Collections.unmodifiableList(Optional.ofNullable(ideas).orElse(new ArrayList<>()));
    }
}