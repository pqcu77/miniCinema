package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.Mapper.MovieMapper;
import com.cinema.minicinema.Service.MovieSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 电影搜索服务实现
 */
@Service
public class MovieSearchServiceImpl implements MovieSearchService {

    @Autowired
    private MovieMapper movieMapper;

    @Override
    public List<Movie> searchMovies(String keyword, int page, int size) {
        // 计算偏移量
        int offset = page * size;

        // 使用LIKE进行模糊搜索
        String searchPattern = "%" + keyword + "%";

        return movieMapper.searchByKeyword(searchPattern, offset, size);
    }

    @Override
    public int countSearchResults(String keyword) {
        String searchPattern = "%" + keyword + "%";
        return movieMapper.countByKeyword(searchPattern);
    }
}
