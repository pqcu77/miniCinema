package com.cinema.minicinema.dto;

import lombok.Data;

/**
 * 影院列表展示DTO
 */
@Data
public class CinemaDTO {
    private Integer cinemaId;
    private String cinemaName;
    private String address;
    private String city;
    private String district;
    private String phone;
    private Integer hallCount; // 影厅数量
}
