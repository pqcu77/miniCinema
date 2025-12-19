package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 电影场次信息（按影院分组）
 */
@Data
public class MovieScreeningDTO {
    private Integer movieId;
    private String movieTitle;
    private String posterUrl;
    private Integer duration; // 电影时长（分钟）
    private List<CinemaScreeningGroup> cinemas; // 各影院的场次

    @Data
    public static class CinemaScreeningGroup {
        private Integer cinemaId;
        private String cinemaName;
        private String address;
        private Double distance; // 距离用户的距离（可选）
        private List<ScreeningItem> screenings; // 该影院的场次列表
    }

    @Data
    public static class ScreeningItem {
        private Integer screeningId;
        private Integer hallId;
        private String hallName;
        private LocalDateTime screenTime;
        private BigDecimal price;
        private String videoType; // 2D, 3D, IMAX
        private Integer availableSeats; // 剩余座位数
        private String status; // 可售、即将开场、已开场、已结束
    }
}