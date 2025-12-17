package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.*;
import java.time.LocalDate;

public interface ScreeningQueryService {

    /**
     * 查询某电影的所有场次（按影院分组）
     */
    MovieScreeningDTO getMovieScreenings(Integer movieId, LocalDate startDate, LocalDate endDate);

    /**
     * 查询场次详细信息
     */
    ScreeningDetailDTO getScreeningDetail(Integer screeningId);

    /**
     * 查询某影院在某日的排期
     */
    CinemaScheduleDTO getCinemaSchedule(Integer cinemaId, LocalDate scheduleDate);
}