package com.cinema.minicinema.dto;

import lombok.Data;

@Data
public class TicketDTO {
    private Long ticketId;
    private String ticketCode;        // 二维码内容
    private String movieName;
    private String cinemaName;
    private String hallName;
    private String seatNumber;
    private String showTime;
    private Integer status;           // 0-未核销 1-已核销
    private String statusText;        // "已出票" / "已核销"
    private Long createdAt;
}