package com.cinema.minicinema.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Ticket {
    private Long ticketId;          // ticket_id
    private Long orderId;           // order_id
    private Integer screeningId;       // screening_id
    private String seatNumber;      // seat_number
    private String ticketCode;      // ticket_code（二维码）
    private String movieName;       // movie_name
    private String cinemaName;      // cinema_name
    private String hallName;        // hall_name
    private LocalDateTime showTime; // show_time
    private Integer status;         // status: 0-未核销 1-已核销
    private LocalDateTime createdAt;   // created_at
    private LocalDateTime verifiedAt;  // verified_at
}