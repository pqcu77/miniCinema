package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.CinemaMapper;
import com.cinema.minicinema.Mapper.MovieMapper;
import com.cinema.minicinema.Mapper.ScreeningMapper;
import com.cinema.minicinema.Service.ScreeningQueryService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.dto.*;
import com.cinema.minicinema.entity.Cinema;
import com.cinema.minicinema.entity.Movie;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ScreeningQueryServiceImpl implements ScreeningQueryService {

    @Autowired
    private ScreeningMapper screeningMapper;

    @Autowired
    private MovieMapper movieMapper;

    @Autowired
    private CinemaMapper cinemaMapper;

    @Override
    public MovieScreeningDTO getMovieScreenings(Integer movieId, LocalDate startDate, LocalDate endDate) {
        log.info("查询电影 {} 的场次，日期范围：{} 到 {}", movieId, startDate, endDate);

        // 查询电影信息
        Movie movie = movieMapper.selectById(movieId.longValue()); // ✅ 转换为 Long
        if (movie == null) {
            throw new BusinessException("电影不存在");
        }

        // 如果没有指定日期，默认查询未来7天
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = startDate.plusDays(7);
        }

        // 查询有该电影场次的所有影院
        List<ScreeningMapper.CinemaInfo> cinemaInfos = screeningMapper.selectCinemasByMovieId(movieId, startDate,
                endDate);

        // ✅ 转换为 CinemaScreeningGroup
        List<MovieScreeningDTO.CinemaScreeningGroup> cinemas = new ArrayList<>();
        for (ScreeningMapper.CinemaInfo info : cinemaInfos) {
            MovieScreeningDTO.CinemaScreeningGroup group = new MovieScreeningDTO.CinemaScreeningGroup();
            group.setCinemaId(info.getCinemaId());
            group.setCinemaName(info.getCinemaName());
            group.setAddress(info.getAddress());

            // 查询该影院的场次
            List<ScreeningMapper.ScreeningItem> items = screeningMapper.selectByMovieIdAndCinema(
                    movieId, info.getCinemaId(), startDate, endDate);

            // 转换为 DTO
            List<MovieScreeningDTO.ScreeningItem> screenings = new ArrayList<>();
            for (ScreeningMapper.ScreeningItem item : items) {
                MovieScreeningDTO.ScreeningItem screening = new MovieScreeningDTO.ScreeningItem();
                BeanUtils.copyProperties(item, screening);
                screenings.add(screening);
            }

            group.setScreenings(screenings);
            cinemas.add(group);
        }

        // 组装返回对象
        MovieScreeningDTO result = new MovieScreeningDTO();
        result.setMovieId(movie.getMovieId());
        result.setMovieTitle(movie.getTitle());
        result.setPosterUrl(movie.getPosterUrl());
        result.setDuration(movie.getDuration());
        result.setCinemas(cinemas);

        log.info("查询到 {} 个影院有该电影的场次", cinemas.size());
        return result;
    }

    @Override
    public ScreeningDetailDTO getScreeningDetail(Integer screeningId) {
        log.info("查询场次详情：{}", screeningId);

        // ScreeningMapper.ScreeningDetailVO vo =
        // screeningMapper.selectDetailById(screeningId);
        // if (vo == null) {
        // throw new BusinessException("场次不存在");
        // }

        // // ✅ 转换为 DTO
        // ScreeningDetailDTO detail = new ScreeningDetailDTO();
        // BeanUtils.copyProperties(vo, detail);

        // // 补充电影的详细信息
        // Movie movie = movieMapper.selectById(vo.getMovieId().longValue());
        // if (movie != null) {
        // detail.setGenre(movie.getGenre());
        // detail.setDirector(movie.getDirector());
        // detail.setActors(movie.getActors());
        // detail.setDescription(movie.getDescription());
        // }
        // ✅ 修改这里：直接返回 ScreeningDetailDTO，不需要转换
        ScreeningDetailDTO detail = screeningMapper.selectDetailById(screeningId);
        if (detail == null) {
            throw new BusinessException("场次不存在");
        }

        // ✅ 不需要再 BeanUtils.copyProperties，因为 XML 已经返回完整的 DTO
        // 所有字段（包括电影信息）都已经在 SQL 中 JOIN 查询出来了

        return detail;
    }

    @Override
    public CinemaScheduleDTO getCinemaSchedule(Integer cinemaId, LocalDate scheduleDate) {
        log.info("查询影院 {} 在 {} 的排期", cinemaId, scheduleDate);

        if (scheduleDate == null) {
            scheduleDate = LocalDate.now();
        }
        // ✅ 添加：查询影院信息
        Cinema cinema = cinemaMapper.selectById(cinemaId);
        if (cinema == null) {
            throw new BusinessException("影院不存在");
        }

        // 查询该影院当天的所有场次
        List<ScreeningMapper.ScreeningItem> allScreenings = screeningMapper.selectByCinemaAndDate(cinemaId,
                scheduleDate);

        // 按电影分组
        List<CinemaScheduleDTO.MovieScheduleGroup> movies = allScreenings.stream()
                .collect(Collectors.groupingBy(ScreeningMapper.ScreeningItem::getMovieId))
                .entrySet().stream()
                .map(entry -> {
                    CinemaScheduleDTO.MovieScheduleGroup group = new CinemaScheduleDTO.MovieScheduleGroup();

                    // 获取电影信息
                    Movie movie = movieMapper.selectById(entry.getKey().longValue());
                    if (movie != null) {
                        group.setMovieId(movie.getMovieId());
                        group.setMovieTitle(movie.getTitle());
                        group.setPosterUrl(movie.getPosterUrl());
                    }

                    // 转换场次列表
                    List<MovieScreeningDTO.ScreeningItem> screenings = entry.getValue().stream()
                            .map(item -> {
                                MovieScreeningDTO.ScreeningItem screening = new MovieScreeningDTO.ScreeningItem();
                                BeanUtils.copyProperties(item, screening);
                                return screening;
                            })
                            .collect(Collectors.toList());

                    group.setScreenings(screenings);
                    return group;
                })
                .collect(Collectors.toList());

        // 组装返回对象
        CinemaScheduleDTO result = new CinemaScheduleDTO();
        result.setCinemaId(cinemaId);
        result.setCinemaName(cinema.getName());
        result.setScheduleDate(scheduleDate);
        result.setMovies(movies);

        return result;
    }
}