package com.cinema.minicinema.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("orders")
public class Order {
    @TableId(type = IdType.AUTO)
    private Integer orderId;

    private String orderNumber;
    private Integer userId;
    private Integer screeningId;
    private String seatInfo;
    private Integer seatCount;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime payTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}