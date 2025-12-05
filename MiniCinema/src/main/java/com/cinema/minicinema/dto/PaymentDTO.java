package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentDTO {
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String paymentMethod;     // 支付方式: alipay(支付宝) wechat(微信) card(银行卡)
    private String paymentStatus;     // 支付状态: pending(待支付) success(成功) failed(失败)
    private String transactionId;     // 交易ID
}