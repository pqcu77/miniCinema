package com.cinema.minicinema.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Integer userId;

    private String username;
    private String password;
    private String email;
    private String phone;
    private String avatarUrl;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    private LocalDateTime lastLoginTime;
}