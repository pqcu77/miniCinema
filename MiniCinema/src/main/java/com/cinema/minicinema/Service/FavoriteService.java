package com.cinema.minicinema.Service;

import java.util.List;
import java.util.Map;

public interface FavoriteService {
    boolean addFavorite(Long userId, Integer movieId);
    boolean removeFavorite(Long userId, Integer movieId);
    List<Map<String, Object>> listFavorites(Long userId);
    boolean isFavorited(Long userId, Integer movieId);
}

