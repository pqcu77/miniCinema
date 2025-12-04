package com.cinema.minicinema.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
// 移除 @TableName 注解
public class Hall {
    // 移除 @TableId 注解
    private Integer hallId;

    private Integer cinemaId;
    private String name;
    private Integer capacity;
    private String hallType;
    private String facilities;

    // 移除 @TableField 注解
    private LocalDateTime createTime;
}