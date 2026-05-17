package com.iting.jobportal.messaging.websocket;

import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.request.TypingEventRequest;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import com.iting.jobportal.messaging.dto.response.TypingEventResponse;
import com.iting.jobportal.messaging.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketMessageHandler {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public MessageResponse sendMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized websocket message");
        }

        Long senderId = Long.parseLong(principal.getName());

        MessageResponse response = messageService.sendMessage(request, senderId);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + response.getConversationId(),
                response);

        return response;
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingEventRequest request, Principal principal) {
        if (principal == null) {
            return;
        }

        Long userId = Long.parseLong(principal.getName());
        TypingEventResponse response = TypingEventResponse.builder()
                .conversationId(request.getConversationId())
                .userId(userId)
                .typing(Boolean.TRUE.equals(request.getTyping()))
                .build();

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + request.getConversationId() + "/typing",
                response);
    }
}
