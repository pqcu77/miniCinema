package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.UserHistory;
import org.apache.ibatis.annotations.*;
import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface UserHistoryMapper {

    // 1. 插入或更新用户行为
    int upsert(UserHistory userHistory);

    // 2. 根据用户、电影和动作查询
    UserHistory findByUserAndMovieAndAction(@Param("userId") Integer userId,
                                            @Param("movieId") Integer movieId,
                                            @Param("action") String action);

    // 3. 获取用户最近浏览的电影
    List<Integer> getRecentViewedMovies(@Param("userId") Integer userId,
                                        @Param("limit") Integer limit);

    // 4. 获取用户的行为记录
    List<UserHistory> findByUserAndActions(@Param("userId") Integer userId,
                                           @Param("actions") List<String> actions);

    // 5. 获取用户对电影的评分
    BigDecimal getUserRating(@Param("userId") Integer userId,
                             @Param("movieId") Integer movieId);

    // 6. 统计用户对某部电影的行为
    int countUserAction(@Param("userId") Integer userId,
                        @Param("movieId") Integer movieId,
                        @Param("action") String action);

    // ===== 推荐算法需要的方法 =====

    /**
     * 记录用户观看电影的历史
     */
    @Insert("INSERT INTO user_history (user_id, movie_id, created_at, watch_duration) " +
            "VALUES (#{userId}, #{movieId}, #{viewTime}, #{watchDuration})")
    void recordUserHistory(@Param("userId") Long userId,
                          @Param("movieId") Long movieId,
                          @Param("viewTime") java.time.LocalDateTime viewTime,
                          @Param("watchDuration") Integer watchDuration);

    /**
     * 获取用户已看过的电影ID列表
     */
    @Select("SELECT DISTINCT movie_id FROM user_history WHERE user_id = #{userId}")
    List<Long> getUserWatchedMovies(@Param("userId") Long userId);

    /**
     * 获取两部电影的共现用户数（看过两部电影的用户数）
     * 用于协同过滤推荐
     */
    @Select("SELECT COUNT(DISTINCT uh1.user_id) FROM user_history uh1 " +
            "INNER JOIN user_history uh2 ON uh1.user_id = uh2.user_id " +
            "WHERE uh1.movie_id = #{movieId1} AND uh2.movie_id = #{movieId2}")
    int getCoOccurrenceCount(@Param("movieId1") Long movieId1,
                            @Param("movieId2") Long movieId2);

    /**
     * 获取电影的总浏览次数
     */
    @Select("SELECT COUNT(*) FROM user_history WHERE movie_id = #{movieId}")
    int getMovieViewCount(@Param("movieId") Long movieId);
}