package com.iting.jobportal.user.dto.request;

import com.iting.jobportal.user.entity.enums.Gender;
import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateBirthGenderRequest {
  private LocalDate birthDate;
  private Gender gender;
}
