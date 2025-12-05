package com.cinema.minicinema.entity;

import lombok.Data;

@Data
public class Ticket {
    private Long id;
    private Long orderId;              // 订单ID
    private Long orderItemId;          // 订单项ID
    private Long screeningId;          // 场次ID
    private String seatNumber;         // 座位号
    private String ticketCode;         // 票务码（二维码内容）
    private Integer status;            // 状态: 0-未核销 1-已核销
    private String movieName;          // 电影名称
    private String cinemaName;         // 影院名称
    private String hallName;           // 影厅名称
    private String showTime;           // 放映时间
    private Long createdAt;
    private Long verifiedAt;           // 核销时间
}