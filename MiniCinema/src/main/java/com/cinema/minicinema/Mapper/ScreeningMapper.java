package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.dto.ScreeningDetailDTO;
import lombok.Data;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import com.cinema.minicinema.dto.MovieScreeningDTO.ScreeningItem;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ScreeningMapper {

        /**
         * 查询场次详细信息（用于座位锁定）
         */
        ScreeningDetailDTO selectDetailById(@Param("screeningId") Integer screeningId);

        // ========== 新增方法 ==========

        /**
         * 查询某电影的所有场次
         */
        List<ScreeningItem> selectByMovieIdAndCinema(@Param("movieId") Integer movieId,
                        @Param("cinemaId") Integer cinemaId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * 查询某电影在各影院的场次（用于分组）
         */
        @Select("SELECT DISTINCT " +
                        "s.cinema_id, " +
                        "c.name AS cinema_name, " +
                        "c.address " +
                        "FROM screenings s " +
                        "LEFT JOIN cinemas c ON s.cinema_id = c.cinema_id " +
                        "WHERE s.movie_id = #{movieId} " +
                        "AND s.screen_time::date >= #{startDate}::date " +
                        "AND s.screen_time::date <= #{endDate}::date " +
                        "ORDER BY c.name")
        List<CinemaInfo> selectCinemasByMovieId(@Param("movieId") Integer movieId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * 查询某影院在某日的所有场次
         */
        List<ScreeningItem> selectByCinemaAndDate(@Param("cinemaId") Integer cinemaId,
                        @Param("scheduleDate") LocalDate scheduleDate);

        /**
         * 场次详情 VO
         */
        @Data
        public static class ScreeningDetailVO {
                private Integer screeningId;
                private Integer movieId;
                private Integer cinemaId;
                private Integer hallId;
                private String movieTitle;
                private String cinemaName;
                private String hallName;
                private LocalDateTime screenTime;
                private BigDecimal price;
                private String videoType;
                private Integer availableSeats;
        }

        @Data
        public static class ScreeningItem {
                private Integer screeningId;
                private Integer movieId;
                private Integer cinemaId;
                private Integer hallId;
                private String hallName;
                private LocalDateTime screenTime;
                private BigDecimal price;
                private String videoType;
                private Integer availableSeats;
                private String status; // 可售、即将开场、已开场、已结束
        }

        /**
         * 影院信息 VO
         */
        @Data
        public static class CinemaInfo {
                private Integer cinemaId;
                private String cinemaName;
                private String address;
        }
}