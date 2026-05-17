package com.iting.jobportal.userprofile.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.common.service.MlServiceClient;
import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.user.entity.CandidateProfile;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.impl.CVServiceImpl;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CVServiceImplAiMatchingTest {

    @Mock CVRepository cvRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock UserRepository userRepository;
    @Mock S3Service s3Service;
    @Mock EntityManager entityManager;
    @Mock MlServiceClient mlServiceClient;

    @Test
    void uploadCvStoresAiMatchingEmbeddingOnCandidateProfile() throws Exception {
        Account account = Account.builder()
                .id(7L)
                .email("candidate@example.com")
                .passwordHash("hash")
                .fullName("Candidate")
                .build();
        UserProfile profile = new UserProfile();
        profile.setId(3L);
        profile.setAccount(account);
        CandidateProfile candidateProfile = new CandidateProfile();
        candidateProfile.setId(7L);
        candidateProfile.setAccount(account);

        when(userProfileRepository.findByAccountId(7L)).thenReturn(Optional.of(profile));
        when(cvRepository.countByProfile_Id(3L)).thenReturn(0L);
        when(s3Service.uploadFile(any(), eq("cvs/user_7"))).thenReturn("cvs/user_7/cv.pdf");
        when(s3Service.getPreSignedUrl("cvs/user_7/cv.pdf")).thenReturn("https://cdn/cv.pdf");
        when(cvRepository.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mlServiceClient.extractCv(any())).thenReturn(Optional.of(new ObjectMapper().readTree("""
                {"status":"ok","embedding":[0.25,0.75],"dimension":2}
                """)));
        when(userRepository.findById(7L)).thenReturn(Optional.of(candidateProfile));

        CVServiceImpl service = new CVServiceImpl(
                cvRepository,
                userProfileRepository,
                userRepository,
                s3Service,
                entityManager,
                mlServiceClient,
                new ObjectMapper()
        );
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", "pdf".getBytes());

        service.uploadCV(7L, file, null);

        ArgumentCaptor<CandidateProfile> captor = ArgumentCaptor.forClass(CandidateProfile.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getCvEmbedding()).isEqualTo("[0.25,0.75]");
    }
}
