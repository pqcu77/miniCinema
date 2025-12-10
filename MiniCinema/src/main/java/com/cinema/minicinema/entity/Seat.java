package com.cinema.minicinema.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Seat {
    private Integer seatId;
    private Integer hallId;
    private Integer rowNum;
    private Integer colNum;
    private String seatLabel; // A1, B5, C10
    private String seatStatus; // AVAILABLE, BROKEN, BLOCKED
    private LocalDateTime createTime;
}
