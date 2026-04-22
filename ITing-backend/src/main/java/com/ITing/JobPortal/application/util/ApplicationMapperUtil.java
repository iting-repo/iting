package com.iting.jobportal.application.util;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.ContactInfo;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.Education;
import com.iting.jobportal.userprofile.entity.Experience;
import com.iting.jobportal.userprofile.repository.ContactInfoRepository;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.EducationRepository;
import com.iting.jobportal.userprofile.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApplicationMapperUtil {
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final ContactInfoRepository contactInfoRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;

    public ApplicationResponse buildFullResponse(ApplyForm applyForm, ApplyFormSentToJob sent) {
        Long jobId = sent.getId().getJobId();
        Long userId = applyForm.getUserId();

        String jobTitle = null;
        Long companyId = null;
        String companyName = null;
        String companyLogo = null;

        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isPresent()) {
            Job job = jobOpt.get();
            jobTitle = job.getPosition();
            Company company = job.getCompany();
            if (company != null) {
                companyId = company.getId();
                companyName = company.getName();
                companyLogo = company.getLogoUrl();
            }
        }

        String avatarUrl = userRepository.findById(userId).map(User::getAvatarUrl).orElse(null);

        String cvFileName = null;
        String cvFileType = null;
        String cvUrl = null;
        if (applyForm.getCv() != null) {
            CV cv = applyForm.getCv();
            cvUrl = cv.getFileUrl();
            if (cvUrl != null) {
                String path = cvUrl.contains("/") ? cvUrl.substring(cvUrl.lastIndexOf('/') + 1) : cvUrl;
                int dotIdx = path.lastIndexOf('.');
                if (dotIdx > 0) {
                    cvFileName = path.substring(0, dotIdx);
                    cvFileType = path.substring(dotIdx + 1).toUpperCase();
                } else {
                    cvFileName = path;
                    cvFileType = "PDF";
                }
            }
            if (cvFileName == null) {
                cvFileName = cv.getTitle() != null ? cv.getTitle() : applyForm.getCvTitle();
            }
        } else if (applyForm.getCvTitle() != null && applyForm.getCvTitle().startsWith("CV_")) {
            try {
                Long cvId = Long.parseLong(applyForm.getCvTitle().substring(3));
                Optional<CV> cvOpt = cvRepository.findById(cvId);
                if (cvOpt.isPresent()) {
                    CV cv = cvOpt.get();
                    cvUrl = cv.getFileUrl();
                    if (cvUrl != null) {
                        String path = cvUrl.contains("/") ? cvUrl.substring(cvUrl.lastIndexOf('/') + 1) : cvUrl;
                        int dotIdx = path.lastIndexOf('.');
                        if (dotIdx > 0) {
                            cvFileName = path.substring(0, dotIdx);
                            cvFileType = path.substring(dotIdx + 1).toUpperCase();
                        } else {
                            cvFileName = path;
                            cvFileType = "PDF";
                        }
                    }
                }
            } catch (NumberFormatException ignored) {
                cvFileName = applyForm.getCvTitle();
            }
        } else {
            cvFileName = applyForm.getCvTitle();
        }

        String phoneNumber = null;
        String email = null;
        Optional<ContactInfo> contactOpt = contactInfoRepository.findById(userId);
        if (contactOpt.isPresent()) {
            ContactInfo c = contactOpt.get();
            phoneNumber = c.getPhone();
            email = c.getEmail();
        }
        if (email == null || email.isBlank()) {
            email = userRepository.findById(userId)
                    .map(u -> u.getAccount() != null ? u.getAccount().getEmail() : String.valueOf(userId))
                    .orElse(String.valueOf(userId));
        }

        List<Experience> experiences = experienceRepository.findByProfile_Id(userId);
        int totalMonths = 0;
        LocalDate now = LocalDate.now();
        for (Experience exp : experiences) {
            LocalDate start = exp.getStartDate();
            LocalDate end = exp.getEndDate() != null ? exp.getEndDate() : now;
            if (start != null) {
                totalMonths += (int) ChronoUnit.MONTHS.between(start, end);
            }
        }
        Integer yearsExperience = totalMonths > 0 ? Math.max(1, totalMonths / 12) : null;

        List<Education> educations = educationRepository.findByProfile_Id(userId);
        String education = educations.stream()
                .filter(e -> e.getDegree() != null)
                .max(Comparator.comparing(e -> e.getEndDate() != null ? e.getEndDate() : LocalDate.MIN))
                .map(Education::getDegree)
                .orElse(null);

        return ApplicationResponse.builder()
                .id(applyForm.getId())
                .userId(userId)
                .jobId(jobId)
                .companyId(companyId)
                .companyName(companyName)
                .applicantName(applyForm.getApplicantName())
                .avatarUrl(avatarUrl)
                .jobTitle(jobTitle)
                .companyLogo(companyLogo)
                .introduction(applyForm.getIntroduction())
                .cvFileName(cvFileName)
                .cvFileType(cvFileType)
                .cvUrl(cvUrl)
                .phoneNumber(phoneNumber)
                .email(email)
                .yearsExperience(yearsExperience)
                .education(education)
                .timeSent(sent.getTimeSent())
                .status(sent.getStatus() != null ? sent.getStatus() : com.iting.jobportal.application.entity.enums.ApplicationStatus.PENDING)
                .build();
    }
}
