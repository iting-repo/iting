package com.iting.jobportal.application;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.repository.AdminApplicationRepository;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.service.impl.AdminApplicationServiceImpl;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminApplicationServiceImplEdgeCaseTest {

    @Mock
    private AdminApplicationRepository adminApplicationRepository;

    @Mock
    private ApplyFormRepository applyFormRepository;

    @Mock
    private ApplicationMapperUtil applicationMapperUtil;

    @InjectMocks
    private AdminApplicationServiceImpl service;

    @Test
    void getAllSystemApplications_whenRepositoryReturnsEmptyPage_shouldReturnEmptyPageAndNotLoadForms() {
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        when(adminApplicationRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<ApplicationResponse> result = service.getAllSystemApplications(2, 3);

        assertTrue(result.isEmpty());
        verify(adminApplicationRepository).findAll(pageableCaptor.capture());
        assertEquals(2, pageableCaptor.getValue().getPageNumber());
        assertEquals(3, pageableCaptor.getValue().getPageSize());
        assertEquals(Sort.by("timeSent").descending(), pageableCaptor.getValue().getSort());

        verifyNoInteractions(applyFormRepository, applicationMapperUtil);
    }

    @Test
    void getAllSystemApplications_whenSentIdIsNull_shouldThrowNullPointerException() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(null)
                .build();

        when(adminApplicationRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(sent)));

        assertThrows(NullPointerException.class,
                () -> service.getAllSystemApplications(0, 10));

        verifyNoInteractions(applyFormRepository, applicationMapperUtil);
    }

    @Test
    void getAllSystemApplications_whenApplyFormIdIsNull_shouldPassNullToRepositoryThenThrowApplyFormNotFound() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(99L, null))
                .build();

        when(adminApplicationRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(sent)));
        when(applyFormRepository.findById(null)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getAllSystemApplications(0, 10));

        assertEquals("ApplyForm not found", ex.getMessage());
        verify(applyFormRepository).findById(null);
        verifyNoInteractions(applicationMapperUtil);
    }

    @Test
    void getAllSystemApplications_whenMapperThrows_shouldPropagateException() {
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(99L, 10L))
                .build();
        ApplyForm form = ApplyForm.builder().id(10L).build();

        when(adminApplicationRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(sent)));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form));
        when(applicationMapperUtil.buildFullResponse(form, sent))
                .thenThrow(new IllegalStateException("Map failed"));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.getAllSystemApplications(0, 10));

        assertEquals("Map failed", ex.getMessage());
        verify(applyFormRepository).findById(10L);
        verify(applicationMapperUtil).buildFullResponse(form, sent);
    }

    @Test
    void getAllSystemApplications_whenSecondItemFails_shouldAbortWholePageMapping() {
        ApplyFormSentToJob sent1 = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(1L, 10L))
                .build();
        ApplyFormSentToJob sent2 = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(2L, 20L))
                .build();

        ApplyForm form1 = ApplyForm.builder().id(10L).build();

        ApplicationResponse response1 = ApplicationResponse.builder().id(10L).build();

        when(adminApplicationRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of(sent1, sent2)));
        when(applyFormRepository.findById(10L)).thenReturn(Optional.of(form1));
        when(applyFormRepository.findById(20L)).thenReturn(Optional.empty());
        when(applicationMapperUtil.buildFullResponse(form1, sent1)).thenReturn(response1);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getAllSystemApplications(0, 10));

        assertEquals("ApplyForm not found", ex.getMessage());
        verify(applyFormRepository).findById(10L);
        verify(applyFormRepository).findById(20L);
        verify(applicationMapperUtil).buildFullResponse(form1, sent1);
    }

    @Test
    void getAllSystemApplications_whenRepositoryFindAllThrows_shouldPropagateException() {
        when(adminApplicationRepository.findAll(any(Pageable.class)))
                .thenThrow(new RuntimeException("DB failure"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getAllSystemApplications(0, 10));

        assertEquals("DB failure", ex.getMessage());
        verifyNoInteractions(applyFormRepository, applicationMapperUtil);
    }

    @Test
    void deleteApplication_shouldBuildExactCompositeKeyWithZeroJobId() {
        ArgumentCaptor<ApplyFormSentToJob.ApplyFormSentToJobId> captor =
                ArgumentCaptor.forClass(ApplyFormSentToJob.ApplyFormSentToJobId.class);

        service.deleteApplication(123L);

        verify(adminApplicationRepository).deleteById(captor.capture());
        verify(applyFormRepository).deleteById(123L);

        assertEquals(0L, captor.getValue().getJobId());
        assertEquals(123L, captor.getValue().getApplyFormId());
    }

    @Test
    void deleteApplication_whenJoinDeleteFails_shouldNotDeleteApplyForm() {
        doThrow(new RuntimeException("Delete join failed"))
                .when(adminApplicationRepository)
                .deleteById(any(ApplyFormSentToJob.ApplyFormSentToJobId.class));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.deleteApplication(15L));

        assertEquals("Delete join failed", ex.getMessage());
        verify(adminApplicationRepository).deleteById(any(ApplyFormSentToJob.ApplyFormSentToJobId.class));
        verify(applyFormRepository, never()).deleteById(any());
    }

    @Test
    void deleteApplication_whenApplyFormDeleteFails_shouldPropagateExceptionAfterJoinDelete() {
        doThrow(new RuntimeException("Delete form failed"))
                .when(applyFormRepository).deleteById(15L);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.deleteApplication(15L));

        assertEquals("Delete form failed", ex.getMessage());
        verify(adminApplicationRepository).deleteById(any(ApplyFormSentToJob.ApplyFormSentToJobId.class));
        verify(applyFormRepository).deleteById(15L);
    }

    @Test
    void deleteApplication_whenApplicationIdIsNull_shouldStillUseNullInCompositeKeyAndDeleteNullFormId() {
        ArgumentCaptor<ApplyFormSentToJob.ApplyFormSentToJobId> captor =
                ArgumentCaptor.forClass(ApplyFormSentToJob.ApplyFormSentToJobId.class);

        service.deleteApplication(null);

        verify(adminApplicationRepository).deleteById(captor.capture());
        verify(applyFormRepository).deleteById(null);

        assertEquals(0L, captor.getValue().getJobId());
        assertNull(captor.getValue().getApplyFormId());
    }

    @Test
    void getAllSystemApplications_whenPageOrSizeInvalid_shouldThrow() {
        assertThrows(IllegalArgumentException.class,
                () -> service.getAllSystemApplications(-1, 10));

        assertThrows(IllegalArgumentException.class,
                () -> service.getAllSystemApplications(0, 0));

        verifyNoInteractions(adminApplicationRepository, applyFormRepository, applicationMapperUtil);
    }
}