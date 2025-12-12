package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.dto.MovieSearchDTO;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.Repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * MovieMapper 适配器 - 将 MyBatis 调用转换为 JPA Repository 调用
 * 保持向后兼容性，所有方法都委托给 MovieRepository
 */
@Component
public class MovieMapperAdapter implements MovieMapper {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public Movie selectById(Long movieId) {
        return movieRepository.findById(movieId.intValue()).orElse(null);
    }

    @Override
    public List<Movie> selectAll() {
        return movieRepository.findAll();
    }

    @Override
    public List<Movie> searchMovies(MovieSearchDTO searchDTO) {
        return movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(searchDTO.getKeyword(), searchDTO.getKeyword());
    }

    @Override
    public List<Movie> searchByKeyword(String keyword, int offset, int size) {
        List<Movie> allResults = movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
        return allResults.stream()
                .skip(offset)
                .limit(size)
                .collect(Collectors.toList());
    }

    @Override
    public int countByKeyword(String keyword) {
        return movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword).size();
    }

    @Override
    public Long countSearchMovies(MovieSearchDTO searchDTO) {
        return (long) movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(searchDTO.getKeyword(), searchDTO.getKeyword()).size();
    }

    @Override
    public List<Movie> getHotMovies(Integer count) {
        return movieRepository.getTopRatedMovies(count != null ? count : 8);
    }

    @Override
    public List<Movie> getNewMovies(Integer count) {
        return movieRepository.findAll().stream()
                .sorted((a, b) -> b.getCreateTime().compareTo(a.getCreateTime()))
                .limit(count != null ? count : 8)
                .collect(Collectors.toList());
    }

    @Override
    public List<Movie> getSimilarMovies(Integer movieId, String genre, Integer count) {
        List<Movie> movies = movieRepository.findByGenreContainingIgnoreCase(genre);
        return movies.stream()
                .filter(m -> !m.getMovieId().equals(movieId))
                .limit(count != null ? count : 8)
                .collect(Collectors.toList());
    }

    @Override
    public List<Movie> getMoviesByIds(List<Integer> movieIds) {
        return movieRepository.findAll().stream()
                .filter(m -> movieIds.contains(m.getMovieId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getTagsByMovieId(Integer movieId) {
        Optional<Movie> movie = movieRepository.findById(movieId);
        if (movie.isPresent()) {
            String genre = movie.get().getGenre();
            return genre != null ? List.of(genre.split(",")) : List.of();
        }
        return List.of();
    }

    @Override
    public List<String> getSearchSuggestions(String keyword) {
        return movieRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword).stream()
                .limit(10)
                .map(Movie::getTitle)
                .collect(Collectors.toList());
    }

    @Override
    public int insert(Movie movie) {
        movieRepository.save(movie);
        return 1;
    }

    @Override
    public int update(Movie movie) {
        movieRepository.save(movie);
        return 1;
    }

    @Override
    public List<Movie> getMoviesByGenre(String genre, int count) {
        return movieRepository.findByGenreContainingIgnoreCase(genre).stream()
                .limit(count)
                .collect(Collectors.toList());
    }
}

