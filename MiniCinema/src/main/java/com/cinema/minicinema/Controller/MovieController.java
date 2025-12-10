package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.MovieRecommendService;
import com.cinema.minicinema.Service.MovieSearchService;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.Mapper.UserHistoryMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 电影搜索和推荐 Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieSearchService movieSearchService;

    @Autowired
    private MovieRecommendService movieRecommendService;

    @Autowired
    private UserHistoryMapper userHistoryMapper;

    /**
     * 搜索电影
     * @param keyword 搜索关键词
     * @param page 页码（从0开始）
     * @param size 每页大小
     */
    @GetMapping("/search")
    public Map<String, Object> searchMovies(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("搜索电影: keyword={}, page={}, size={}", keyword, page, size);

        try {
            // 获取搜索结果
            List<Movie> movies = movieSearchService.searchMovies(keyword, page, size);

            // 统计总数
            int total = movieSearchService.countSearchResults(keyword);

            Map<String, Object> result = new HashMap<>();
            result.put("movies", movies);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (total + size - 1) / size);

            return result;
        } catch (Exception e) {
            log.error("搜索电影失败: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "搜索失败：" + e.getMessage());
            return error;
        }
    }

    /**
     * 获取混合推荐电影
     * @param movieId 当前电影ID
     * @param userId 用户ID（可选）
     * @param limit 推荐数量
     */
    @GetMapping("/{movieId}/recommendations")
    public Map<String, Object> getRecommendations(
            @PathVariable Long movieId,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "6") int limit) {

        log.info("获取推荐: movieId={}, userId={}, limit={}", movieId, userId, limit);

        try {
            List<Movie> recommendations = movieRecommendService.getHybridRecommendations(movieId, userId, limit);

            Map<String, Object> result = new HashMap<>();
            result.put("recommendations", recommendations);
            result.put("count", recommendations.size());

            return result;
        } catch (Exception e) {
            log.error("获取推荐失败: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "推荐获取失败：" + e.getMessage());
            return error;
        }
    }

    /**
     * 获取热门推荐（针对新用户）
     * @param limit 推荐数量
     */
    @GetMapping("/popular")
    public Map<String, Object> getPopularMovies(
            @RequestParam(defaultValue = "6") int limit) {

        log.info("获取热门推荐: limit={}", limit);

        try {
            List<Movie> popularMovies = movieRecommendService.getPopularRecommendations(limit);

            Map<String, Object> result = new HashMap<>();
            result.put("movies", popularMovies);
            result.put("count", popularMovies.size());

            return result;
        } catch (Exception e) {
            log.error("获取热门推荐失败: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "推荐获取失败：" + e.getMessage());
            return error;
        }
    }

    /**
     * 记录用户观看电影的行为
     * @param userId 用户ID
     * @param movieId 电影ID
     * @param watchDuration 观看时长（秒）
     */
    @PostMapping("/history")
    public Map<String, Object> recordMovieHistory(
            @RequestParam Long userId,
            @RequestParam Long movieId,
            @RequestParam(defaultValue = "0") Integer watchDuration) {

        log.info("记录观看: userId={}, movieId={}, watchDuration={}", userId, movieId, watchDuration);

        try {
            userHistoryMapper.recordUserHistory(userId, movieId, LocalDateTime.now(), watchDuration);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "观看记录已保存");

            return result;
        } catch (Exception e) {
            log.error("记录观看失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "记录失败：" + e.getMessage());

            return result;
        }
    }
}
