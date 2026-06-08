package com.biluo.player.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 * @author nz
 * @since 2026/5/20
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理所有未捕获的异常
     *
     * @param e 异常对象
     * @return 错误信息
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常: ", e);
        return Result.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "服务器内部错误: " + e.getMessage());
    }

    /**
     * 处理运行时异常
     *
     * @param e 运行时异常
     * @return 错误信息
     */
    @ExceptionHandler(RuntimeException.class)
    public Result<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: ", e);
        return Result.error(HttpStatus.BAD_REQUEST.value(), "请求处理失败: " + e.getMessage());
    }

    /**
     * 处理应用业务异常
     *
     * @param e 应用异常
     * @return 错误信息
     */
    @ExceptionHandler(AppException.class)
    public Result<Void> handleAppException(AppException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理非法参数异常
     *
     * @param e 非法参数异常
     * @return 错误信息
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public Result<Void> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("参数异常: {}", e.getMessage());
        return Result.error(HttpStatus.BAD_REQUEST.value(), "参数错误: " + e.getMessage());
    }
}
