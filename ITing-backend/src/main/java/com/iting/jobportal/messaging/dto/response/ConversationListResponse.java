package com.iting.jobportal.messaging.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationListResponse {

    private List<ConversationResponse> conversations;
    private Long totalCount;
    private Integer currentPage;
    private Integer totalPages;
    private Integer pageSize;
}
