package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderDTO {
    private Long orderId;
    private Long userId;
    private Integer status;           // 订单状态: 0-待支付 1-已支付 2-已取消
    private BigDecimal totalAmount;
    private String orderNumber;
    private Long createdAt;
    private List<OrderItemDTO> items;
}

@Data
class OrderItemDTO {
    private String movieName;
    private String showTime;
    private String seatNumbers;
    private Integer quantity;
    private BigDecimal totalPrice;
}