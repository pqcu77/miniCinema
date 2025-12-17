package com.cinema.minicinema.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

/**
 * 影院排期（某影院在某日的所有场次）
 */
@Data
public class CinemaScheduleDTO {
    private Integer cinemaId;
    private String cinemaName;
    private LocalDate scheduleDate;
    private List<MovieScheduleGroup> movies; // 按电影分组

    @Data
    public static class MovieScheduleGroup {
        private Integer movieId;
        private String movieTitle;
        private String posterUrl;
        private List<MovieScreeningDTO.ScreeningItem> screenings;
    }
}