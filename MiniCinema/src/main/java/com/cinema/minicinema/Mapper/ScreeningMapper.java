package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Screening;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ScreeningMapper {

    /**
     * 根据ID查询场次
     */
    @Select("SELECT * FROM screenings WHERE screening_id = #{screeningId}")
    Screening selectById(Integer screeningId);

    /**
     * 查询电影的所有场次
     */
    @Select("SELECT * FROM screenings WHERE movie_id = #{movieId} " +
            "AND screen_time > NOW() ORDER BY screen_time")
    List<Screening> selectByMovieId(Integer movieId);

    /**
     * 更新剩余座位数
     */
    @Update("UPDATE screenings SET available_seats = #{availableSeats} " +
            "WHERE screening_id = #{screeningId}")
    int updateAvailableSeats(@Param("screeningId") Integer screeningId,
            @Param("availableSeats") Integer availableSeats);

    /**
     * 查询场次详细信息（含电影、影院、影厅）
     */
    @Select("SELECT s.*, m.title as movie_title, c.name as cinema_name, h.hall_name " +
            "FROM screenings s " +
            "JOIN movies m ON s.movie_id = m.movie_id " +
            "JOIN cinemas c ON s.cinema_id = c.cinema_id " +
            "JOIN halls h ON s.hall_id = h.hall_id " +
            "WHERE s.screening_id = #{screeningId}")
    @Results({
            @Result(property = "screeningId", column = "screening_id"),
            @Result(property = "movieTitle", column = "movie_title"),
            @Result(property = "cinemaName", column = "cinema_name"),
            @Result(property = "hallName", column = "hall_name")
    })
    ScreeningDetailVO selectDetailById(Integer screeningId);

    /**
     * 场次详情VO（内部类）
     */
    @lombok.Data
    class ScreeningDetailVO extends Screening {
        private String movieTitle;
        private String cinemaName;
        private String hallName;
    }
}