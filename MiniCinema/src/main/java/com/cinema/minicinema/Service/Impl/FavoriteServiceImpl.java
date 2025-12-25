package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.FavoriteMapper;
import com.cinema.minicinema.entity.Favorite;
import com.cinema.minicinema.Service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteMapper favoriteMapper;

    @Override
    public boolean addFavorite(Long userId, Integer movieId) {
        if (favoriteMapper.countFavorite(userId, movieId) > 0) return false;
        Favorite f = new Favorite();
        f.setUserId(userId.intValue());
        f.setMovieId(movieId);
        f.setCreateTime(LocalDateTime.now());
        return favoriteMapper.addFavorite(f) > 0;
    }

    @Override
    public boolean removeFavorite(Long userId, Integer movieId) {
        return favoriteMapper.removeFavorite(userId, movieId) > 0;
    }

    @Override
    public List<Map<String, Object>> listFavorites(Long userId) {
        return favoriteMapper.listFavorites(userId);
    }

    @Override
    public boolean isFavorited(Long userId, Integer movieId) {
        return favoriteMapper.countFavorite(userId, movieId) > 0;
    }
}

