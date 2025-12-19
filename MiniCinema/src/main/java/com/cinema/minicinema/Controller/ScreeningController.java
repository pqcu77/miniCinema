package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.ScreeningQueryService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/screenings")
@Slf4j
public class ScreeningController {

    @Autowired
    private ScreeningQueryService screeningQueryService;

    /**
     * 查询某电影的所有场次（按影院分组）
     * GET /screenings/movie/1?startDate=2025-12-18&endDate=2025-12-25
     */
    @GetMapping("/movie/{movieId}")
    public Result<MovieScreeningDTO> getMovieScreenings(
            @PathVariable Integer movieId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        MovieScreeningDTO screenings = screeningQueryService.getMovieScreenings(movieId, startDate, endDate);
        return Result.success(screenings);
    }

    /**
     * 查询场次详细信息
     * GET /screenings/1
     */
    @GetMapping("/{screeningId}")
    public Result<ScreeningDetailDTO> getScreeningDetail(@PathVariable Integer screeningId) {
        ScreeningDetailDTO detail = screeningQueryService.getScreeningDetail(screeningId);
        return Result.success(detail);
    }

    /**
     * 查询某影院在某日的排期
     * GET /screenings/cinema/1?date=2025-12-18
     */
    @GetMapping("/cinema/{cinemaId}")
    public Result<CinemaScheduleDTO> getCinemaSchedule(
            @PathVariable Integer cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        CinemaScheduleDTO schedule = screeningQueryService.getCinemaSchedule(cinemaId, date);
        return Result.success(schedule);
    }
}