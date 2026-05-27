package com.iting.jobportal.auth.dto.request;

import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.common.validation.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Fullname is required")
    private String fullName;

    @Email(message = "Email is invalid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @StrongPassword
    private String password;

    @NotNull(message = "Role is required")
    private Role role;
}