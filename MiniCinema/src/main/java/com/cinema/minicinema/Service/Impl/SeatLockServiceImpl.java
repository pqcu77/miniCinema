package com.cinema.minicinema.Service.Impl;

import com.cinema.minicinema.Mapper.*;
import com.cinema.minicinema.Service.SeatLockService;
import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.common.utils.RedisLockUtil;
import com.cinema.minicinema.dto.*;
import com.cinema.minicinema.entity.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SeatLockServiceImpl implements SeatLockService {

    @Autowired
    private SeatMapper seatMapper;

    @Autowired
    private SeatLockMapper seatLockMapper;

    @Autowired
    private ScreeningMapper screeningMapper;

    @Autowired
    private RedisLockUtil redisLockUtil;

    private static final int LOCK_MINUTES = 15;

    @Override
    public ScreeningSeatDTO getScreeningSeats(Integer screeningId, Integer userId) {
        ScreeningMapper.ScreeningDetailVO screening = screeningMapper.selectDetailById(screeningId);
        if (screening == null) {
            throw new BusinessException("场次不存在");
        }

        List<Seat> seats = seatMapper.selectByHallId(screening.getHallId());
        if (seats.isEmpty()) {
            throw new BusinessException("该影厅暂无座位信息");
        }

        List<SeatLock> locks = seatLockMapper.selectActiveByScreeningId(screeningId);
        Map<Integer, SeatLock> lockMap = locks.stream()
                .collect(Collectors.toMap(SeatLock::getSeatId, lock -> lock));

        List<SeatStatusDTO> seatStatusList = new ArrayList<>();
        for (Seat seat : seats) {
            SeatStatusDTO dto = new SeatStatusDTO();
            dto.setSeatId(seat.getSeatId());
            dto.setRowNum(seat.getRowNum());
            dto.setColNum(seat.getColNum());
            dto.setSeatLabel(seat.getSeatLabel());

            if ("BROKEN".equals(seat.getSeatStatus()) || "BLOCKED".equals(seat.getSeatStatus())) {
                dto.setStatus("BROKEN");
            } else {
                SeatLock lock = lockMap.get(seat.getSeatId());
                if (lock == null) {
                    dto.setStatus("AVAILABLE");
                } else if ("PAID".equals(lock.getLockStatus())) {
                    dto.setStatus("SOLD");
                } else if ("LOCKED".equals(lock.getLockStatus())) {
                    // ✅ 修改这里：区分是当前用户还是其他用户锁定
                    if (lock.getUserId().equals(userId)) {
                        dto.setStatus("LOCKED_BY_SELF"); // 当前用户锁定
                        dto.setLockedByUserId(userId);
                    } else {
                        dto.setStatus("LOCKED_BY_OTHER"); // 其他用户锁定
                    }

                    long seconds = ChronoUnit.SECONDS.between(LocalDateTime.now(), lock.getExpireTime());
                    dto.setRemainingSeconds(Math.max(0, seconds));
                }
            }

            seatStatusList.add(dto);
        }

        ScreeningSeatDTO result = new ScreeningSeatDTO();
        result.setScreeningId(screening.getScreeningId());
        result.setMovieTitle(screening.getMovieTitle());
        result.setCinemaName(screening.getCinemaName());
        result.setHallName(screening.getHallName());
        result.setScreenTime(screening.getScreenTime());
        result.setPrice(screening.getPrice());
        result.setVideoType(screening.getVideoType());
        result.setAvailableSeats(screening.getAvailableSeats());

        int maxRow = seats.stream().mapToInt(Seat::getRowNum).max().orElse(0);
        int maxCol = seats.stream().mapToInt(Seat::getColNum).max().orElse(0);
        result.setTotalRows(maxRow);
        result.setSeatsPerRow(maxCol);
        result.setSeats(seatStatusList);

        return result;
    }

    /**
     * 锁定座位（使用 Redis 分布式锁）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<Integer> lockSeats(SeatLockDTO lockDTO) {
        Integer screeningId = lockDTO.getScreeningId();
        Integer userId = lockDTO.getUserId();
        List<Integer> seatIds = lockDTO.getSeatIds();

        log.info("用户 {} 尝试锁定场次 {} 的座位 {}", userId, screeningId, seatIds);

        // 1. 参数校验
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BusinessException("请选择座位");
        }

        if (seatIds.size() > 10) {
            throw new BusinessException("单次最多只能选择10个座位");
        }

        // 2. 查询座位信息
        List<Seat> seats = seatMapper.selectByIds(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new BusinessException("部分座位不存在");
        }

        // 3. 检查座位状态
        List<Integer> brokenSeats = seats.stream()
                .filter(s -> !"AVAILABLE".equals(s.getSeatStatus()))
                .map(Seat::getSeatId)
                .collect(Collectors.toList());
        if (!brokenSeats.isEmpty()) {
            throw new BusinessException("座位 " + brokenSeats + " 不可选");
        }

        // 4. 使用 Redis 分布式锁
        String lockKey = "seat:lock:screening:" + screeningId;
        String requestId = redisLockUtil.generateRequestId();

        // 尝试获取锁，最多等待 30 秒
        boolean locked = false;
        int retryCount = 0;
        int maxRetry = 30;

        while (!locked && retryCount < maxRetry) {
            locked = redisLockUtil.tryLock(lockKey, requestId, 30);
            if (!locked) {
                retryCount++;
                try {
                    Thread.sleep(1000); // 等待1秒后重试
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new BusinessException("系统异常，请重试");
                }
            }
        }

        if (!locked) {
            throw new BusinessException("系统繁忙，请稍后重试");
        }

        try {
            log.info("用户 {} 获取到 Redis 分布式锁", userId);

            // 5. 查询已锁定的座位
            List<SeatLock> existingLocks = seatLockMapper.selectActiveByScreeningId(screeningId);
            Map<Integer, SeatLock> lockedSeatMap = existingLocks.stream()
                    .collect(Collectors.toMap(SeatLock::getSeatId, l -> l));

            // 6. 检查座位是否被其他用户锁定
            List<Integer> unavailableSeats = new ArrayList<>();
            for (Integer seatId : seatIds) {
                SeatLock existingLock = lockedSeatMap.get(seatId);
                if (existingLock != null && !existingLock.getUserId().equals(userId)) {
                    unavailableSeats.add(seatId);
                }
            }

            if (!unavailableSeats.isEmpty()) {
                throw new BusinessException("座位 " + unavailableSeats + " 已被选走，请重新选择");
            }

            // 7. 取消用户之前的锁定
            seatLockMapper.cancelByUserAndScreening(userId, screeningId);

            // 8. 插入新的锁定记录
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expireTime = now.plusMinutes(LOCK_MINUTES);

            List<Integer> lockedSeatIds = new ArrayList<>();
            for (Integer seatId : seatIds) {
                SeatLock seatLock = new SeatLock();
                seatLock.setScreeningId(screeningId);
                seatLock.setSeatId(seatId);
                seatLock.setUserId(userId);
                seatLock.setLockTime(now);
                seatLock.setExpireTime(expireTime);
                seatLock.setLockStatus("LOCKED");

                seatLockMapper.insert(seatLock);
                lockedSeatIds.add(seatId);
            }

            log.info("用户 {} 成功锁定 {} 个座位，过期时间: {}", userId, lockedSeatIds.size(), expireTime);
            return lockedSeatIds;

        } finally {
            // 9. 释放锁
            redisLockUtil.unlock(lockKey, requestId);
            log.info("用户 {} 释放 Redis 分布式锁", userId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unlockSeats(Integer userId, Integer screeningId) {
        log.info("用户 {} 取消场次 {} 的座位锁定", userId, screeningId);
        int count = seatLockMapper.cancelByUserAndScreening(userId, screeningId);
        log.info("已取消 {} 个座位的锁定", count);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmSeats(Integer userId, Integer screeningId, Integer orderId) {
        log.info("用户 {} 支付成功，确认场次 {} 的座位，订单ID: {}", userId, screeningId, orderId);

        List<SeatLock> locks = seatLockMapper.selectByUserAndScreening(userId, screeningId);
        if (locks.isEmpty()) {
            throw new BusinessException("未找到锁定记录，可能已过期");
        }

        List<Integer> lockIds = locks.stream()
                .map(SeatLock::getLockId)
                .collect(Collectors.toList());

        int count = seatLockMapper.updateToPaid(lockIds, orderId);
        log.info("已确认 {} 个座位", count);
    }

    @Override
    public void releaseExpiredLocks() {
        int count = seatLockMapper.releaseExpiredLocks();
        if (count > 0) {
            log.info("自动释放了 {} 个过期的座位锁定", count);
        }
    }
}