package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Ticket;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TicketMapper {
    // 查询用户的票
    @Select("SELECT * FROM ticket WHERE order_id IN " +
            "(SELECT id FROM `order` WHERE user_id = #{userId}) ORDER BY created_at DESC")
    List<Ticket> selectByUserId(Long userId);
    
    // 根据票务码查询
    @Select("SELECT * FROM ticket WHERE ticket_code = #{ticketCode}")
    Ticket selectByTicketCode(String ticketCode);
    
    // 创建票
    @Insert("INSERT INTO ticket (order_id, order_item_id, screening_id, seat_number, ticket_code, " +
            "status, movie_name, cinema_name, hall_name, show_time, created_at) " +
            "VALUES (#{orderId}, #{orderItemId}, #{screeningId}, #{seatNumber}, #{ticketCode}, " +
            "#{status}, #{movieName}, #{cinemaName}, #{hallName}, #{showTime}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Ticket ticket);
    
    // 核销票
    @Update("UPDATE ticket SET status = 1, verified_at = #{verifiedAt} WHERE id = #{id}")
    int verify(Long id, Long verifiedAt);
}