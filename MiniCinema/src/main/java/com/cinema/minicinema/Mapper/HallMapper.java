package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Hall;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface HallMapper {

    /**
     * 根据影院ID查询所有影厅
     */
    @Select("SELECT * FROM halls WHERE cinema_id = #{cinemaId} ORDER BY hall_name")
    @Results(id = "hallResultMap", value = {
            @Result(property = "hallId", column = "hall_id", id = true),
            @Result(property = "cinemaId", column = "cinema_id"),
            @Result(property = "name", column = "hall_name"),
            @Result(property = "capacity", column = "total_seats"),
            @Result(property = "hallType", column = "hall_type"),
            @Result(property = "facilities", column = "seat_layout"),
            @Result(property = "createTime", column = "create_time")
    })
    List<Hall> selectByCinemaId(Integer cinemaId);

    /**
     * 根据影厅ID查询详情
     */
    @Select("SELECT * FROM halls WHERE hall_id = #{hallId}")
    Hall selectById(Integer hallId);

    /**
     * 统计影院的影厅数量
     */
    @Select("SELECT COUNT(*) FROM halls WHERE cinema_id = #{cinemaId}")
    int countByCinemaId(Integer cinemaId);
}