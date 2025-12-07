package com.cinema.minicinema.dto;

import com.cinema.minicinema.entity.Hall;
import lombok.Data;
import java.util.List;

/**
 * 影院详情DTO（包含影厅列表）
 */
@Data
public class CinemaDetailDTO {
    private Integer cinemaId;
    private String cinemaName;
    private String address;
    private String city;
    private String district;
    private String phone;
    private String facilities; // 设施说明
    private List<Hall> halls; // 影厅列表
}