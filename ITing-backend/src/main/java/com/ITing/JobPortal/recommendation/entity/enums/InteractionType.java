package com.iting.jobportal.recommendation.entity.enums;

public enum InteractionType {
    VIEW(1),
    CLICK(2),
    SAVE(3),
    APPLY(5);

    private final int weight;

    InteractionType(int weight) {
        this.weight = weight;
    }

    public int getWeight() {
        return weight;
    }
}
