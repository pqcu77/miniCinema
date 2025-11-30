package com.cinema.minicinema.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("halls")
public class Hall {
    @TableId(type = IdType.AUTO)
    private Integer hallId;

    private Integer cinemaId;
    private String hallName;
    private String hallType;
    private Integer totalSeats;
    private String seatLayout;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}