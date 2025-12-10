package com.cinema.minicinema.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHistory {
    private Long id;
    private Long userId;
    private Long movieId;
    private LocalDateTime viewTime;
    private Integer watchDuration;

    // 新增字段
    private String action;           // 用户行为类型：like, rate, view
    private BigDecimal score;        // 评分
    private LocalDateTime createdAt; // 创建时间
}
