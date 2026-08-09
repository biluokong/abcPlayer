package com.biluo.player.mode.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 解析元素
 * @author nz
 * @since 2026/8/5
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Token {
    /**
     * 类型
     */
    private String type;

    /**
     * 音符html字符串
     */
    private String noteStr;

    /**
     * 音符
     */
    private String note;

    /**
     * 八度数
     */
    private int octave;

    /**
     * 减时线数
     */
    private int halve;

    /**
     * 音符持续时间
     */
    private double duration;

    /**
     * 索引位置
     */
    private int index;

    public Token(String type) {
        this.type = type;
    }
}
