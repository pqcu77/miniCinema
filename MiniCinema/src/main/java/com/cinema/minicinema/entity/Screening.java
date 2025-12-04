package com.cinema.minicinema.entity;


import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data

public class Screening {

    private Integer screeningId;

    private Integer movieId;
    private Integer cinemaId;
    private Integer hallId;
    private LocalDateTime screenTime;
    private BigDecimal price;
    private String languageType;
    private String videoType;
    private Integer availableSeats;


    private LocalDateTime createTime;
}