package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Cart;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface CartMapper {
    // 查询用户购物车
    @Select("SELECT * FROM cart WHERE user_id = #{userId}")
    List<Cart> selectByUserId(Long userId);
    
    // 查询购物车项
    @Select("SELECT * FROM cart WHERE id = #{id}")
    Cart selectById(Long id);
    
    // 添加到购物车
    @Insert("INSERT INTO cart (user_id, screening_id, seat_numbers, quantity, price, total_price) " +
            "VALUES (#{userId}, #{screeningId}, #{seatNumbers}, #{quantity}, #{price}, #{totalPrice})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Cart cart);
    
    // 更新购物车
    @Update("UPDATE cart SET seat_numbers = #{seatNumbers}, quantity = #{quantity}, " +
            "total_price = #{totalPrice} WHERE id = #{id}")
    int update(Cart cart);
    
    // 删除购物车项
    @Delete("DELETE FROM cart WHERE id = #{id}")
    int delete(Long id);
    
    // 清空用户购物车
    @Delete("DELETE FROM cart WHERE user_id = #{userId}")
    int deleteByUserId(Long userId);
}