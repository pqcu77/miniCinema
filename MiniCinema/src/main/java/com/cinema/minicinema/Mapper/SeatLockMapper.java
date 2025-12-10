package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.SeatLock;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface SeatLockMapper {

    /**
     * 插入座位锁定记录
     */
    @Insert("INSERT INTO seat_locks(screening_id, seat_id, user_id, lock_time, expire_time, lock_status) " +
            "VALUES(#{screeningId}, #{seatId}, #{userId}, #{lockTime}, #{expireTime}, #{lockStatus})")
    @Options(useGeneratedKeys = true, keyProperty = "lockId")
    int insert(SeatLock seatLock);

    /**
     * 查询场次的所有有效锁定记录（未过期且未取消）
     */
    @Select("SELECT * FROM seat_locks " +
            "WHERE screening_id = #{screeningId} " +
            "AND lock_status IN ('LOCKED', 'PAID') " +
            "AND expire_time > NOW()")
    List<SeatLock> selectActiveByScreeningId(Integer screeningId);

    /**
     * 查询用户在某场次的锁定记录
     */
    @Select("SELECT * FROM seat_locks " +
            "WHERE user_id = #{userId} " +
            "AND screening_id = #{screeningId} " +
            "AND lock_status = 'LOCKED' " +
            "AND expire_time > NOW()")
    List<SeatLock> selectByUserAndScreening(@Param("userId") Integer userId,
            @Param("screeningId") Integer screeningId);

    /**
     * 更新锁定状态为已支付
     */
    @Update("UPDATE seat_locks SET lock_status = 'PAID', order_id = #{orderId} " +
            "WHERE lock_id IN " +
            "<script>" +
            "<foreach collection='lockIds' item='id' open='(' separator=',' close=')'>" +
            "#{id}" +
            "</foreach>" +
            "</script>")
    int updateToPaid(@Param("lockIds") List<Integer> lockIds, @Param("orderId") Integer orderId);

    /**
     * 取消用户的锁定
     */
    @Update("UPDATE seat_locks SET lock_status = 'CANCELLED' " +
            "WHERE user_id = #{userId} " +
            "AND screening_id = #{screeningId} " +
            "AND lock_status = 'LOCKED'")
    int cancelByUserAndScreening(@Param("userId") Integer userId,
            @Param("screeningId") Integer screeningId);

    /**
     * 释放过期的锁定（定时任务调用）
     */
    @Update("UPDATE seat_locks SET lock_status = 'EXPIRED' " +
            "WHERE lock_status = 'LOCKED' AND expire_time < NOW()")
    int releaseExpiredLocks();

    /**
     * 统计某场次已售出的座位数
     */
    @Select("SELECT COUNT(*) FROM seat_locks " +
            "WHERE screening_id = #{screeningId} AND lock_status = 'PAID'")
    int countSoldSeats(Integer screeningId);
}