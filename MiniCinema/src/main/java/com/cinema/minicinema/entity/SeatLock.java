package com.cinema.minicinema.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SeatLock {
    private Integer lockId;
    private Integer screeningId;
    private Integer seatId;
    private Integer userId;
    private LocalDateTime lockTime;
    private LocalDateTime expireTime;
    private String lockStatus; // LOCKED, PAID, EXPIRED, CANCELLED
    private Integer orderId;
    private LocalDateTime createTime;
}