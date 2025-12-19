package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.CinemaService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.CinemaDTO;
import com.cinema.minicinema.dto.CinemaDetailDTO;
import com.cinema.minicinema.entity.Hall;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cinemas")
public class CinemaController {

    @Autowired
    private CinemaService cinemaService;

    /**
     * 获取所有影院列表
     * GET /cinemas/list
     */
    @GetMapping("/list")
    public Result<List<CinemaDTO>> getAllCinemas() {
        List<CinemaDTO> cinemas = cinemaService.getAllCinemas();
        return Result.success(cinemas);
    }

    /**
     * 根据城市获取影院列表
     * GET /cinemas/city?city=北京
     */
    @GetMapping("/city")
    public Result<List<CinemaDTO>> getCinemasByCity(@RequestParam String city) {
        List<CinemaDTO> cinemas = cinemaService.getCinemasByCity(city);
        return Result.success(cinemas);
    }

    /**
     * 根据城市和区域获取影院列表
     * GET /cinemas/location?city=北京&district=朝阳区
     */
    @GetMapping("/location")
    public Result<List<CinemaDTO>> getCinemasByLocation(
            @RequestParam String city,
            @RequestParam String district) {
        List<CinemaDTO> cinemas = cinemaService.getCinemasByCityAndDistrict(city, district);
        return Result.success(cinemas);
    }

    /**
     * 获取影院详情（含影厅列表）
     * GET /cinema/1
     */
    @GetMapping("/{cinemaId}")
    public Result<CinemaDetailDTO> getCinemaDetail(@PathVariable Integer cinemaId) {
        CinemaDetailDTO detail = cinemaService.getCinemaDetail(cinemaId);
        return Result.success(detail);
    }

    /**
     * 搜索影院
     * GET /cinema/search?keyword=万达
     */
    @GetMapping("/search")
    public Result<List<CinemaDTO>> searchCinemas(@RequestParam String keyword) {
        List<CinemaDTO> cinemas = cinemaService.searchCinemas(keyword);
        return Result.success(cinemas);
    }

    /**
     * 获取所有城市列表
     * GET /cinema/cities
     */
    @GetMapping("/cities")
    public Result<List<String>> getAllCities() {
        List<String> cities = cinemaService.getAllCities();
        return Result.success(cities);
    }

    /**
     * 获取影院的影厅列表
     * GET /cinema/1/halls
     */
    @GetMapping("/{cinemaId}/halls")
    public Result<List<Hall>> getHallsByCinemaId(@PathVariable Integer cinemaId) {
        List<Hall> halls = cinemaService.getHallsByCinemaId(cinemaId);
        return Result.success(halls);
    }
}