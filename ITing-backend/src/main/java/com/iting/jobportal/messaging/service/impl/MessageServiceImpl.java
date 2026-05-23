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
import org.springframework.dao.DataIntegrityViolationException;
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
        // Validate sender suspension if COMPANY
        if (request.getSenderType() == SenderType.COMPANY) {
            Company senderCompany = companyRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            if (senderCompany.getActive() != null && !senderCompany.getActive()) {
                throw new RuntimeException("Tài khoản công ty của bạn đã bị đình chỉ. Không thể gửi tin nhắn.");
            }
        }

        // Validate receiver suspension if COMPANY
        if (request.getReceiverType() == ReceiverType.COMPANY) {
            Company receiverCompany = companyRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            if (receiverCompany.getActive() != null && !receiverCompany.getActive()) {
                throw new RuntimeException("Công ty này hiện đang bị đình chỉ. Không thể gửi tin nhắn.");
            }
        }

        // Get or create conversation
        Conversation conversation;

        if (request.getConversationId() != null) {
            // Use existing conversation
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            // Get-or-create với unique constraint guard (V103: uq_conversations_participants_type).
            // Nếu 2 request song song cùng race vào nhánh tạo mới, request thua sẽ bắt
            // DataIntegrityViolationException và re-query để lấy conversation request thắng vừa tạo.
            ConversationType conversationType = determineConversationType(request);
            conversation = conversationRepository
                    .findByParticipantsAndType(senderId, request.getReceiverId(), conversationType)
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .type(conversationType)
                                .participant1Id(senderId)
                                .participant2Id(request.getReceiverId())
                                .build();
                        try {
                            return conversationRepository.saveAndFlush(newConv);
                        } catch (DataIntegrityViolationException dup) {
                            return conversationRepository
                                    .findByParticipantsAndType(senderId, request.getReceiverId(), conversationType)
                                    .orElseThrow(() -> dup);
                        }
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

        final Message savedMessage = messageRepository.save(message);

        // Update conversation's last message
        conversation.setLastMessageContent(request.getContent());
        conversation.setLastMessageTime(savedMessage.getCreatedAt());
        conversation.setLastMessageId(savedMessage.getId());
        conversationRepository.save(conversation);

        // Build response directly — skip extra DB lookups for speed
        MessageResponse response = MessageResponse.builder()
                .id(savedMessage.getId())
                .conversationId(savedMessage.getConversationId())
                .senderId(savedMessage.getSenderId())
                .senderType(savedMessage.getSenderType())
                .receiverId(savedMessage.getReceiverId())
                .receiverType(savedMessage.getReceiverType())
                .content(savedMessage.getContent())
                .isRead(savedMessage.getIsRead())
                .readAt(savedMessage.getReadAt())
                .createdAt(savedMessage.getCreatedAt())
                .build();

        // Fire notification (non-blocking errors)
        final Long convId = conversation.getId();
        try {
            String senderDisplayName = resolveSenderName(savedMessage);
            String contentPreview = request.getContent();
            if (contentPreview != null && contentPreview.length() > 120) {
                contentPreview = contentPreview.substring(0, 120) + "...";
            }

            if (request.getReceiverType() == ReceiverType.USER) {
                domainNotificationPublisher.notifyUser(
                        request.getReceiverId(),
                        NotificationType.MESSAGE_NEW,
                        "New message from " + senderDisplayName + ": " + contentPreview,
                        "CONVERSATION", convId,
                        "/messages?conversationId=" + convId);
            } else {
                domainNotificationPublisher.notifyCompany(
                        request.getReceiverId(),
                        NotificationType.MESSAGE_NEW,
                        "New message from " + senderDisplayName + ": " + contentPreview,
                        "CONVERSATION", convId,
                        "/messages?conversationId=" + convId);
            }
        } catch (Exception e) {
            // Log but don't fail the send
        }

        return response;
    }

    @Override
    public Page<MessageResponse> getMessagesByConversation(Long conversationId, int page, int size) {
        // Validate pagination
        if (page < 0)
            page = 0;
        if (size <= 0 || size > 100)
            size = 20;

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId,
                pageable);

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
                    if (sender != null && sender.getAccount() != null) {
                        response.setSenderName(sender.getAccount().getFullName());
                        response.setSenderAvatar(sender.getAccount().getAvatarUrl());
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
                    if (receiver != null && receiver.getAccount() != null) {
                        response.setReceiverName(receiver.getAccount().getFullName());
                        response.setReceiverAvatar(receiver.getAccount().getAvatarUrl());
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

    private String resolveSenderName(Message message) {
        try {
            switch (message.getSenderType()) {
                case USER:
                    return userRepository.findById(message.getSenderId())
                            .map(User::getAccount)
                            .map(com.iting.jobportal.auth.entity.Account::getFullName)
                            .orElse("Someone");
                case COMPANY:
                    return companyRepository.findById(message.getSenderId())
                            .map(Company::getName).orElse("Someone");
            }
        } catch (Exception ignored) {
        }
        return "Someone";
    }
}
