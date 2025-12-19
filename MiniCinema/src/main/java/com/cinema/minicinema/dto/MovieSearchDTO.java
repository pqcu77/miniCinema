package com.cinema.minicinema.dto;

import lombok.Data;
//import javax.validation.constraints.Min;

@Data
public class MovieSearchDTO {
    private String keyword;  // 搜索关键词
    private String genre;  // 类型筛选
    private String region;  // 地区筛选
    private Integer year;  // 年份筛选
    private Double minRating;  // 最低评分
    private Double maxRating;  // 最高评分
    private String sortBy = "movie_id";  // 排序字段
    private String sortOrder = "desc";  // 排序方向

//    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;  // 页码

//    @Min(value = 1, message = "每页数量最小为1")
    private Integer size = 20;  // 每页数量
    // 用于计算offset
    private Integer offset = 0;
}