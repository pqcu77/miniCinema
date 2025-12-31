package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDTO {
    private Long cartId;           // 购物车项 ID
    private Long screeningId;      // 场次 ID
    private String movieName;      // ✅ 电影名称
    private String moviePoster;    // ✅ 电影海报
    private String cinemaName;     // ✅ 影院名称
    private String hallName;       // ✅ 影厅名称
    private String showTime;       // 放映时间
    private String seatNumbers;    // 座位号
    private Integer quantity;      // 数量
    private BigDecimal price;      // 单价
    private BigDecimal totalPrice; // 总价
}