package com.cinema.minicinema.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketDTO {
    private Long ticketId;
    private String ticketCode;        // 二维码内容
    private Long orderId;             // 添加这个字段
    private Integer screeningId;
    private String movieName;
    private String cinemaName;
    private String hallName;
    private String seatNumber;
    private LocalDateTime showTime;
    private Integer status;           // 0-未核销 1-已核销
    private String statusText;        // "已出票" / "已核销"
    private LocalDateTime createdAt;  // 改成 LocalDateTime，对应数据库的 TIMESTAMP
    private LocalDateTime verifiedAt;
}