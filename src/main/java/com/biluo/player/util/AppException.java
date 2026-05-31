package com.biluo.player.util;

import lombok.Getter;

/**
 * 应用业务异常类
 * 用于处理业务逻辑中的异常情况
 *
 * @author biluo
 * @since 2026/5/25
 */
@Getter
public class AppException extends RuntimeException {

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 错误消息
     */
    private final String message;

    /**
     * 构造方法（默认错误码500）
     *
     * @param message 错误消息
     */
    public AppException(String message) {
        super(message);
        this.code = 500;
        this.message = message;
    }

    /**
     * 构造方法（自定义错误码）
     *
     * @param code    错误码
     * @param message 错误消息
     */
    public AppException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    /**
     * 构造方法（带cause）
     *
     * @param message 错误消息
     * @param cause   原始异常
     */
    public AppException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
        this.message = message;
    }

    /**
     * 构造方法（自定义错误码和cause）
     *
     * @param code    错误码
     * @param message 错误消息
     * @param cause   原始异常
     */
    public AppException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
    }
}
