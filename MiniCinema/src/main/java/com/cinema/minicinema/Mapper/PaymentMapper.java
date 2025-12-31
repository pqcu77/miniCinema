package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Payment;
import org.apache.ibatis.annotations.*;

@Mapper
public interface PaymentMapper {
    
    // 创建支付记录
    @Insert("""
        INSERT INTO payments (order_id, transaction_id, payment_method, amount, status)
        VALUES (#{orderId}, #{transactionId}, #{paymentMethod}, #{amount}, #{status})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "paymentId")
    int insert(Payment payment);

    // 查询支付记录
    @Select("SELECT * FROM payments WHERE transaction_id = #{transactionId}")
    Payment selectByTransactionId(String transactionId);

    // 查询订单的支付记录
    @Select("SELECT * FROM payments WHERE order_id = #{orderId}")
    Payment selectByOrderId(Long orderId);

    // 更新支付状态
    @Update("UPDATE payments SET status = #{status}, pay_time = NOW() WHERE payment_id = #{paymentId}")
    int updateStatus(Long paymentId, String status);
}