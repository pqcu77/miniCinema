package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Cinema;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CinemaMapper {

    /**
     * 查询所有影院
     */
    @Select("SELECT * FROM cinemas ORDER BY cinema_id")
    List<Cinema> selectAll();

    /**
     * 根据ID查询影院
     */
    @Select("SELECT * FROM cinemas WHERE cinema_id = #{cinemaId}")
    Cinema selectById(Integer cinemaId);

    /**
     * 根据城市查询影院
     */
    @Select("SELECT * FROM cinemas WHERE city = #{city} ORDER BY name")
    List<Cinema> selectByCity(String city);

    /**
     * 根据城市和区域查询影院
     */
    @Select("SELECT * FROM cinemas WHERE city = #{city} AND district = #{district} ORDER BY name")
    List<Cinema> selectByCityAndDistrict(@Param("city") String city, @Param("district") String district);

    /**
     * 模糊搜索影院（按名称或地址）
     */
    @Select("SELECT * FROM cinemas WHERE name LIKE CONCAT('%', #{keyword}, '%') " +
            "OR address LIKE CONCAT('%', #{keyword}, '%') ORDER BY name")
    List<Cinema> searchByKeyword(String keyword);

    /**
     * 获取所有城市列表（去重）
     */
    @Select("SELECT DISTINCT city FROM cinemas WHERE city IS NOT NULL ORDER BY city")
    List<String> selectAllCities();
}
