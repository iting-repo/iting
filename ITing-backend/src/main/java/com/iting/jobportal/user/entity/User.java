package com.iting.jobportal.user.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
public class User {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "Id")
    private Account account;

    // cân nhắc để ra Account luôn vì Admin và HR đều có trường phone_num, giữ lại
    // vì trường này phục vụ để khi quên mật khẩu (quan trọng)
    @Column(name = "Phone_num", length = 20)
    private String phoneNum;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Cv_embedding", columnDefinition = "TEXT")
    private String cvEmbedding;

    @Column(name = "full_name", length = 255, nullable = false)
    private String fullName;

    @Column(name = "Avatar", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;
}
