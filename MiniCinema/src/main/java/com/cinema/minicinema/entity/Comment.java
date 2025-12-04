package com.cinema.minicinema.entity;


import lombok.Data;
import java.time.LocalDateTime;

@Data

public class Comment {

    private Integer commentId;

    private Integer userId;
    private Integer movieId;
    private Integer rating;
    private String content;
    private Integer likeCount;


    private LocalDateTime createTime;
}