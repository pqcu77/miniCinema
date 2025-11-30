package com.cinema.minicinema.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cinemas")
public class Cinema {
    @TableId(type = IdType.AUTO)
    private Integer cinemaId;

    private String name;
    private String address;
    private String city;
    private String district;
    private String phone;
    private String facilities;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}