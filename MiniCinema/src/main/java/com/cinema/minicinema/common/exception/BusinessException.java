package com.cinema.minicinema.common.exception;

import lombok.Getter;

/**
 * 自定义业务异常
 */
@Getter
public class BusinessException extends RuntimeException {
    private final Integer code;

    public BusinessException(String msg) {
        super(msg);
        this.code = 0; // 默认错误码
    }

    public BusinessException(Integer code, String msg) {
        super(msg);
        this.code = code;
    }
}