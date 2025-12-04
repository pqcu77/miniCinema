package com.cinema.minicinema.dto;

import lombok.Data;

@Data
public class UpdateUserDTO {
    private Integer userId;
    private String email;
    private String phone;
    private String avatarUrl;
}