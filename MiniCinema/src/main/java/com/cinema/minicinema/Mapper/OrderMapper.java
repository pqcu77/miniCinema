package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Order;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface OrderMapper {
    // 创建订单（不设置 order_id 和 create_time，让数据库自动生成）
    @Insert("""
        INSERT INTO orders (order_number, user_id, screening_id, seat_info, seat_count, total_amount, status)
        VALUES (#{orderNumber}, #{userId}, #{screeningId}, #{seatInfo}, #{seatCount}, #{totalAmount}, #{status})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "orderId")
    int insert(Order order);

    // 查询订单详情
    @Select("SELECT * FROM orders WHERE order_id = #{orderId}")
    Order selectById(Long orderId);

    // 查询订单详情（按 order_number） ← 新增这个方法
    @Select("SELECT * FROM orders WHERE order_number = #{orderNumber}")
    Order selectByOrderNumber(String orderNumber);

    // 查询用户的所有订单
    @Select("SELECT * FROM orders WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<Order> selectByUserId(Long userId);

    // 更新订单状态
    @Update("UPDATE orders SET status = #{status} WHERE order_id = #{orderId}")
    int updateStatus(Long orderId, String status);

    // 更新订单支付时间
    @Update("UPDATE orders SET status = #{status}, pay_time = NOW() WHERE order_id = #{orderId}")
    int updatePayTime(Long orderId, String status);

    // 取消订单
    @Update("UPDATE orders SET status = 'cancelled' WHERE order_id = #{orderId}")
    int cancelOrder(Long orderId);

    // 删除订单（谨慎使用）
    @Delete("DELETE FROM orders WHERE order_id = #{orderId}")
    int delete(Long orderId);
}