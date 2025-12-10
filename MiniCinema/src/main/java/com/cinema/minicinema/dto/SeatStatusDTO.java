package com.cinema.minicinema.dto;

import lombok.Data;

/**
 * 座位状态（前端选座页面使用）
 */
@Data
public class SeatStatusDTO {
    private Integer seatId;
    private Integer rowNum;
    private Integer colNum;
    private String seatLabel; // A1, B5, C10
    private String status; // AVAILABLE(可选), LOCKED(锁定中), SOLD(已售出), BROKEN(损坏)
    private Long remainingSeconds; // 如果是LOCKED状态，显示剩余秒数
    private Integer lockedByUserId; // 锁定者的用户ID（仅当前用户可见自己锁定的座位）
}