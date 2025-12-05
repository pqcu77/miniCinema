package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.OrderMapper;
import com.cinema.minicinema.Service.PaymentService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.dto.PaymentDTO;
import com.cinema.minicinema.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private OrderMapper orderMapper;
    
    @Override
    public PaymentDTO initiatePayment(Long orderId, String paymentMethod) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        if (!"0".equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许支付");
        }
        
        if (!"alipay".equals(paymentMethod) && !"wechat".equals(paymentMethod)) {
            throw new BusinessException("不支持的支付方式");
        }
        
        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setOrderId(orderId);
        paymentDTO.setOrderNumber(order.getOrderNumber());
        paymentDTO.setAmount(order.getTotalAmount());
        paymentDTO.setPaymentMethod(paymentMethod);
        paymentDTO.setPaymentStatus("pending");
        
        // TODO: 调用第三方支付接口（支付宝/微信）
        // 这里仅做示例，实际需要集成支付宝或微信支付SDK
        if ("alipay".equals(paymentDTO.getPaymentMethod())) {
            // 调用支付宝支付接口
        } else if ("wechat".equals(paymentDTO.getPaymentMethod())) {
            // 调用微信支付接口
        }
        
        return paymentDTO;
    }
    
    @Override
    @Transactional
    public void verifyPayment(String transactionId) {
        // TODO: 验证支付结果
        // 查询支付宝或微信的订单状态
        // 如果支付成功，更新订单状态为已支付(1)
    }
    
    @Override
    public PaymentDTO getPaymentStatus(String orderNumber) {
        Order order = orderMapper.selectByOrderNumber(orderNumber);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setOrderNumber(order.getOrderNumber());
        paymentDTO.setAmount(order.getTotalAmount());
        paymentDTO.setPaymentStatus("1".equals(order.getStatus()) ? "success" : "pending");

        return paymentDTO;
    }
}