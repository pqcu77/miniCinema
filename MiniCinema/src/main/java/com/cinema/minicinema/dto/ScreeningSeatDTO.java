package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 场次+座位完整信息
 */
@Data
public class ScreeningSeatDTO {
    // 场次信息
    private Integer screeningId;
    private String movieTitle;
    private String cinemaName;
    private String hallName;
    private LocalDateTime screenTime;
    private BigDecimal price;
    private String videoType;
    private Integer availableSeats;

    // 座位布局
    private Integer totalRows;
    private Integer seatsPerRow;
    private List<SeatStatusDTO> seats;
}