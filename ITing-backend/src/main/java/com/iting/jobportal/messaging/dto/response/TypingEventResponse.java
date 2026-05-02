package com.iting.jobportal.messaging.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingEventResponse {

    private Long conversationId;
    private Long userId;
    private Boolean typing;
}
