package com.cinema.minicinema.common.exception;

import com.cinema.minicinema.common.exception.BusinessException;
import com.cinema.minicinema.common.result.Result;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getMessage());
    }

    // 处理参数验证异常
    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public Result<?> handleValidException(Exception e) {
        String errorMsg = "参数验证失败";
        if (e instanceof MethodArgumentNotValidException) {
            errorMsg = ((MethodArgumentNotValidException) e).getBindingResult()
                    .getFieldErrors().get(0).getDefaultMessage();
        }
        log.warn("参数验证异常: {}", errorMsg);
        return Result.error(errorMsg);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public Result<?> handleConstraintViolationException(ConstraintViolationException e) {
        String errorMsg = e.getConstraintViolations().iterator().next().getMessage();
        log.warn("参数验证异常: {}", errorMsg);
        return Result.error(errorMsg);
    }

    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        try {
            // 开发环境返回真实错误，生产环境返回通用错误
            String errorMsg = "Unknown error";
            if (e != null && e.getMessage() != null) {
                errorMsg = e.getMessage();
            }
            return Result.error("ERROR: " + errorMsg);
        } catch (Exception ex) {
            // 如果处理异常时再出异常，返回安全的错误信息
            log.error("处理异常时发生错误", ex);
            return Result.error("System error occurred");
        }
    }
}