package com.cinema.minicinema.Service;

public interface UserHistoryService {
    void recordUserHistory(Integer userId, Integer movieId, Integer watchDuration);
}