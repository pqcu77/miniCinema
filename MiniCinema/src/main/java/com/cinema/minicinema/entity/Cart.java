package com.cinema.minicinema.entity;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Cart {
    private Long id;
    private Long userId;
    private Long screeningId;
    private String seatNumbers;    // 座位号 (逗号分隔)
    private Integer quantity;      // 票数
    private BigDecimal price;      // 单价
    private BigDecimal totalPrice; // 总价
    private Long createdAt;
    private Long updatedAt;
}