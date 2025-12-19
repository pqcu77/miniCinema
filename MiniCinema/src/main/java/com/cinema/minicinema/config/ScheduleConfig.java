package com.cinema.minicinema.config;

import com.cinema.minicinema.Service.SeatLockService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling
public class ScheduleConfig {

    @Autowired
    private SeatLockService seatLockService;

    @Scheduled(cron = "0 * * * * ?")
    public void releaseExpiredSeats() {
        seatLockService.releaseExpiredLocks();
    }
}