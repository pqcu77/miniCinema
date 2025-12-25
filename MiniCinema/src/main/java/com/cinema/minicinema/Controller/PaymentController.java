package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.PaymentService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.PaymentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    
    // 发起支付
    @PostMapping("/initiate")
    public Result initiatePayment(@RequestParam Long orderId,
                                 @RequestParam String paymentMethod) {
        PaymentDTO paymentDTO = paymentService.initiatePayment(orderId, paymentMethod);
        return Result.success(paymentDTO);
    }
    
    // 验证支付结果
    @PostMapping("/verify")
    public Result verifyPayment(@RequestParam String transactionId) {
        paymentService.verifyPayment(transactionId);
        return Result.success("支付成功");
    }
    
    // 获取支付状态
    @GetMapping("/status")
    public Result getPaymentStatus(@RequestParam String orderNumber) {
        PaymentDTO paymentDTO = paymentService.getPaymentStatus(orderNumber);
        return Result.success(paymentDTO);
    }
}