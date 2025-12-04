package com.cinema.minicinema.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {
    private Integer orderId;

    private String orderNumber;
    private Integer userId;
    private Integer screeningId;
    private String seatInfo;
    private Integer seatCount;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime payTime;

    private LocalDateTime createTime;
}