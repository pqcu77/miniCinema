package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.Mapper.MovieMapper;
import com.cinema.minicinema.Mapper.UserHistoryMapper;
import com.cinema.minicinema.Service.MovieRecommendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 电影推荐服务实现
 */
@Service
public class MovieRecommendServiceImpl implements MovieRecommendService {

    @Autowired
    private MovieMapper movieMapper;

    @Autowired
    private UserHistoryMapper userHistoryMapper;

    @Override
    public List<Movie> getHybridRecommendations(Long movieId, Long userId, int limit) {
        // 获取当前电影信息
        Movie currentMovie = movieMapper.selectById(movieId);
        if (currentMovie == null) {
            return new ArrayList<>();
        }

        // 获取所有电影
        List<Movie> allMovies = movieMapper.selectAll();

        // 获取用户已看过的电影（用于过滤）
        List<Long> watchedMovies = userId != null ?
            userHistoryMapper.getUserWatchedMovies(userId) : new ArrayList<>();

        // 计算每部电影的推荐得分
        Map<Long, Double> scoreMap = new HashMap<>();

        for (Movie movie : allMovies) {
            // 跳过当前电影和已看过的电影
            Long currentMovieId = movie.getMovieId().longValue();
            if (currentMovieId.equals(movieId) || watchedMovies.contains(currentMovieId)) {
                continue;
            }

            // 内容相似度：基于评分相似度
            double contentScore = calculateContentSimilarity(currentMovie, movie);

            // 协同过滤：基于共现用户数
            int coOccurrence = userHistoryMapper.getCoOccurrenceCount(movieId, currentMovieId);
            double collaborativeScore = coOccurrence / 100.0; // 归一化

            // 热度分数（浏览数越多越热）
            int viewCount = userHistoryMapper.getMovieViewCount(currentMovieId);
            double popularityScore = Math.min(viewCount / 1000.0, 1.0); // 上限1.0

            // 混合计算（权重分配：内容50% + 协同30% + 热度20%）
            double finalScore = 0.5 * contentScore + 0.3 * collaborativeScore + 0.2 * popularityScore;

            scoreMap.put(currentMovieId, finalScore);
        }

        // 按得分排序，取Top N
        return scoreMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(entry -> movieMapper.selectById(entry.getKey()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Movie> getPopularRecommendations(int limit) {
        List<Movie> allMovies = movieMapper.selectAll();

        return allMovies.stream()
                .sorted((a, b) -> {
                    if (a.getRating() == null) return 1;
                    if (b.getRating() == null) return -1;
                    return b.getRating().compareTo(a.getRating());
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 计算两部电影的内容相似度（基于评分）
     * 评分相近的电影认为相似度高
     */
    private double calculateContentSimilarity(Movie movie1, Movie movie2) {
        // 处理空评分
        if (movie1.getRating() == null || movie2.getRating() == null) {
            return 0.5; // 默认中等相似度
        }

        // 评分差值（BigDecimal运算）
        double ratingDiff = Math.abs(
            movie1.getRating().doubleValue() - movie2.getRating().doubleValue()
        );
        // 差值越小越相似（0-1之间）
        double similarity = 1.0 - (ratingDiff / 10.0);
        return Math.max(similarity, 0.0);
    }
}

