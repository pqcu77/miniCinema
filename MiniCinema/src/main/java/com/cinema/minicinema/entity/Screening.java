package com.cinema.minicinema.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("screenings")
public class Screening {
    @TableId(type = IdType.AUTO)
    private Integer screeningId;

    private Integer movieId;
    private Integer cinemaId;
    private Integer hallId;
    private LocalDateTime screenTime;
    private BigDecimal price;
    private String languageType;
    private String videoType;
    private Integer availableSeats;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}