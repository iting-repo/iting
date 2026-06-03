package com.iting.jobportal.user.repository;

import com.iting.jobportal.user.entity.*;
import com.iting.jobportal.userprofile.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {}
