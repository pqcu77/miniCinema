package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.Favorite;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface FavoriteMapper {

    @Insert("INSERT INTO favorites (user_id, movie_id, create_time) VALUES (#{userId}, #{movieId}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "favoriteId")
    int addFavorite(Favorite favorite);

    @Delete("DELETE FROM favorites WHERE user_id = #{userId} AND movie_id = #{movieId}")
    int removeFavorite(@Param("userId") Long userId, @Param("movieId") Integer movieId);

    // Return minimal favorite info joined with movies (if movie exists)
    @Select("SELECT f.favorite_id AS favoriteId, f.user_id AS userId, f.movie_id AS movieId, m.title AS title, m.poster_url AS posterUrl, m.rating AS rating, f.create_time AS createTime " +
            "FROM favorites f LEFT JOIN movies m ON f.movie_id = m.movie_id WHERE f.user_id = #{userId} ORDER BY f.create_time DESC")
    List<Map<String, Object>> listFavorites(@Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM favorites WHERE user_id = #{userId} AND movie_id = #{movieId}")
    int countFavorite(@Param("userId") Long userId, @Param("movieId") Integer movieId);
}

