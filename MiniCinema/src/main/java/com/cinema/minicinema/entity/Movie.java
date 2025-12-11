package com.cinema.minicinema.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
@Data
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Integer movieId;

    @Column(name = "title")
    private String title;
    @Column(name = "director")
    private String director;
    @Column(name = "actors")
    private String actors;
    @Column(name = "genre")
    private String genre;
    @Column(name = "duration")
    private Integer duration;
    @Column(name = "release_date")
    @Temporal(TemporalType.DATE)
    private LocalDate releaseDate;
    @Column(name = "country")
    private String country;
    @Column(name = "language")
    private String language;
    @Column(name = "rating")
    private BigDecimal rating;
    @Column(name = "description")
    private String description;
    @Column(name = "poster_url")
    private String posterUrl;
    @Column(name = "trailer_url")
    private String trailerUrl;
    @Column(name = "box_office")
    private BigDecimal boxOffice;
    @Column(name = "status")
    private String status;
    @Column(name = "create_time")
    private LocalDateTime createTime;
}