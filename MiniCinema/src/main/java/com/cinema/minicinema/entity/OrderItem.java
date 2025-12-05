package com.cinema.minicinema.entity;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItem {
    private Long id;
    private Long orderId;           // 订单ID
    private Long screeningId;       // 场次ID
    private String seatNumbers;     // 座位号 (逗号分隔，如: "A1,A2,B3")
    private Integer quantity;       // 数量
    private BigDecimal price;       // 单价
    private BigDecimal totalPrice;  // 总价
    private Long createdAt;
    private Long updatedAt;
}