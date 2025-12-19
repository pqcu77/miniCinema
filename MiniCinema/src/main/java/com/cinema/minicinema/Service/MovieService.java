package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.*;
import java.math.BigDecimal;
import java.util.List;

public interface MovieService {

    // 搜索电影
    List<MovieDTO> searchMovies(MovieSearchDTO searchDTO);

    // 获取电影详情
    MovieDTO getMovieDetail(Integer movieId, Integer userId);

    // 获取热门推荐
    List<MovieDTO> getHotRecommendations(RecommendationDTO dto);

    // 获取个性化推荐
    List<MovieDTO> getPersonalRecommendations(Integer userId, RecommendationDTO dto);

    // 获取相似电影推荐
    List<MovieDTO> getSimilarMovies(Integer movieId, RecommendationDTO dto);

    // 获取搜索建议
    List<String> getSearchSuggestions(String keyword);

    // 记录用户行为
    void recordUserAction(Integer userId, Integer movieId, String action, BigDecimal score);
}