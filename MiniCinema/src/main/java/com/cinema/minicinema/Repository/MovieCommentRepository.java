package com.cinema.minicinema.Repository;

import com.cinema.minicinema.entity.MovieComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieCommentRepository extends JpaRepository<MovieComment, Long> {
    List<MovieComment> findByMovieIdOrderByCreateTimeDesc(Integer movieId);
}
