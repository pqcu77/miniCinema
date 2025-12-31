package com.cinema.minicinema.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Payment {
    private Long paymentId;
    private Long orderId;
    private String transactionId;      // 交易号
    private String paymentMethod;      // alipay|wechat
    private BigDecimal amount;
    private String status;             // pending|success|failed
    private LocalDateTime createTime;
    private LocalDateTime payTime;
}