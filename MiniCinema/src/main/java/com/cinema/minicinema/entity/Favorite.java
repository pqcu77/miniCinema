package com.cinema.minicinema.entity;


import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("favorites")
public class Favorite {
    @TableId(type = IdType.AUTO)
    private Integer favoriteId;

    private Integer userId;
    private Integer movieId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}