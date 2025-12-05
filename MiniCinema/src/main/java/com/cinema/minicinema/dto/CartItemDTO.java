package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDTO {
    private Long cartId;
    private Long screeningId;
    private String movieName;
    private String showTime;
    private String seatNumbers;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalPrice;
}