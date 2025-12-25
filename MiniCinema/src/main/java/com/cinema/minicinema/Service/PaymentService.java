package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.PaymentDTO;

public interface PaymentService {
    // 发起支付
    PaymentDTO initiatePayment(Long orderId, String paymentMethod);
    
    // 验证支付结果
    void verifyPayment(String transactionId);
    
    // 获取支付状态
    PaymentDTO getPaymentStatus(String orderNumber);
}