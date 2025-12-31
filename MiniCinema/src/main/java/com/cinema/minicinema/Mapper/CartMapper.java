package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Cart;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface CartMapper {
/*     // 查询用户购物车
    @Select("SELECT * FROM cart WHERE user_id = #{userId}")
    List<Cart> selectByUserId(Long userId);
    
    // 查询购物车项
    @Select("SELECT * FROM cart WHERE id = #{id}")
    Cart selectById(Long id); */
    
    @Select("""
        SELECT 
            c.id as id,
            c.user_id as userId,
            c.screening_id as screeningId,
            c.seat_numbers as seatNumbers,
            c.quantity,
            c.price,
            c.total_price as totalPrice,
            c.movie_name as movieName,
            c.movie_poster as moviePoster,
            c.cinema_name as cinemaName,
            c.hall_name as hallName,
            c.show_time as showTime,
            c.created_at as createdAt,
            c.updated_at as updatedAt
        FROM cart c
        WHERE c.user_id = #{userId}
        ORDER BY c.created_at DESC
    """)
    List<Cart> selectByUserId(Long userId);
    
    @Select("""
        SELECT 
            c.id as id,
            c.user_id as userId,
            c.screening_id as screeningId,
            c.seat_numbers as seatNumbers,
            c.quantity,
            c.price,
            c.total_price as totalPrice,
            c.movie_name as movieName,
            c.movie_poster as moviePoster,
            c.cinema_name as cinemaName,
            c.hall_name as hallName,
            c.show_time as showTime,
            c.created_at as createdAt,
            c.updated_at as updatedAt
        FROM cart c
        WHERE c.id = #{id}
    """)
    Cart selectById(Long id);

    // ✅ 添加到购物车 - 包含所有字段
    @Insert("INSERT INTO cart (user_id, screening_id, seat_numbers, quantity, price, total_price, " +
            "movie_name, movie_poster, cinema_name, hall_name, show_time, created_at, updated_at) " +
            "VALUES (#{userId}, #{screeningId}, #{seatNumbers}, #{quantity}, #{price}, #{totalPrice}, " +
            "#{movieName}, #{moviePoster}, #{cinemaName}, #{hallName}, #{showTime}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Cart cart);
    
    // 更新购物车
    @Update("UPDATE cart SET seat_numbers = #{seatNumbers}, quantity = #{quantity}, " +
        "total_price = #{totalPrice}, updated_at = #{updatedAt} WHERE id = #{id}")
    int update(Cart cart);
    
    // 删除购物车项
    @Delete("DELETE FROM cart WHERE id = #{id}")
    int delete(Long id);
    
    // 清空用户购物车
    @Delete("DELETE FROM cart WHERE user_id = #{userId}")
    int deleteByUserId(Long userId);
}