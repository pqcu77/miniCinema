package com.cinema.minicinema.entity;


import lombok.Data;
import java.time.LocalDateTime;

@Data

public class Favorite {
    private Integer favoriteId;

    private Integer userId;
    private Integer movieId;

    private LocalDateTime createTime;
}