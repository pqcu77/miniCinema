package com.cinema.minicinema.Service;

import com.cinema.minicinema.entity.Movie;
import java.util.List;

/**
 * 电影搜索服务接口
 */
public interface MovieSearchService {

    /**
     * 搜索电影（模糊匹配标题和描述）
     * @param keyword 搜索关键词
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @return 搜索结果列表
     */
    List<Movie> searchMovies(String keyword, int page, int size);

    /**
     * 统计搜索结果总数
     */
    int countSearchResults(String keyword);
}

