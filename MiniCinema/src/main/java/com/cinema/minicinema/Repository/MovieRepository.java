package com.cinema.minicinema.Repository;

import com.cinema.minicinema.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {
    // Use native SQL with OFFSET/LIMIT for GaussDB compatibility
    @Query(value = "SELECT * FROM movies ORDER BY movie_id ASC LIMIT :pageSize OFFSET :offset", nativeQuery = true)
    List<Movie> findMoviesPaginated(@Param("pageSize") int pageSize, @Param("offset") int offset);

    // 搜索电影 - 使用 JPA 方法而不是 SQL，避免 LIKE 语法问题
    // 查询标题或描述包含关键词的电影
    List<Movie> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    // 按类型搜索
    List<Movie> findByGenreContainingIgnoreCase(String genre);


    // 获取高评分电影（推荐）
    @Query(value = "SELECT * FROM movies WHERE rating > 0 ORDER BY rating DESC LIMIT :limit", nativeQuery = true)
    List<Movie> getTopRatedMovies(@Param("limit") int limit);
}

