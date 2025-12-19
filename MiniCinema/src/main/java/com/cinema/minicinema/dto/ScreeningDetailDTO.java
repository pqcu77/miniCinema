package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 场次详细信息
 */
@Data
public class ScreeningDetailDTO {
    // 场次信息
    private Integer screeningId;
    private LocalDateTime screenTime;
    private BigDecimal price;
    private String videoType;
    private Integer availableSeats;

    // 电影信息
    private Integer movieId;
    private String movieTitle;
    private String posterUrl;
    private Integer duration;
    private String genre;
    private String director;
    private String actors;
    private String description;

    // 影院信息
    private Integer cinemaId;
    private String cinemaName;
    private String address;

    // 影厅信息
    private Integer hallId;
    private String hallName;
    private Integer totalSeats;
}