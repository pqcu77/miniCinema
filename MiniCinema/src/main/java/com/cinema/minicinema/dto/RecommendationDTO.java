package com.cinema.minicinema.dto;

import lombok.Data;
//import javax.validation.constraints.Min;
//import javax.validation.constraints.Max;

@Data
public class RecommendationDTO {
//    @Min(value = 1, message = "推荐数量最小为1")
//    @Max(value = 50, message = "推荐数量最大为50")
    private Integer count = 10;  // 推荐数量

    private String type = "hot";  // 推荐类型: hot-热门, personal-个性化, similar-相似
    private Long movieId;  // 用于相似推荐
}