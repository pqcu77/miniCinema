package com.cinema.minicinema.Controller;

import com.cinema.minicinema.Service.SeatLockService;
import com.cinema.minicinema.common.result.Result;
import com.cinema.minicinema.dto.SeatLockDTO;
import com.cinema.minicinema.dto.ScreeningSeatDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/seats")
public class SeatController {

    @Autowired
    private SeatLockService seatLockService;

    @GetMapping("/screening/{screeningId}")
    public Result<ScreeningSeatDTO> getScreeningSeats(
            @PathVariable Integer screeningId,
            @RequestParam Integer userId) {
        ScreeningSeatDTO seats = seatLockService.getScreeningSeats(screeningId, userId);
        return Result.success(seats);
    }

    @PostMapping("/lock")
    public Result<List<Integer>> lockSeats(@Validated @RequestBody SeatLockDTO lockDTO) {
        List<Integer> lockedSeats = seatLockService.lockSeats(lockDTO);
        return Result.success(lockedSeats, "座位锁定成功，请在15分钟内完成支付");
    }

    @PostMapping("/unlock")
    public Result<Void> unlockSeats(@RequestParam Integer userId, @RequestParam Integer screeningId) {
        seatLockService.unlockSeats(userId, screeningId);
        return Result.success(null, "已取消座位锁定");
    }
}