package com.cinema.minicinema.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Data
public class MovieDTO {
    private Integer movieId;
    private String title;
    private String director;
    private String genre;
    private Integer releaseYear;
    private BigDecimal rating;
    private String posterUrl;
    private String description;

    // 新增字段
    private Boolean liked;           // 用户是否点赞
    private BigDecimal userRating;   // 用户评分
    private List<String> tags;       // 电影标签
}

//@Data
//public class MovieDTO {
//    private Long movieId;
//    private String title;
//    private String originalTitle;
//    private String director;
//    private String actors;
//    private String genre;
//    private String region;
//    private String language;
//    private Integer duration;
//    private LocalDate releaseDate;
//    private String description;
//    private String posterUrl;
//    private String coverUrl;
//    private BigDecimal rating;
//    private Integer ratingCount;
//    private BigDecimal boxOffice;
//    private String status;
//    private List<String> tags;  // 电影标签
//    private Boolean isLiked = false;  // 当前用户是否喜欢
//    private BigDecimal userRating;  // 当前用户评分
//}