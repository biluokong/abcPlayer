package com.biluo.player.mode.vo;

import lombok.Data;

@Data
public class UserVo {
    /**
     * 昵称
     */
    private String nickname;

    /**
     * 旧密码
     */
    private String oldPassword;

    /**
     * 新密码
     */
    private String newPassword;
}
