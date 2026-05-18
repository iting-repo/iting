package com.iting.jobportal.messaging.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.messaging.dto.response.ConversationListResponse;
import com.iting.jobportal.messaging.dto.response.ConversationResponse;
import com.iting.jobportal.messaging.entity.Conversation;
import com.iting.jobportal.messaging.enums.ConversationType;
import com.iting.jobportal.messaging.repository.ConversationRepository;
import com.iting.jobportal.messaging.repository.MessageRepository;
import com.iting.jobportal.messaging.service.ConversationService;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @Override
    public ConversationListResponse getConversationsForUser(Long userId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "lastMessageTime"));
        Page<Conversation> conversationPage = conversationRepository.findByUserId(userId, pageable);

        List<ConversationResponse> responses = conversationPage.getContent().stream()
                .map(conversation -> convertToConversationResponse(conversation, userId))
                .collect(Collectors.toList());

        return ConversationListResponse.builder()
                .conversations(responses)
                .totalCount(conversationPage.getTotalElements())
                .currentPage(conversationPage.getNumber())
                .totalPages(conversationPage.getTotalPages())
                .pageSize(conversationPage.getSize())
                .build();
    }

    @Override
    public ConversationListResponse getConversationsByType(Long userId, ConversationType type, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "lastMessageTime"));
        Page<Conversation> conversationPage = conversationRepository.findByUserIdAndType(userId, type, pageable);

        List<ConversationResponse> responses = conversationPage.getContent().stream()
                .map(conversation -> convertToConversationResponse(conversation, userId))
                .collect(Collectors.toList());

        return ConversationListResponse.builder()
                .conversations(responses)
                .totalCount(conversationPage.getTotalElements())
                .currentPage(conversationPage.getNumber())
                .totalPages(conversationPage.getTotalPages())
                .pageSize(conversationPage.getSize())
                .build();
    }

    @Override
    public ConversationResponse getConversationById(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!isParticipant(conversation, userId)) {
            throw new RuntimeException("Unauthorized: You are not a participant of this conversation");
        }

        return convertToConversationResponse(conversation, userId);
    }

    @Override
    public ConversationResponse getConversationBetweenParticipants(Long userId1, Long userId2) {
        return conversationRepository.findByParticipants(userId1, userId2)
                .map(conversation -> convertToConversationResponse(conversation, userId1))
                .orElse(null);
    }

    @Override
    public Long getUnreadCountForConversation(Long conversationId, Long userId) {
        return messageRepository.countUnreadByConversationIdAndReceiverId(conversationId, userId);
    }

    @Override
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!isParticipant(conversation, userId)) {
            throw new RuntimeException("Unauthorized: You are not a participant of this conversation");
        }

        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.delete(conversation);
    }

    @Override
    public Long getTotalConversationCount(Long userId) {
        return conversationRepository.countByUserId(userId);
    }

    private boolean isParticipant(Conversation conversation, Long userId) {
        return conversation.getParticipant1Id().equals(userId) || conversation.getParticipant2Id().equals(userId);
    }

    private ConversationResponse convertToConversationResponse(Conversation conversation, Long currentUserId) {
        Long unreadCount = messageRepository.countUnreadByConversationIdAndReceiverId(conversation.getId(),
                currentUserId);

        ConversationResponse response = ConversationResponse.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .participant1Id(conversation.getParticipant1Id())
                .participant2Id(conversation.getParticipant2Id())
                .lastMessageContent(conversation.getLastMessageContent())
                .lastMessageTime(conversation.getLastMessageTime())
                .unreadCount(unreadCount.intValue())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();

        fillParticipantProfile(response, conversation.getParticipant1Id(), true, currentUserId);
        fillParticipantProfile(response, conversation.getParticipant2Id(), false, currentUserId);

        Long otherParticipantId = conversation.getParticipant1Id().equals(currentUserId)
                ? conversation.getParticipant2Id()
                : conversation.getParticipant1Id();
        response.setOtherParticipantId(otherParticipantId);

        if (response.getParticipant1Id().equals(otherParticipantId)) {
            response.setOtherParticipantName(response.getParticipant1Name());
            response.setOtherParticipantAvatar(response.getParticipant1Avatar());
        } else {
            response.setOtherParticipantName(response.getParticipant2Name());
            response.setOtherParticipantAvatar(response.getParticipant2Avatar());
        }

        return response;
    }

    private void fillParticipantProfile(ConversationResponse response, Long participantId, boolean firstParticipant, Long currentUserId) {
        User user = userRepository.findById(participantId).orElse(null);
        if (user != null) {
            var account = user.getAccount();
            String name = account != null ? account.getFullName() : null;
            String avatar = account != null ? account.getAvatarUrl() : null;
            if (firstParticipant) {
                response.setParticipant1Name(name);
                response.setParticipant1Avatar(avatar);
            } else {
                response.setParticipant2Name(name);
                response.setParticipant2Avatar(avatar);
            }
            if (!participantId.equals(currentUserId)) {
                response.setOtherParticipantActive(true); // User accounts are currently assumed active
            }
            return;
        }

        Company company = companyRepository.findById(participantId).orElse(null);
        if (company != null) {
            if (firstParticipant) {
                response.setParticipant1Name(company.getName());
                response.setParticipant1Avatar(company.getLogoUrl());
            } else {
                response.setParticipant2Name(company.getName());
                response.setParticipant2Avatar(company.getLogoUrl());
            }
            if (!participantId.equals(currentUserId)) {
                response.setOtherParticipantActive(company.getActive() != null ? company.getActive() : true);
            }
        }
    }
}
