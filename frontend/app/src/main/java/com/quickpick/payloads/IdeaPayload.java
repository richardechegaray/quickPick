package com.quickpick.payloads;

public class IdeaPayload {

    private String name;

    private String description;

    private String imageUrl;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        // TODO: get endpoint
        return "https://www.rover.com/blog/wp-content/uploads/2019/05/puppy-in-bowl.jpg";
    }

    public IdeaPayload(IdeaPayload idea) {
        this.name = idea.name;
        this.description = idea.description;
        this.imageUrl = idea.imageUrl;
    }


}
