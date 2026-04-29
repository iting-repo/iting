package com.iting.jobportal.messaging.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TypingEventRequest {

    @NotNull
    private Long conversationId;

    @NotNull
    private Boolean typing;
}
