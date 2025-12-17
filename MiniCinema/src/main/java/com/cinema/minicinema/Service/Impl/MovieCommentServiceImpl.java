package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Service.MovieCommentService;
import com.cinema.minicinema.entity.Movie;
import com.cinema.minicinema.entity.MovieComment;
import com.cinema.minicinema.Repository.MovieCommentRepository;
import com.cinema.minicinema.Repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieCommentServiceImpl implements MovieCommentService {

    private final MovieCommentRepository movieCommentRepository;
    private final MovieRepository movieRepository;

    @Override
    public MovieComment addComment(Long userId, Integer movieId, String content, BigDecimal rating) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("电影不存在"));

        MovieComment comment = new MovieComment();
        comment.setUserId(userId);
        comment.setMovieId(movie.getMovieId());
        comment.setContent(content);
        comment.setRating(rating);
        comment.setCreateTime(LocalDateTime.now());

        return movieCommentRepository.save(comment);
    }

    @Override
    public List<MovieComment> getComments(Integer movieId) {
        return movieCommentRepository.findByMovieIdOrderByCreateTimeDesc(movieId);
    }
}
