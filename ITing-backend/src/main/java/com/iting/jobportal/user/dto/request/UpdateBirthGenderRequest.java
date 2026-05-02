package com.iting.jobportal.user.dto.request;

import com.iting.jobportal.user.entity.enums.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateBirthGenderRequest {
    private LocalDate birthDate;
    private Gender gender;
}
