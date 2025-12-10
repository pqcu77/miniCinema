package com.cinema.minicinema.Service;

import com.cinema.minicinema.entity.Movie;
import java.util.List;

/**
 * 电影推荐服务接口
 */
public interface MovieRecommendService {

    /**
     * 混合推荐策略：内容相似 + 协同过滤
     * @param movieId 当前电影ID
     * @param userId 当前用户ID（可选，用于过滤已看过的电影）
     * @param limit 推荐数量
     * @return 推荐电影列表
     */
    List<Movie> getHybridRecommendations(Long movieId, Long userId, int limit);

    /**
     * 热门推荐（针对新用户或无历史记录的场景）
     * @param limit 推荐数量
     * @return 热门电影列表
     */
    List<Movie> getPopularRecommendations(int limit);
}

