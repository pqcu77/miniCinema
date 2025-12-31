/* package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.OrderItem;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface OrderItemMapper {
    // 查询订单项列表
    @Select("SELECT * FROM order_item WHERE order_id = #{orderId}")
    List<OrderItem> selectByOrderId(Long orderId);
    
    // 创建订单项
    @Insert("INSERT INTO order_item (order_id, screening_id, seat_numbers, quantity, price, total_price, created_at) " +
            "VALUES (#{orderId}, #{screeningId}, #{seatNumbers}, #{quantity}, #{price}, #{totalPrice}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(OrderItem orderItem);
} */

package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.OrderItem;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrderItemMapper {
    
    @Insert("""
        INSERT INTO order_item (order_id, screening_id, seat_numbers, quantity, price, total_price, created_at)
        VALUES (#{orderId}, #{screeningId}, #{seatNumbers}, #{quantity}, #{price}, #{totalPrice}, #{createdAt})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(OrderItem orderItem);
    
    @Select("SELECT * FROM order_item WHERE order_id = #{orderId}")
    List<OrderItem> selectByOrderId(Long orderId);
}