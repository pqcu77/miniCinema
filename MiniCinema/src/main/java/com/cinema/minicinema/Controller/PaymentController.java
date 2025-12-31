package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.PaymentService;
import com.cinema.minicinema.dto.PaymentDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    
    /**
     * 发起支付
     */
    @PostMapping("/initiate")
    public Map<String, Object> initiatePayment(@RequestBody PaymentDTO paymentDTO) {
        log.info("发起支付: orderId={}, paymentMethod={}, amount={}", 
                paymentDTO.getOrderId(), paymentDTO.getPaymentMethod(), paymentDTO.getAmount());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // ✅ 调用服务层发起支付
            PaymentDTO result = paymentService.initiatePayment(
                paymentDTO.getOrderId(), 
                paymentDTO.getPaymentMethod()
            );
            
            log.info("✅ 支付创建成功: transactionId={}", result.getTransactionId());
            
            response.put("code", 1);
            response.put("msg", "支付创建成功");
            response.put("data", result);
            return response;
        } catch (RuntimeException e) {
            log.error("❌ 发起支付失败:", e);
            
            response.put("code", 0);
            response.put("msg", e.getMessage() != null ? e.getMessage() : "发起支付失败");
            return response;
        } catch (Exception e) {
            log.error("❌ 支付处理异常:", e);
            
            response.put("code", 0);
            response.put("msg", "支付处理失败");
            return response;
        }
    }

    /**
     * 验证支付
     */
    @PostMapping("/verify")
    public Map<String, Object> verifyPayment(@RequestBody PaymentDTO paymentDTO) {
        log.info("验证支付: orderId={}, transactionId={}", 
                paymentDTO.getOrderId(), paymentDTO.getTransactionId());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // ✅ 调用服务层验证支付
            paymentService.verifyPayment(paymentDTO.getTransactionId());
            
            log.info("✅ 支付验证成功");
            
            // ✅ 再次查询支付状态返回给前端
            PaymentDTO result = paymentService.getPaymentStatus(paymentDTO.getOrderNumber());
            
            response.put("code", 1);
            response.put("msg", "支付成功");
            response.put("data", result);
            return response;
        } catch (RuntimeException e) {
            log.error("❌ 支付验证失败:", e);
            
            response.put("code", 0);
            response.put("msg", e.getMessage() != null ? e.getMessage() : "支付验证失败");
            return response;
        } catch (Exception e) {
            log.error("❌ 支付验证异常:", e);
            
            response.put("code", 0);
            response.put("msg", "支付验证失败");
            return response;
        }
    }
    
    /**
     * 获取支付状态
     */
    @GetMapping("/status/{orderNumber}")
    public Map<String, Object> getPaymentStatus(@PathVariable String orderNumber) {
        log.info("获取支付状态: orderNumber={}", orderNumber);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            PaymentDTO result = paymentService.getPaymentStatus(orderNumber);
            
            response.put("code", 1);
            response.put("msg", "查询成功");
            response.put("data", result);
            return response;
        } catch (Exception e) {
            log.error("❌ 查询支付状态失败:", e);
            
            response.put("code", 0);
            response.put("msg", "查询失败");
            return response;
        }
    }
}