package com.biluo.player.util;

import com.biluo.player.util.converter.FqToAbcConverter;
import com.biluo.player.util.converter.ToDdpConverter;

import java.util.Map;

/**
 * 不同谱转换工具类
 * @author nz
 * @since 2026/8/5
 */
public class ConverterUtil {

    /**
     * 将番茄简谱字符串转换为ABC谱格式的字符串
     * @param fqStr 番茄简谱格式字符串
     * @return ABC谱格式字符串
     */
    public static String convertFqToAbc(String fqStr) {
        return FqToAbcConverter.convert(fqStr);
    }


    /**
     * 简谱字符串转换为洞洞谱
     * @param text 简谱字符串
     * @param mode 模式
     * @param tune 调性
     * @return 洞洞谱
     */
    public static Map<String, Object> convertToDdp(String text, int mode, String tune) {
        return ToDdpConverter.convertToDdp(text, mode, tune);
    }
}
