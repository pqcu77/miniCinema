package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Seat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SeatMapper {

    // 只保留方法签名，删除 @Select 注解
    List<Seat> selectByHallId(@Param("hallId") Integer hallId);

    // 只保留方法签名，删除 @Select 注解
    List<Seat> selectByIds(@Param("seatIds") List<Integer> seatIds);

    // 只保留方法签名，删除 @Select 注解
    Seat selectById(@Param("seatId") Integer seatId);
}