package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.CinemaMapper;
import com.cinema.minicinema.Mapper.HallMapper;
import com.cinema.minicinema.Service.CinemaService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.dto.CinemaDTO;
import com.cinema.minicinema.dto.CinemaDetailDTO;
import com.cinema.minicinema.entity.Cinema;
import com.cinema.minicinema.entity.Hall;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CinemaServiceImpl implements CinemaService {

    @Autowired
    private CinemaMapper cinemaMapper;

    @Autowired
    private HallMapper hallMapper;

    @Override
    public List<CinemaDTO> getAllCinemas() {
        List<Cinema> cinemas = cinemaMapper.selectAll();
        return cinemas.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CinemaDTO> getCinemasByCity(String city) {
        if (city == null || city.trim().isEmpty()) {
            throw new BusinessException("城市参数不能为空");
        }
        List<Cinema> cinemas = cinemaMapper.selectByCity(city);
        return cinemas.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CinemaDTO> getCinemasByCityAndDistrict(String city, String district) {
        if (city == null || city.trim().isEmpty()) {
            throw new BusinessException("城市参数不能为空");
        }
        if (district == null || district.trim().isEmpty()) {
            throw new BusinessException("区域参数不能为空");
        }
        List<Cinema> cinemas = cinemaMapper.selectByCityAndDistrict(city, district);
        return cinemas.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CinemaDetailDTO getCinemaDetail(Integer cinemaId) {
        if (cinemaId == null) {
            throw new BusinessException("影院ID不能为空");
        }

        // 查询影院信息
        Cinema cinema = cinemaMapper.selectById(cinemaId);
        if (cinema == null) {
            throw new BusinessException("影院不存在");
        }

        // 查询影厅列表
        List<Hall> halls = hallMapper.selectByCinemaId(cinemaId);

        // 组装DTO
        CinemaDetailDTO dto = new CinemaDetailDTO();
        BeanUtils.copyProperties(cinema, dto);
        dto.setHalls(halls);

        return dto;
    }

    @Override
    public List<CinemaDTO> searchCinemas(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCinemas();
        }
        List<Cinema> cinemas = cinemaMapper.searchByKeyword(keyword);
        return cinemas.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<String> getAllCities() {
        return cinemaMapper.selectAllCities();
    }

    @Override
    public List<Hall> getHallsByCinemaId(Integer cinemaId) {
        if (cinemaId == null) {
            throw new BusinessException("影院ID不能为空");
        }
        return hallMapper.selectByCinemaId(cinemaId);
    }

    /**
     * 将 Cinema 转换为 CinemaDTO
     */
    private CinemaDTO convertToDTO(Cinema cinema) {
        CinemaDTO dto = new CinemaDTO();
        BeanUtils.copyProperties(cinema, dto);

        // 查询影厅数量
        int hallCount = hallMapper.countByCinemaId(cinema.getCinemaId());
        dto.setHallCount(hallCount);

        return dto;
    }
}