package com.cinema.minicinema.Service;

import com.cinema.minicinema.entity.MovieComment;

import java.math.BigDecimal;
import java.util.List;

public interface MovieCommentService {

    MovieComment addComment(Long userId, Integer movieId, String content, BigDecimal rating);

    List<MovieComment> getComments(Integer movieId);
}

