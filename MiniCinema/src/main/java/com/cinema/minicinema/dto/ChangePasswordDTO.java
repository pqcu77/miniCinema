package com.cinema.minicinema.dto;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    private Integer userId;
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}