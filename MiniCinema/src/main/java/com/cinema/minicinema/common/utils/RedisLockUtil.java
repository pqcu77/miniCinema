package com.cinema.minicinema.common.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Redis 分布式锁工具类
 */
@Slf4j
@Component
public class RedisLockUtil {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 尝试获取分布式锁
     * 
     * @param lockKey    锁的key
     * @param requestId  请求标识（用于释放锁时验证）
     * @param expireTime 过期时间（秒）
     * @return 是否获取成功
     */
    public boolean tryLock(String lockKey, String requestId, long expireTime) {
        try {
            // setIfAbsent = setnx，只有 key 不存在时才设置成功
            Boolean result = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, requestId, expireTime, TimeUnit.SECONDS);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            log.error("获取 Redis 锁失败: {}", lockKey, e);
            return false;
        }
    }

    /**
     * 释放分布式锁
     * 
     * @param lockKey   锁的key
     * @param requestId 请求标识（防止误删其他线程的锁）
     */
    public void unlock(String lockKey, String requestId) {
        try {
            Object value = redisTemplate.opsForValue().get(lockKey);
            if (requestId.equals(value)) {
                redisTemplate.delete(lockKey);
                log.debug("释放 Redis 锁: {}", lockKey);
            }
        } catch (Exception e) {
            log.error("释放 Redis 锁失败: {}", lockKey, e);
        }
    }

    /**
     * 生成唯一的请求ID
     */
    public String generateRequestId() {
        return UUID.randomUUID().toString();
    }
}
