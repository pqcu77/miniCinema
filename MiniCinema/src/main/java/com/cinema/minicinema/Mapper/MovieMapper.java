package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.dto.MovieSearchDTO;
import com.cinema.minicinema.entity.Movie;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

/**
 * MovieMapper 接口 - 所有实现已委托给 MovieMapperAdapter
 * 该适配器使用 MovieRepository (JPA) 的原生 SQL 查询实现所有方法
 */
@Mapper
public interface MovieMapper {

    // 1. 根据ID查询电影
    Movie selectById(Long movieId);

    // 1.1 查询所有电影
    List<Movie> selectAll();

    // 2. 搜索电影
    List<Movie> searchMovies(MovieSearchDTO searchDTO);

    // 2.1 模糊搜索电影（标题和描述）
    List<Movie> searchByKeyword(@Param("keyword") String keyword,
                                @Param("offset") int offset,
                                @Param("size") int size);

    // 2.2 统计搜索结果数量
    int countByKeyword(@Param("keyword") String keyword);

    // 3. 计算搜索结果总数
    Long countSearchMovies(MovieSearchDTO searchDTO);

    // 4. 获取热门电影
    List<Movie> getHotMovies(@Param("count") Integer count);

    // 5. 获取新片
    List<Movie> getNewMovies(@Param("count") Integer count);

    // 6. 获取相似电影
    List<Movie> getSimilarMovies(@Param("movieId") Integer movieId,
                                 @Param("genre") String genre,
                                 @Param("count") Integer count);

    // 7. 根据ID列表查询电影
    List<Movie> getMoviesByIds(@Param("movieIds") List<Integer> movieIds);

    // 8. 获取电影标签
    List<String> getTagsByMovieId(@Param("movieId") Integer movieId);

    // 9. 获取搜索建议
    List<String> getSearchSuggestions(@Param("keyword") String keyword);

    // 10. 插入电影
    int insert(Movie movie);

    // 11. 更新电影
    int update(Movie movie);

    // 12. 根据类型获取电影
    List<Movie> getMoviesByGenre(@Param("genre") String genre,
                                 @Param("count") int count);
}