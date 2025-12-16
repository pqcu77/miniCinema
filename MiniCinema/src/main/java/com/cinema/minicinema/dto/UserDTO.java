package com.cinema.minicinema.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Integer userId;
    private String username;
    private String email;
    private String phone;
    private String avatarUrl;
    private String token;  // 登录令牌
    private LocalDateTime createTime;
    private LocalDateTime lastLoginTime;
}