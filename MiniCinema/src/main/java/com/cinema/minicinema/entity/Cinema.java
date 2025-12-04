package com.cinema.minicinema.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
// 移除 @TableName 注解
public class Cinema {
    // 移除 @TableId 注解
    private Integer cinemaId;

    private String name;
    private String address;
    private String city;
    private String district;
    private String phone;
    private String facilities;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // 移除 @TableField 注解
    private LocalDateTime createTime;
}