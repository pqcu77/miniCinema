package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.MovieRecommendService;
import com.cinema.minicinema.Service.MovieSearchService;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.Mapper.UserHistoryMapper;
import com.cinema.minicinema.Repository.MovieRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 电影搜索和推荐 Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieSearchService movieSearchService;

    @Autowired
    private MovieRecommendService movieRecommendService;

    @Autowired
    private UserHistoryMapper userHistoryMapper;

    @Autowired
    private MovieRepository movieRepository;


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

    /**
     * 电影计数接口 - 用于测试数据库连接
     */
    @GetMapping(value = "/count", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> countMovies() {
        log.info("查询电影总数");
        try {
            long count = movieRepository.count();
            Map<String, Object> result = new HashMap<>();
            result.put("code", 1);
            result.put("msg", "success");
            result.put("data", count);
            return result;
        } catch (Exception e) {
            log.error("查询电影总数失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("code", 0);
            result.put("msg", "查询失败：" + e.getMessage());
            result.put("data", null);
            return result;
        }
    }

    /**
     * 分页获取电影列表
     * @param page 页码（从1开始）
     * @param pageSize 每页大小
     */
    @GetMapping(value = "/list", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> listMovies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int pageSize) {

        log.info("获取电影列表: page={}, pageSize={}", page, pageSize);

        try {
            // 使用原生 SQL 查询以兼容 GaussDB 的 OFFSET/LIMIT 语法
            int offset = Math.max(0, (page - 1) * pageSize);
            List<Movie> movies = movieRepository.findMoviesPaginated(pageSize, offset);

            // 获取总数
            long total = movieRepository.count();

            Map<String, Object> result = new HashMap<>();
            result.put("code", 1);
            result.put("msg", "success");

            Map<String, Object> data = new HashMap<>();
            data.put("records", movies);
            data.put("total", total);
            data.put("page", page);
            data.put("pageSize", pageSize);
            data.put("totalPages", (total + pageSize - 1) / pageSize);

            result.put("data", data);

            return result;
        } catch (Exception e) {
            log.error("获取电影列表失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("code", 0);
            result.put("msg", "获取列表失败：" + e.getMessage());
            result.put("data", null);

            return result;
        }
    }

    /**
     * 搜索电影
     * @param keyword 搜索关键词
     * @param genre 电影类型
     * @param page 页码
     * @param pageSize 每页大小
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> searchMovies(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String genre,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int pageSize) {

        log.info("搜索电影: keyword={}, genre={}, page={}, pageSize={}", keyword, genre, page, pageSize);

        try {
            List<Movie> allMovies = new ArrayList<>();

            // 根据搜索条件调用不同的查询方法
            if (!keyword.isEmpty() && !genre.isEmpty()) {
                // 同时按关键词和类型搜索 - 先搜索关键词，再过滤类型
                List<Movie> keywordResults = movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
                allMovies = keywordResults.stream()
                        .filter(m -> m.getGenre() != null && m.getGenre().toUpperCase().contains(genre.toUpperCase()))
                        .collect(Collectors.toList());
            } else if (!keyword.isEmpty()) {
                // 只按关键词搜索
                allMovies = movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
            } else if (!genre.isEmpty()) {
                // 只按类型搜索
                allMovies = movieRepository.findByGenreContainingIgnoreCase(genre);
            } else {
                // 都为空，返回所有电影
                allMovies = movieRepository.findAll();
            }

            // 按评分排序
            allMovies.sort((a, b) -> {
                if (a.getRating() == null || b.getRating() == null) return 0;
                return b.getRating().compareTo(a.getRating());
            });

            // 分页处理
            int offset = Math.max(0, (page - 1) * pageSize);
            List<Movie> pagedMovies = allMovies.stream()
                    .skip(offset)
                    .limit(pageSize)
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("code", 1);
            result.put("msg", "success");

            Map<String, Object> data = new HashMap<>();
            data.put("records", pagedMovies);
            data.put("total", allMovies.size());
            data.put("page", page);
            data.put("pageSize", pageSize);
            data.put("totalPages", (allMovies.size() + pageSize - 1) / pageSize);

            result.put("data", data);

            return result;
        } catch (Exception e) {
            log.error("搜索电影失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("code", 0);
            result.put("msg", "搜索失败：" + e.getMessage());
            result.put("data", null);

            return result;
        }
    }

    /**
     * 获取推荐电影（高评分）
     * @param limit 推荐数量
     */
    @GetMapping(value = "/recommend", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> getRecommendedMovies(
            @RequestParam(defaultValue = "8") int limit) {

        log.info("获取推荐电影: limit={}", limit);

        try {
            List<Movie> movies = movieRepository.getTopRatedMovies(limit);

            Map<String, Object> result = new HashMap<>();
            result.put("code", 1);
            result.put("msg", "success");

            Map<String, Object> data = new HashMap<>();
            data.put("records", movies);
            data.put("total", movies.size());

            result.put("data", data);

            return result;
        } catch (Exception e) {
            log.error("获取推荐电影失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("code", 0);
            result.put("msg", "获取推荐失败：" + e.getMessage());
            result.put("data", null);

            return result;
        }
    }
}
