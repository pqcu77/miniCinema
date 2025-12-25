package com.cinema.minicinema.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class OrderDTO {
    private Long orderId;
    private Long userId;
    private String status;           // 订单状态: 0-待支付 1-已支付 2-已取消
    private BigDecimal totalAmount;
    private String orderNumber;
    private LocalDateTime createTime;
    private LocalDateTime payTime;
}

@Data
class OrderItemDTO {
    private String movieName;
    private String showTime;
    private String seatNumbers;
    private Integer quantity;
    private BigDecimal totalPrice;
}