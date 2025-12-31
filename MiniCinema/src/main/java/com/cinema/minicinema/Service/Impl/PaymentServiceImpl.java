package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.OrderMapper;
import com.cinema.minicinema.Mapper.PaymentMapper;
import com.cinema.minicinema.Mapper.UserMapper;
import com.cinema.minicinema.Service.PaymentService;
import com.cinema.minicinema.Service.TicketService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.dto.PaymentDTO;
import com.cinema.minicinema.entity.Order;
import com.cinema.minicinema.entity.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private PaymentMapper paymentMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private TicketService ticketService;
    
    @Override
    @Transactional
    public PaymentDTO initiatePayment(Long orderId, String paymentMethod) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        if (!"pending".equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许支付");
        }
        
        // ✅ 只支持 alipay 和 wechat（删除了 balance）
        if (!"alipay".equals(paymentMethod) && !"wechat".equals(paymentMethod)) {
            throw new BusinessException("不支持的支付方式");
        }
        
        // ✅ 生成交易号
        String transactionId = "TRX" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8);
        
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setTransactionId(transactionId);
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus("pending");
        paymentMapper.insert(payment);
        
        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setOrderId(orderId);
        paymentDTO.setOrderNumber(order.getOrderNumber());
        paymentDTO.setAmount(order.getTotalAmount());
        paymentDTO.setPaymentMethod(paymentMethod);
        paymentDTO.setPaymentStatus("pending");
        paymentDTO.setTransactionId(transactionId);
        
        return paymentDTO;
    }
    
    @Override
    @Transactional
    public void verifyPayment(String transactionId) {
        // 1. 查询支付记录
        Payment payment = paymentMapper.selectByTransactionId(transactionId);
        if (payment == null) {
            throw new RuntimeException("支付记录不存在");
        }
        
        // 2. 检查支付状态
        if (!"pending".equals(payment.getStatus())) {
            throw new RuntimeException("支付已处理，请勿重复操作");
        }

        // 3. 更新支付状态为成功
        paymentMapper.updateStatus(payment.getPaymentId(), "success");

        // 4. 更新订单状态为已支付
        Order order = orderMapper.selectById(payment.getOrderId());
        if (order != null) {
            order.setStatus("paid");
            order.setPayTime(LocalDateTime.now());
            orderMapper.updatePayTime(order.getOrderId(), "paid");
            
            // 5. 支付成功后，自动生成电子票
            ticketService.generateTickets(order.getOrderId());
        }
    }
    
    @Override
    public PaymentDTO getPaymentStatus(String orderNumber) {
        Order order = orderMapper.selectByOrderNumber(orderNumber);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        Payment payment = paymentMapper.selectByOrderId(order.getOrderId());
        if (payment == null) {
            throw new BusinessException("支付记录不存在");
        }
        
        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setOrderId(order.getOrderId());
        paymentDTO.setOrderNumber(order.getOrderNumber());
        paymentDTO.setAmount(order.getTotalAmount());
        paymentDTO.setPaymentMethod(payment.getPaymentMethod());
        paymentDTO.setTransactionId(payment.getTransactionId());
        paymentDTO.setPaymentStatus("success".equals(payment.getStatus()) ? "已支付" : "待支付");
        
        return paymentDTO;
    }
}