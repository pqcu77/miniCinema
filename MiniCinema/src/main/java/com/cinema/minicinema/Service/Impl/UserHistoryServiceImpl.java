package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Service.UserHistoryService;
import com.cinema.minicinema.entity.UserHistory;
import com.cinema.minicinema.Mapper.UserHistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserHistoryServiceImpl implements UserHistoryService {

    private final UserHistoryMapper userHistoryMapper;

    @Override
    @Transactional
    public void recordUserHistory(Integer userId, Integer movieId, Integer watchDuration) {
        UserHistory history = UserHistory.builder()
                .userId(userId.longValue())
                .movieId(movieId.longValue())
                .viewTime(LocalDateTime.now())
                .watchDuration(watchDuration)
                .createdAt(LocalDateTime.now())
                .build();

        // 这里需要修改，因为现有的upsert方法不兼容
        // 先记录为view动作
        UserHistory actionHistory = new UserHistory();
        actionHistory.setUserId(userId.longValue());
        actionHistory.setMovieId(movieId.longValue());
        actionHistory.setAction("view");
        actionHistory.setCreatedAt(LocalDateTime.now());

        userHistoryMapper.upsert(actionHistory);
    }
}