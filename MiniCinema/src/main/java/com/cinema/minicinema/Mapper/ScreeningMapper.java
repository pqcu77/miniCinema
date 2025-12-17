package com.cinema.minicinema.Mapper;

import lombok.Data;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Mapper
public interface ScreeningMapper {

        /**
         * 查询场次详细信息（用于座位锁定）
         */
        ScreeningDetailVO selectDetailById(@Param("screeningId") Integer screeningId);

        /**
         * 场次详情 VO
         */
        @Data
        public static class ScreeningDetailVO {
                private Integer screeningId;
                private Integer movieId;
                private Integer cinemaId;
                private Integer hallId;
                private String movieTitle;
                private String cinemaName;
                private String hallName;
                private LocalDateTime screenTime;
                private BigDecimal price;
                private String videoType;
                private Integer availableSeats;
        }
}