package com.cinema.minicinema.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Movie {
    private Integer movieId;

    private String title;
    private String director;
    private String actors;
    private String genre;
    private Integer duration;
    private LocalDate releaseDate;
    private String country;
    private String language;
    private BigDecimal rating;
    private String description;
    private String posterUrl;
    private String trailerUrl;
    private BigDecimal boxOffice;
    private String status;

    private LocalDateTime createTime;
}