package com.biluo.player.mode.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户token表
 * @TableName sys_user_token
 */
@TableName(value ="sys_user_token")
@Data
@Accessors(chain = true)
public class SysUserToken implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * JWT 的唯一标识（jti）
     */
    private String tokenJti;

    /**
     * token 的过期时间
     */
    private LocalDateTime tokenExpireTime;

    /**
     * 设备地址
     */
    private String deviceAddr;

    /**
     * 设备信息
     */
    private String deviceInfo;

    /**
     * 登录时间
     */
    private LocalDateTime loginTime;

    /**
     * 记录更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

}