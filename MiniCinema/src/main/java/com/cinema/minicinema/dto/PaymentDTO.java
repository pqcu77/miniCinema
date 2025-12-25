package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentDTO {
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String paymentMethod;      // alipay|wechat
    private String transactionId;      // 交易号
    private String paymentStatus;      // pending|success|failed
}