package com.cinema.minicinema.entity;

import lombok.Data;

@Data
public class MovieTag {
    private Long id;
    private Long movieId;
    private String tag;  // 标签：动作、喜剧、爱情等
}