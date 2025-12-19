package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.CinemaDTO;
import com.cinema.minicinema.dto.CinemaDetailDTO;
import com.cinema.minicinema.entity.Hall;

import java.util.List;

public interface CinemaService {

    /**
     * 获取所有影院列表
     */
    List<CinemaDTO> getAllCinemas();

    /**
     * 根据城市获取影院列表
     */
    List<CinemaDTO> getCinemasByCity(String city);

    /**
     * 根据城市和区域获取影院列表
     */
    List<CinemaDTO> getCinemasByCityAndDistrict(String city, String district);

    /**
     * 根据ID获取影院详情（含影厅信息）
     */
    CinemaDetailDTO getCinemaDetail(Integer cinemaId);

    /**
     * 搜索影院
     */
    List<CinemaDTO> searchCinemas(String keyword);

    /**
     * 获取所有城市列表
     */
    List<String> getAllCities();

    /**
     * 根据影院ID获取影厅列表
     */
    List<Hall> getHallsByCinemaId(Integer cinemaId);
}