package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.Repository.MovieRepository;
import com.cinema.minicinema.Service.MovieSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 电影搜索服务实现
 */
@Service
public class MovieSearchServiceImpl implements MovieSearchService {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public List<Movie> searchMovies(String keyword, int page, int size) {
        // 使用新的 JPA 查询方法
        List<Movie> allResults = movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);

        // 按评分排序
        allResults.sort((a, b) -> {
            if (a.getRating() == null || b.getRating() == null) return 0;
            return b.getRating().compareTo(a.getRating());
        });

        // 分页处理
        int offset = page * size;
        return allResults.stream()
                .skip(offset)
                .limit(size)
                .collect(Collectors.toList());
    }

    @Override
    public int countSearchResults(String keyword) {
        // 获取所有匹配的结果数量
        List<Movie> results = movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
        return results.size();
    }
}
