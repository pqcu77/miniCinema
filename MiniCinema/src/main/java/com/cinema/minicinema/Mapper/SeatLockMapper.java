package com.cinema.minicinema.Mapper;

import com.cinema.minicinema.entity.SeatLock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SeatLockMapper {

        // 只保留方法签名
        int insert(SeatLock seatLock);

        // 只保留方法签名
        List<SeatLock> selectActiveByScreeningId(@Param("screeningId") Integer screeningId);

        // 只保留方法签名
        List<SeatLock> selectByUserAndScreening(@Param("userId") Integer userId,
                        @Param("screeningId") Integer screeningId);

        // 只保留方法签名
        int cancelByUserAndScreening(@Param("userId") Integer userId,
                        @Param("screeningId") Integer screeningId);

        // 只保留方法签名
        int updateToPaid(@Param("lockIds") List<Integer> lockIds,
                        @Param("orderId") Integer orderId);

        // 只保留方法签名
        int releaseExpiredLocks();
}