package com.cinema.minicinema.Service;

import com.cinema.minicinema.dto.SeatLockDTO;
import com.cinema.minicinema.dto.ScreeningSeatDTO;
import java.util.List;

public interface SeatLockService {

    ScreeningSeatDTO getScreeningSeats(Integer screeningId, Integer userId);

    List<Integer> lockSeats(SeatLockDTO lockDTO);

    void unlockSeats(Integer userId, Integer screeningId);

    void confirmSeats(Integer userId, Integer screeningId, Integer orderId);

    void releaseExpiredLocks();
}