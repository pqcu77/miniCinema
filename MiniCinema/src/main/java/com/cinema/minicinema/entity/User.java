package com.cinema.minicinema.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// 移除 @TableName 注解
public class User {
    // 移除 @TableId 注解
    private Integer userId;

    private String username;
    private String password;
    private String email;
    private String phone;
    private String avatarUrl;

    // 移除 @TableField 注解
    private LocalDateTime createTime;

    private LocalDateTime lastLoginTime;

    // 移除 @TableLogic 注解
    private Integer deleted;
}