package com.iting.jobportal.messaging.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.messaging.dto.request.SendMessageRequest;
import com.iting.jobportal.messaging.dto.response.MessageResponse;
import com.iting.jobportal.messaging.entity.Conversation;
import com.iting.jobportal.messaging.entity.Message;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.enums.ReceiverType;
import com.iting.jobportal.messaging.enums.SenderType;
import com.iting.jobportal.messaging.repository.ConversationRepository;
import com.iting.jobportal.messaging.repository.MessageRepository;
import com.iting.jobportal.messaging.service.event.DomainNotificationPublisher;
import com.iting.jobportal.messaging.service.MessageService;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DomainNotificationPublisher domainNotificationPublisher;

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, Long senderId) {
        // Get or create conversation
        Conversation conversation;
        
        if (request.getConversationId() != null) {
            // Use existing conversation
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            // Create new conversation
            ConversationType conversationType = determineConversationType(request);
            
            // Check if conversation already exists
            conversation = conversationRepository.findByParticipantsAndType(
                    senderId, request.getReceiverId(), conversationType
            ).orElseGet(() -> {
                // Create new conversation
                Conversation newConv = Conversation.builder()
                        .type(conversationType)
                        .participant1Id(senderId)
                        .participant2Id(request.getReceiverId())
                        .build();
                return conversationRepository.save(newConv);
            });
        }

        // Create message
        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .senderType(request.getSenderType())
                .receiverId(request.getReceiverId())
                .receiverType(request.getReceiverType())
                .content(request.getContent())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        // Update conversation's last message (done by trigger, but we can also update manually if needed)
        conversation.setLastMessageContent(request.getContent());
        conversation.setLastMessageTime(message.getCreatedAt());
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);

        MessageResponse response = convertToMessageResponse(message);

        String senderDisplayName = response.getSenderName() != null ? response.getSenderName() : "Someone";
        String contentPreview = request.getContent();
        if (contentPreview != null && contentPreview.length() > 120) {
            contentPreview = contentPreview.substring(0, 120) + "...";
        }

        if (request.getReceiverType() == ReceiverType.USER) {
            domainNotificationPublisher.notifyUser(
                    request.getReceiverId(),
                    NotificationType.MESSAGE_NEW,
                    "New message from " + senderDisplayName + ": " + contentPreview,
                    "CONVERSATION",
                    conversation.getId(),
                    "/messages?conversationId=" + conversation.getId()
            );
        } else {
            domainNotificationPublisher.notifyCompany(
                    request.getReceiverId(),
                    NotificationType.MESSAGE_NEW,
                    "New message from " + senderDisplayName + ": " + contentPreview,
                    "CONVERSATION",
                    conversation.getId(),
                    "/messages?conversationId=" + conversation.getId()
            );
        }

        return response;
    }

    @Override
    public Page<MessageResponse> getMessagesByConversation(Long conversationId, int page, int size) {
        // Validate pagination
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 20;

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

        return messagePage.map(this::convertToMessageResponse);
    }

    @Override
    public List<MessageResponse> getAllMessagesByConversation(Long conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessageAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Verify user is the receiver
        if (!message.getReceiverId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You are not the receiver of this message");
        }

        if (!message.getIsRead()) {
            messageRepository.markAsRead(messageId, LocalDateTime.now());
        }
    }

    @Override
    @Transactional
    public void markAllMessagesAsReadInConversation(Long conversationId, Long userId) {
        messageRepository.markAllAsReadInConversation(conversationId, userId, LocalDateTime.now());
    }

    @Override
    public Long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadByReceiverId(userId);
    }

    @Override
    public List<MessageResponse> getUnreadMessages(Long userId) {
        List<Message> messages = messageRepository.findUnreadByReceiverId(userId);
        return messages.stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Verify user is the sender
        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own messages");
        }

        messageRepository.delete(message);
    }

    @Override
    public MessageResponse getMessageById(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        return convertToMessageResponse(message);
    }

    // Helper methods

    private ConversationType determineConversationType(SendMessageRequest request) {
        if (request.getSenderType() == SenderType.USER && request.getReceiverType() == ReceiverType.USER) {
            return ConversationType.USER_USER;
        }
        return ConversationType.USER_COMPANY;
    }

    private MessageResponse convertToMessageResponse(Message message) {
        MessageResponse response = MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .senderType(message.getSenderType())
                .receiverId(message.getReceiverId())
                .receiverType(message.getReceiverType())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();

        // Fetch sender name and avatar
        try {
            switch (message.getSenderType()) {
                case USER:
                    User sender = userRepository.findById(message.getSenderId()).orElse(null);
                    if (sender != null) {
                        response.setSenderName(sender.getFullName());
                        response.setSenderAvatar(sender.getAvatarUrl());
                    }
                    break;
                case COMPANY:
                    Company senderCompany = companyRepository.findById(message.getSenderId()).orElse(null);
                    if (senderCompany != null) {
                        response.setSenderName(senderCompany.getName());
                        response.setSenderAvatar(senderCompany.getLogoUrl());
                    }
                    break;
            }

            // Fetch receiver name and avatar
            switch (message.getReceiverType()) {
                case USER:
                    User receiver = userRepository.findById(message.getReceiverId()).orElse(null);
                    if (receiver != null) {
                        response.setReceiverName(receiver.getFullName());
                        response.setReceiverAvatar(receiver.getAvatarUrl());
                    }
                    break;
                case COMPANY:
                    Company receiverCompany = companyRepository.findById(message.getReceiverId()).orElse(null);
                    if (receiverCompany != null) {
                        response.setReceiverName(receiverCompany.getName());
                        response.setReceiverAvatar(receiverCompany.getLogoUrl());
                    }
                    break;
            }
        } catch (Exception e) {
            // Silently handle errors in fetching names/avatars
        }

        return response;
    }
}
