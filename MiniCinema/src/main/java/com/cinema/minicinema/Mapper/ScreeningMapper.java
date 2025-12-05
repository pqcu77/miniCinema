package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Screening;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ScreeningMapper {
    // 查询场次
    @Select("SELECT * FROM screening WHERE id = #{id}")
    Screening selectById(Long id);
    
    // 查询电影的所有场次
    @Select("SELECT * FROM screening WHERE movie_id = #{movieId} AND show_time > NOW() ORDER BY show_time")
    List<Screening> selectByMovieId(Long movieId);
    
    // 查询已售座位
    @Select("SELECT seat_numbers FROM order_item WHERE screening_id = #{screeningId}")
    List<String> selectSoldSeats(Long screeningId);
}