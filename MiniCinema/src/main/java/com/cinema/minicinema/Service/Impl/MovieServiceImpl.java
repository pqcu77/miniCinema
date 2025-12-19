package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Service.MovieService;
import com.cinema.minicinema.dto.*;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.entity.UserHistory;
import com.cinema.minicinema.Mapper.MovieMapper;
import com.cinema.minicinema.Mapper.UserHistoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieMapper movieMapper;
    private final UserHistoryMapper userHistoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public List<MovieDTO> searchMovies(MovieSearchDTO searchDTO) {
        try {
            int offset = (searchDTO.getPage() - 1) * searchDTO.getSize();
            searchDTO.setOffset(offset);

            List<Movie> movies = movieMapper.searchMovies(searchDTO);

            return movies.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("搜索电影失败: {}", e.getMessage(), e);
            throw new RuntimeException("搜索失败: " + e.getMessage());
        }
    }

    @Override
    public MovieDTO getMovieDetail(Integer movieId, Integer userId) {
        try {
            // ✅ 修复：Integer 转 Long
            Movie movie = movieMapper.selectById(Long.valueOf(movieId));
            if (movie == null) {
                throw new RuntimeException("电影不存在");
            }

            MovieDTO dto = convertToDTO(movie);

            if (userId != null) {
                UserHistory likeHistory = userHistoryMapper.findByUserAndMovieAndAction(
                        userId, movieId, "like");
                dto.setLiked(likeHistory != null);

                BigDecimal userRating = userHistoryMapper.getUserRating(userId, movieId);
                dto.setUserRating(userRating);
            }

            return dto;

        } catch (Exception e) {
            log.error("获取电影详情失败: movieId={}, error={}", movieId, e.getMessage(), e);
            throw new RuntimeException("获取电影详情失败: " + e.getMessage());
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<MovieDTO> getHotRecommendations(RecommendationDTO dto) {
        String cacheKey = "recommend:hot:" + dto.getCount();

        try {
            List<MovieDTO> cached = (List<MovieDTO>) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return cached;
            }

            List<Movie> movies = movieMapper.getHotMovies(dto.getCount());

            List<MovieDTO> result = movies.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            redisTemplate.opsForValue().set(cacheKey, result, 1, TimeUnit.HOURS);

            return result;

        } catch (Exception e) {
            log.error("获取热门推荐失败: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<MovieDTO> getPersonalRecommendations(Integer userId, RecommendationDTO dto) {
        if (userId == null) {
            return getHotRecommendations(dto);
        }

        try {
            Set<Integer> recommendedMovieIds = new HashSet<>();

            Map<String, Integer> userPreferences = getUserMoviePreferences(userId);

            for (Map.Entry<String, Integer> entry : userPreferences.entrySet()) {
                String genre = entry.getKey();
                int count = Math.min(dto.getCount() / 2, entry.getValue());
                List<Movie> movies = movieMapper.getMoviesByGenre(genre, count);
                movies.forEach(m -> recommendedMovieIds.add(m.getMovieId()));
            }

            List<Integer> recentViewed = userHistoryMapper.getRecentViewedMovies(userId, 10);

            for (Integer movieId : recentViewed) {
                // ✅ 修复：Integer 转 Long
                Movie movie = movieMapper.selectById(Long.valueOf(movieId));
                if (movie != null && StringUtils.hasText(movie.getGenre())) {
                    String[] genres = movie.getGenre().split(",");
                    if (genres.length > 0) {
                        List<Movie> similar = movieMapper.getSimilarMovies(
                                movieId, genres[0].trim(), 3);
                        similar.forEach(m -> recommendedMovieIds.add(m.getMovieId()));
                    }
                }
            }

            if (recommendedMovieIds.size() < dto.getCount()) {
                int remaining = dto.getCount() - recommendedMovieIds.size();
                List<Movie> hotMovies = movieMapper.getHotMovies(remaining);
                hotMovies.forEach(m -> recommendedMovieIds.add(m.getMovieId()));
            }

            List<Movie> movies = movieMapper.getMoviesByIds(
                    new ArrayList<>(recommendedMovieIds));

            return movies.stream()
                    .limit(dto.getCount())
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("获取个性化推荐失败: userId={}, error={}", userId, e.getMessage(), e);
            return getHotRecommendations(dto);
        }
    }

    @Override
    public List<MovieDTO> getSimilarMovies(Integer movieId, RecommendationDTO dto) {
        try {
            // ✅ 修复：Integer 转 Long
            Movie currentMovie = movieMapper.selectById(Long.valueOf(movieId));
            if (currentMovie == null) {
                throw new RuntimeException("电影不存在");
            }

            if (StringUtils.hasText(currentMovie.getGenre())) {
                String[] genres = currentMovie.getGenre().split(",");
                if (genres.length > 0) {
                    List<Movie> similarMovies = movieMapper.getSimilarMovies(
                            movieId, genres[0].trim(), dto.getCount());

                    return similarMovies.stream()
                            .map(this::convertToDTO)
                            .collect(Collectors.toList());
                }
            }

            return Collections.emptyList();

        } catch (Exception e) {
            log.error("获取相似电影失败: movieId={}, error={}", movieId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<String> getSearchSuggestions(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Collections.emptyList();
        }

        String cacheKey = "search:suggestions:" + keyword;

        try {
            List<String> cached = (List<String>) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return cached;
            }

            List<String> suggestions = movieMapper.getSearchSuggestions(keyword);

            redisTemplate.opsForValue().set(cacheKey, suggestions, 5, TimeUnit.MINUTES);

            return suggestions;

        } catch (Exception e) {
            log.error("获取搜索建议失败: keyword={}, error={}", keyword, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public void recordUserAction(Integer userId, Integer movieId, String action, BigDecimal score) {
        try {
            UserHistory history = new UserHistory();
            history.setUserId(Long.valueOf(userId));
            history.setMovieId(Long.valueOf(movieId));
            history.setAction(action);
            history.setScore(score);
            history.setCreatedAt(LocalDateTime.now());

            userHistoryMapper.upsert(history);

            log.info("记录用户行为: userId={}, movieId={}, action={}", userId, movieId, action);

        } catch (Exception e) {
            log.error("记录用户行为失败: {}", e.getMessage(), e);
            throw new RuntimeException("记录行为失败: " + e.getMessage());
        }
    }

    private Map<String, Integer> getUserMoviePreferences(Integer userId) {
        Map<String, Integer> preferences = new HashMap<>();

        List<UserHistory> userActions = userHistoryMapper.findByUserAndActions(
                userId, Arrays.asList("like", "rate"));

        for (UserHistory action : userActions) {
            // ✅ 修复：Long 转 Long（直接使用）
            Movie movie = movieMapper.selectById(action.getMovieId());
            if (movie != null && StringUtils.hasText(movie.getGenre())) {
                String[] genres = movie.getGenre().split(",");
                for (String genre : genres) {
                    String trimmed = genre.trim();
                    preferences.put(trimmed, preferences.getOrDefault(trimmed, 0) + 1);
                }
            }
        }

        return preferences;
    }

    private MovieDTO convertToDTO(Movie movie) {
        MovieDTO dto = new MovieDTO();
        BeanUtils.copyProperties(movie, dto);

        List<String> tags = movieMapper.getTagsByMovieId(movie.getMovieId());
        dto.setTags(tags);

        return dto;
    }
}
