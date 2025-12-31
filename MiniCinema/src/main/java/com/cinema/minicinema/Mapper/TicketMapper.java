/* package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Ticket;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Map;

@Mapper
public interface TicketMapper {
    
    // 批量创建电子票
    @Insert("""
        INSERT INTO ticket (order_id, screening_id, seat_number, ticket_code, 
                           movie_name, cinema_name, hall_name, show_time, status)
        VALUES (#{orderId}, #{screeningId}, #{seatNumber}, #{ticketCode}, 
                #{movieName}, #{cinemaName}, #{hallName}, #{showTime}, #{status})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "ticketId")
    int insert(Ticket ticket);

    // 查询用户的所有票
    @Select("""
        SELECT * FROM ticket 
        WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = #{userId}) 
        ORDER BY created_at DESC
    """)
    List<Ticket> selectByUserId(Long userId);

    // 查询票详情
    @Select("SELECT * FROM ticket WHERE ticket_code = #{ticketCode}")
    Ticket selectByTicketCode(String ticketCode);

    // 核销票
    @Update("UPDATE ticket SET status = 1, verified_at = NOW() WHERE ticket_id = #{ticketId}")
    int verifyTicket(Long ticketId);

    // 按订单查询票
    @Select("SELECT * FROM ticket WHERE order_id = #{orderId}")
    List<Ticket> selectByOrderId(Long orderId);

    // 【新增】根据 screening_id 查询电影、影院、影厅信息
    @Select("""
        SELECT 
            m.title as movie_name,
            c.name as cinema_name,
            h.hall_name
        FROM screenings s
        LEFT JOIN movies m ON s.movie_id = m.movie_id
        LEFT JOIN cinemas c ON s.cinema_id = c.cinema_id
        LEFT JOIN halls h ON s.hall_id = h.hall_id
        WHERE s.screening_id = #{screeningId}
    """)
    Map<String, String> getScreeningInfo(Integer screeningId);
} */

package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.dto.TicketDTO;
import com.cinema.minicinema.entity.Ticket;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TicketMapper {
    
    @Insert("""
        INSERT INTO ticket (order_id, screening_id, seat_number, ticket_code, 
                           movie_name, cinema_name, hall_name, show_time, status, created_at)
        VALUES (#{orderId}, #{screeningId}, #{seatNumber}, #{ticketCode},
                #{movieName}, #{cinemaName}, #{hallName}, #{showTime}, #{status}, #{createdAt})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "ticketId")
    int insert(Ticket ticket);
    
    @Select("""
        SELECT t.ticket_id as ticketId, t.order_id as orderId, t.screening_id as screeningId,
               t.seat_number as seatNumber, t.ticket_code as ticketCode,
               t.movie_name as movieName, t.cinema_name as cinemaName, t.hall_name as hallName,
               t.show_time as showTime, t.status, t.created_at as createdAt, t.verified_at as verifiedAt
        FROM ticket t
        INNER JOIN orders o ON t.order_id = o.order_id
        WHERE o.user_id = #{userId}
        ORDER BY t.created_at DESC
    """)
    List<TicketDTO> selectByUserId(Long userId);
    
    @Select("""
        SELECT ticket_id as ticketId, order_id as orderId, screening_id as screeningId,
               seat_number as seatNumber, ticket_code as ticketCode,
               movie_name as movieName, cinema_name as cinemaName, hall_name as hallName,
               show_time as showTime, status, created_at as createdAt, verified_at as verifiedAt
        FROM ticket WHERE ticket_code = #{ticketCode}
    """)
    TicketDTO selectByTicketCode(String ticketCode);
    
    @Select("SELECT * FROM ticket WHERE ticket_code = #{ticketCode}")
    Ticket selectEntityByTicketCode(String ticketCode);
    
    @Update("UPDATE ticket SET status = #{status}, verified_at = #{verifiedAt} WHERE ticket_id = #{ticketId}")
    int updateStatus(@Param("ticketId") Long ticketId, @Param("status") Integer status, @Param("verifiedAt") LocalDateTime verifiedAt);
}