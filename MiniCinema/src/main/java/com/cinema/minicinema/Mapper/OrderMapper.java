package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Order;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface OrderMapper {
    // 查询订单
    @Select("SELECT * FROM `order` WHERE id = #{id}")
    Order selectById(Long id);
    
    // 查询用户订单列表
    @Select("SELECT * FROM `order` WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<Order> selectByUserId(Long userId);
    
    // 创建订单
    @Insert("INSERT INTO `order` (user_id, order_number, status, total_amount, created_at) " +
            "VALUES (#{userId}, #{orderNumber}, #{status}, #{totalAmount}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Order order);
    
    // 更新订单状态
    @Update("UPDATE `order` SET status = #{status}, updated_at = #{updatedAt} WHERE id = #{id}")
    int update(Order order);
    
    // 根据订单号查询
    @Select("SELECT * FROM `order` WHERE order_number = #{orderNumber}")
    Order selectByOrderNumber(String orderNumber);
}