package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.MovieCommentService;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.entity.MovieComment;
import com.cinema.minicinema.Mapper.UserHistoryMapper;
import com.cinema.minicinema.Repository.MovieRepository;
import com.cinema.minicinema.util.AuthUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletRequest;
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
    private UserHistoryMapper userHistoryMapper;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MovieCommentService movieCommentService;

    @Autowired
    private HttpServletRequest request;


    /**
     * 记录用户观看电影的行为（REST: POST /api/movies/{movieId}/history）
     */
    @PostMapping("/{movieId}/history")
    public Map<String, Object> recordMovieHistory(
            @PathVariable Long movieId,
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "0") Integer watchDuration) {

        Long resolvedUserId = AuthUtil.resolveUserId(request, userId);

        log.info("记录观看: userId={}, movieId={}, watchDuration={}", resolvedUserId, movieId, watchDuration);

        Map<String, Object> result = new HashMap<>();
        try {
            if (resolvedUserId == null) {
                result.put("success", false);
                result.put("message", "userId missing");
                return result;
            }

            userHistoryMapper.recordUserHistory(resolvedUserId, movieId, LocalDateTime.now(), watchDuration);

            result.put("success", true);
            result.put("message", "观看记录已保存");

            return result;
        } catch (Exception e) {
            log.error("记录观看失败: {}", e.getMessage(), e);
            Map<String, Object> r = new HashMap<>();
            r.put("success", false);
            r.put("message", "记录失败：" + e.getMessage());
            return r;
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
     * 查询电影列表（支持 keyword/genre 搜索） -> GET /api/movies
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> queryMovies(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String genre,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int pageSize) {

        log.info("查询电影: keyword={}, genre={}, page={}, pageSize={}", keyword, genre, page, pageSize);

        try {
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> data = new HashMap<>();

            boolean hasKeyword = StringUtils.hasText(keyword);
            boolean hasGenre = StringUtils.hasText(genre);

            if (!hasKeyword && !hasGenre) {
                int offset = Math.max(0, (page - 1) * pageSize);
                List<Movie> movies = movieRepository.findMoviesPaginated(pageSize, offset);
                long total = movieRepository.count();

                data.put("records", movies);
                data.put("total", total);
            } else {
                List<Movie> allMovies = movieRepository
                        .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);

                if (hasGenre) {
                    allMovies = allMovies.stream()
                            .filter(m -> m.getGenre() != null && m.getGenre().toLowerCase().contains(genre.toLowerCase()))
                            .collect(Collectors.toList());
                }

                allMovies.sort((a, b) -> {
                    if (a.getRating() == null || b.getRating() == null) return 0;
                    return b.getRating().compareTo(a.getRating());
                });

                int offset = Math.max(0, (page - 1) * pageSize);
                List<Movie> pagedMovies = allMovies.stream()
                        .skip(offset)
                        .limit(pageSize)
                        .collect(Collectors.toList());

                data.put("records", pagedMovies);
                data.put("total", allMovies.size());
            }

            data.put("page", page);
            data.put("pageSize", pageSize);
            long total = ((Number) data.get("total")).longValue();
            data.put("totalPages", (total + pageSize - 1) / pageSize);

            result.put("code", 1);
            result.put("msg", "success");
            result.put("data", data);
            return result;
        } catch (Exception e) {
            log.error("查询电影失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("code", 0);
            result.put("msg", "获取列表失败：" + e.getMessage());
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

    /**
     * 获取单个电影详情 -> GET /api/movies/{movieId}
     */
    @GetMapping(value = "/{movieId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> getMovieDetail(@PathVariable Integer movieId) {
        log.info("获取电影详情: movieId={}", movieId);

        Map<String, Object> result = new HashMap<>();
        try {
            Optional<Movie> optionalMovie = movieRepository.findById(movieId);
            if (!optionalMovie.isPresent()) {
                result.put("code", 0);
                result.put("msg", "电影不存在");
                result.put("data", null);
                return result;
            }

            result.put("code", 1);
            result.put("msg", "success");
            result.put("data", optionalMovie.get());
            return result;
        } catch (Exception e) {
            log.error("获取电影详情失败: movieId={}, error={}", movieId, e.getMessage(), e);
            result.put("code", 0);
            result.put("msg", "获取电影详情失败：" + e.getMessage());
            result.put("data", null);
            return result;
        }
    }

    /**
     * 获取电影评论 -> GET /api/movies/{movieId}/comments
     */
    @GetMapping(value = "/{movieId}/comments", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> getMovieComments(@PathVariable Integer movieId) {
        log.info("获取电影评论: movieId={}", movieId);
        Map<String, Object> result = new HashMap<>();
        try {
            List<MovieComment> comments = movieCommentService.getComments(movieId);
            result.put("code", 1);
            result.put("msg", "success");
            result.put("data", comments);
            return result;
        } catch (Exception e) {
            log.error("获取电影评论失败: movieId={}, error={}", movieId, e.getMessage(), e);
            result.put("code", 0);
            result.put("msg", "获取评论失败：" + e.getMessage());
            result.put("data", null);
            return result;
        }
    }

    /**
     * 提交电影评论 -> POST /api/movies/{movieId}/comments
     */
    @PostMapping(value = "/{movieId}/comments", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> addMovieComment(
            @PathVariable Integer movieId,
            @RequestBody Map<String, Object> payload) {

        Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : null;
        String content = payload.get("content") != null ? payload.get("content").toString() : null;
        String ratingStr = payload.get("rating") != null ? payload.get("rating").toString() : null;

        log.info("提交电影评论: movieId={}, userId={}", movieId, userId);

        Map<String, Object> result = new HashMap<>();
        try {
            if (userId == null || !StringUtils.hasText(content)) {
                throw new IllegalArgumentException("用户ID和评论内容不能为空");
            }

            java.math.BigDecimal rating = null;
            if (StringUtils.hasText(ratingStr)) {
                rating = new java.math.BigDecimal(ratingStr);
            }

            MovieComment saved = movieCommentService.addComment(userId, movieId, content, rating);

            result.put("code", 1);
            result.put("msg", "success");
            result.put("data", saved);
            return result;
        } catch (Exception e) {
            log.error("提交电影评论失败: movieId={}, error={}", movieId, e.getMessage(), e);
            result.put("code", 0);
            result.put("msg", "提交评论失败：" + e.getMessage());
            result.put("data", null);
            return result;
        }
    }

    /**
     * 获取用户观看历史（最近浏览的电影）
     * 支持两个调用方式：
     * - GET /api/movies/history?userId=5
     * - GET /api/users/{userId}/history (handled by different controller ideally) — we provide alias below
     */
    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Map<String, Object> getUserHistory(@RequestParam(value = "userId", required = false) String userId,
                                              @RequestParam(value = "limit", defaultValue = "20") int limit) {
        Long resolvedUserId = AuthUtil.resolveUserId(request, userId);
        log.info("获取用户历史: userId={}, limit={}", resolvedUserId, limit);
        Map<String, Object> result = new HashMap<>();
        try {
            if (resolvedUserId == null) {
                result.put("code", 1);
                result.put("msg", "success");
                result.put("data", Collections.emptyList());
                return result;
            }

            List<Integer> recent = userHistoryMapper.getRecentViewedMovies(resolvedUserId.intValue(), limit);
            if (recent == null || recent.isEmpty()) {
                result.put("code", 1);
                result.put("msg", "success");
                result.put("data", Collections.emptyList());
                return result;
            }

            List<Movie> movies = recent.stream()
                    .map(id -> movieRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            result.put("code", 1);
            result.put("msg", "success");
            result.put("data", movies);
            return result;
        } catch (Exception e) {
            log.error("获取用户历史失败: {}", e.getMessage(), e);
            result.put("code", 0);
            result.put("msg", "获取用户历史失败：" + e.getMessage());
            result.put("data", null);
            return result;
        }
    }

    // helper to resolve userId from request if not provided -- kept for compatibility but unused now
    private Long resolveUserId(Long userIdParam) {
        if (userIdParam != null) return userIdParam;
        String auth = request.getHeader("Authorization");
        if (!StringUtils.hasText(auth)) return null;
        String token = auth.startsWith("Bearer ") ? auth.substring(7) : auth;
        try {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

}
