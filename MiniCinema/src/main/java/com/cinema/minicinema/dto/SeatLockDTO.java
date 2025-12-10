package com.cinema.minicinema.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 座位锁定请求
 */
@Data
public class SeatLockDTO {
    @NotNull(message = "场次ID不能为空")
    private Integer screeningId;

    @NotEmpty(message = "请选择座位")
    private List<Integer> seatIds; // 要锁定的座位ID列表

    @NotNull(message = "用户ID不能为空")
    private Integer userId;
}