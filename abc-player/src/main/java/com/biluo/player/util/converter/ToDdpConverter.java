package com.biluo.player.util.converter;

import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.biluo.player.mode.vo.Token;
import com.biluo.player.util.AppException;

import java.util.*;

/**
 * 简谱转洞洞谱转换器
 * @author nz
 * @since 2026/8/7
 */
public class ToDdpConverter {
    // 支持的指法模式和哨笛调性
    public static final List<Integer> MODE_LIST = Arrays.asList(1, 2, 5);
    public static final List<String> TUNE_LIST = Arrays.asList("A", "Bb", "C", "D", "F", "G");

    // 指法映射表
    private static final Map<Integer, Map<String, int[]>> POSITIONS = new LinkedHashMap<>();

    static {
        // 筒音作 1
        Map<String, int[]> mode1 = new LinkedHashMap<>();
        // 第一个八度
        mode1.put("1_0", new int[]{2, 2, 2, 2, 2, 2});
        mode1.put("#1_0,b2_0", new int[]{2, 2, 2, 2, 2, 1});
        mode1.put("2_0", new int[]{2, 2, 2, 2, 2, 0});
        mode1.put("#2_0,b3_0", new int[]{2, 2, 2, 2, 1, 0});
        mode1.put("3_0,b4_0", new int[]{2, 2, 2, 2, 0, 0});
        mode1.put("4_0,#3_0", new int[]{2, 2, 2, 0, 0, 0});
        // '4_0,#3_0': [2, 2, 1, 0, 0, 0],
        mode1.put("#4_0,b5_0", new int[]{2, 2, 0, 2, 2, 2});
        mode1.put("5_0", new int[]{2, 2, 0, 0, 0, 0});
        // '#5_0,b6_0': [2, 1, 0, 0, 0, 0],
        mode1.put("#5_0,b6_0", new int[]{2, 0, 2, 2, 2, 2});
        mode1.put("6_0", new int[]{2, 0, 0, 0, 0, 0});
        // '#6_0,b7_0': [1, 0, 0, 0, 0, 0],
        mode1.put("#6_0,b7_0", new int[]{0, 2, 2, 0, 0, 0});
        mode1.put("7_0,b1_1", new int[]{0, 0, 0, 0, 0, 0});
        // '7_0,b1_1':  [0, 0, 0, 2, 2, 2],

        // 第二个八度
        // '1_1,#7_0':      [2, 2, 2, 2, 2, 2],
        mode1.put("1_1,#7_0", new int[]{0, 2, 2, 2, 2, 2});
        // '1_1,#7_0':      [1, 2, 2, 2, 2, 2],
        mode1.put("#1_1,b2_1", new int[]{2, 2, 2, 2, 2, 1});
        mode1.put("2_1", new int[]{2, 2, 2, 2, 2, 0});
        mode1.put("#2_1,b3_1", new int[]{2, 2, 2, 2, 1, 0});
        mode1.put("3_1,b4_1", new int[]{2, 2, 2, 2, 0, 0});
        mode1.put("4_1,#3_1", new int[]{2, 2, 2, 0, 0, 0});
        mode1.put("#4_1,b5_1", new int[]{2, 2, 1, 0, 0, 0});
        mode1.put("5_1", new int[]{2, 2, 0, 0, 0, 0});
        mode1.put("#5_1,b6_1", new int[]{2, 1, 0, 0, 0, 0});
        mode1.put("6_1", new int[]{2, 0, 0, 0, 0, 0});
        // '#6_1,b7_1': [1, 0, 0, 0, 0, 0],
        mode1.put("#6_1,b7_1", new int[]{0, 2, 2, 2, 2, 0});
        mode1.put("7_1,b1_2", new int[]{0, 0, 0, 0, 0, 0});
        // '7_1,b1_2':  [0, 0, 0, 2, 2, 2],

        // 第三个八度
        mode1.put("1_2,#7_1", new int[]{0, 2, 2, 0, 0, 0});
        mode1.put("#1_2,b2_2", null);
        mode1.put("2_2", new int[]{2, 2, 0, 2, 2, 0});
        // '2_2':      [2, 2, 0, 0, 0, 2],
        mode1.put("#2_2,b3_2", null);
        mode1.put("3_2,b4_2", new int[]{2, 1, 2, 2, 2, 2});
        mode1.put("4_2,#3_2", new int[]{2, 0, 2, 0, 0, 2});

        POSITIONS.put(1, mode1);

        // 筒音作 2
        Map<String, int[]> mode2 = new LinkedHashMap<>();
        // 第一个八度
        mode2.put("2_0", new int[]{2, 2, 2, 2, 2, 2});
        mode2.put("#2_0,b3_0", new int[]{2, 2, 2, 2, 2, 1});
        mode2.put("3_0,b4_0", new int[]{2, 2, 2, 2, 2, 0});
        mode2.put("4_0,#3_0", new int[]{2, 2, 2, 2, 1, 0});
        mode2.put("#4_0,b5_0", new int[]{2, 2, 2, 2, 0, 0});
        mode2.put("5_0", new int[]{2, 2, 2, 0, 0, 0});
        mode2.put("#5_0,b6_0", new int[]{2, 2, 0, 2, 2, 2});
        mode2.put("6_0", new int[]{2, 2, 0, 0, 0, 0});
        mode2.put("#6_0,b7_0", new int[]{2, 0, 2, 2, 2, 2});
        mode2.put("7_0,b1_1", new int[]{2, 0, 0, 0, 0, 0});

        // 第二个八度
        mode2.put("1_1,#7_0", new int[]{0, 2, 2, 0, 0, 0});
        mode2.put("#1_1,b2_1", new int[]{0, 0, 0, 0, 0, 0});
        mode2.put("2_1", new int[]{0, 2, 2, 2, 2, 2});
        mode2.put("#2_1,b3_1", new int[]{2, 2, 2, 2, 2, 1});
        mode2.put("3_1,b4_1", new int[]{2, 2, 2, 2, 2, 0});
        mode2.put("4_1,#3_1", new int[]{2, 2, 2, 2, 1, 0});
        mode2.put("#4_1,b5_1", new int[]{2, 2, 2, 2, 0, 0});
        mode2.put("5_1", new int[]{2, 2, 2, 0, 0, 0});
        mode2.put("#5_1,b6_1", new int[]{2, 2, 1, 0, 0, 0});
        mode2.put("6_1", new int[]{2, 2, 0, 0, 0, 0});
        mode2.put("#6_1,b7_1", new int[]{2, 1, 0, 0, 0, 0});
        mode2.put("7_1,b1_2", new int[]{2, 0, 0, 0, 0, 0});

        // 第三个八度
        mode2.put("1_2,#7_1", new int[]{0, 2, 2, 2, 2, 0});
        mode2.put("#1_2,b2_2", new int[]{0, 0, 0, 0, 0, 0});
        mode2.put("2_2", new int[]{0, 2, 2, 0, 0, 0});
        mode2.put("#2_2,b3_2", null);
        mode2.put("3_2,b4_2", new int[]{2, 2, 0, 2, 2, 0});
        mode2.put("4_2,#3_2", null);
        mode2.put("#4_2,b5_2", new int[]{2, 1, 2, 2, 2, 2});
        mode2.put("5_2", new int[]{2, 0, 2, 0, 0, 2});

        POSITIONS.put(2, mode2);

        // 筒音作 5
        Map<String, int[]> mode5 = new LinkedHashMap<>();
        // 第一个八度
        mode5.put("5_-1", new int[]{2, 2, 2, 2, 2, 2});
        mode5.put("#5_-1,b6_-1", new int[]{2, 2, 2, 2, 2, 1});
        mode5.put("6_-1", new int[]{2, 2, 2, 2, 2, 0});
        mode5.put("#6_-1,b7_-1", new int[]{2, 2, 2, 2, 1, 0});
        mode5.put("7_-1,b1_0", new int[]{2, 2, 2, 2, 0, 0});

        // 第二个八度
        mode5.put("1_0", new int[]{2, 2, 2, 0, 0, 0});
        mode5.put("#1_0,b2_0", new int[]{2, 2, 0, 2, 2, 2});
        mode5.put("2_0", new int[]{2, 2, 0, 0, 0, 0});
        mode5.put("#2_0,b3_0", new int[]{2, 0, 2, 2, 2, 2});
        mode5.put("3_0,b4_0", new int[]{2, 0, 0, 0, 0, 0});
        mode5.put("4_0,#3_0", new int[]{0, 2, 2, 0, 0, 0});
        mode5.put("#4_0,b5_0", new int[]{0, 0, 0, 0, 0, 0});
        mode5.put("5_0", new int[]{0, 2, 2, 2, 2, 2});
        mode5.put("#5_0,b6_0", new int[]{2, 2, 2, 2, 2, 1});
        mode5.put("6_0", new int[]{2, 2, 2, 2, 2, 0});
        mode5.put("#6_0,b7_0", new int[]{2, 2, 2, 2, 1, 0});
        mode5.put("7_0,b1_1", new int[]{2, 2, 2, 2, 0, 0});

        // 第三个八度
        mode5.put("1_1,#7_0", new int[]{2, 2, 2, 0, 0, 0});
        mode5.put("#1_1,b2_1", new int[]{2, 2, 1, 0, 0, 0});
        mode5.put("2_1", new int[]{2, 2, 0, 0, 0, 0});
        mode5.put("#2_1,b3_1", new int[]{2, 1, 0, 0, 0, 0});
        mode5.put("3_1,b4_1", new int[]{2, 0, 0, 0, 0, 0});
        mode5.put("4_1,#3_1", new int[]{0, 2, 2, 2, 2, 0});
        mode5.put("#4_1,b5_1", new int[]{0, 0, 0, 0, 0, 0});
        mode5.put("5_1", new int[]{0, 2, 2, 0, 0, 0});
        mode5.put("#5_1,b6_1", null);
        mode5.put("6_1", new int[]{2, 2, 0, 2, 2, 0});
        mode5.put("#6_1,b7_1", null);
        mode5.put("7_1,b1_2", new int[]{2, 1, 2, 2, 2, 2});

        // 第四个八度
        mode5.put("1_2,#7_1", new int[]{2, 0, 2, 0, 0, 2});

        POSITIONS.put(5, mode5);
    }
    // 位置映射表（用于快速查找）
    private static final Map<Integer, Map<String, int[]>> POSITION_MAP = new HashMap<>();

    static {
        POSITIONS.forEach((mode, fingeringMap) -> {
            Map<String, int[]> resolvedMap = new HashMap<>();
            fingeringMap.forEach((key, value) -> {
                // 按逗号分割key
                String[] keys = key.split(",");
                for (String k : keys) {
                    resolvedMap.put(k, value);
                }
                POSITION_MAP.put(mode, resolvedMap);
            });
        });
    }

    // 频率映射表
    private static final Map<String, Map<Integer, Map<String, Double>>> FREQUENCIES = new HashMap<>();

    static {
        /// A调哨笛
        Map<Integer, Map<String, Double>> aFreqMap = new HashMap<>();
        // ================= 筒音作 1（A 大调） =================
        Map<String, Double> map1 = new HashMap<>();
        // 第一个八度
        map1.put("1_0", 440.00);
        map1.put("#1_0,b2_0", 466.16);
        map1.put("2_0", 493.88);
        map1.put("#2_0,b3_0", 523.25);
        map1.put("3_0,b4_0", 554.37);
        map1.put("4_0,#3_0", 587.33);
        map1.put("#4_0,b5_0", 622.25);
        map1.put("5_0", 659.25);
        map1.put("#5_0,b6_0", 698.46);
        map1.put("6_0", 739.99);
        map1.put("#6_0,b7_0", 783.99);
        map1.put("7_0,b1_1", 830.61);
        // 第二个八度
        map1.put("1_1,#7_0", 880.00);
        map1.put("#1_1,b2_1", 932.33);
        map1.put("2_1", 987.77);
        map1.put("#2_1,b3_1", 1046.50);
        map1.put("3_1,b4_1", 1108.73);
        map1.put("4_1,#3_1", 1174.66);
        map1.put("#4_1,b5_1", 1244.51);
        map1.put("5_1", 1318.51);
        map1.put("#5_1,b6_1", 1396.91);
        map1.put("6_1", 1479.98);
        map1.put("#6_1,b7_1", 1567.98);
        map1.put("7_1,b1_2", 1661.22);
        // 第三个八度
        map1.put("1_2,#7_1", 1760.00);
        map1.put("#1_2,b2_2", null);
        map1.put("2_2", 1975.53);
        map1.put("#2_2,b3_2", null);
        map1.put("3_2,b4_2", 2217.46);
        map1.put("4_2,#3_2", 2349.32);
        aFreqMap.put(1, map1);

        // ================= 筒音作 2（G 大调） =================
        Map<String, Double> map2 = new HashMap<>();
        // 第一个八度
        map2.put("2_0", 440.00);
        map2.put("#2_0,b3_0", 466.16);
        map2.put("3_0,b4_0", 493.88);
        map2.put("4_0,#3_0", 523.25);
        map2.put("#4_0,b5_0", 554.37);
        map2.put("5_0", 587.33);
        map2.put("#5_0,b6_0", 622.25);
        map2.put("6_0", 659.25);
        map2.put("#6_0,b7_0", 698.46);
        map2.put("7_0,b1_1", 739.99);
        // 第二个八度
        map2.put("1_1,#7_0", 783.99);
        map2.put("#1_1,b2_1", 830.61);
        map2.put("2_1", 880.00);
        map2.put("#2_1,b3_1", 932.33);
        map2.put("3_1,b4_1", 987.77);
        map2.put("4_1,#3_1", 1046.50);
        map2.put("#4_1,b5_1", 1108.73);
        map2.put("5_1", 1174.66);
        map2.put("#5_1,b6_1", 1244.51);
        map2.put("6_1", 1318.51);
        map2.put("#6_1,b7_1", 1396.91);
        map2.put("7_1,b1_2", 1479.98);
        // 第三个八度
        map2.put("1_2,#7_1", 1567.98);
        map2.put("#1_2,b2_2", 1661.22);
        map2.put("2_2", 1760.00);
        map2.put("#2_2,b3_2", null);
        map2.put("3_2,b4_2", 1975.53);
        map2.put("4_2,#3_2", null);
        map2.put("#4_2,b5_2", 2093.00);
        map2.put("5_2", 2349.32);
        aFreqMap.put(2, map2);

        // ================= 筒音作 5（D 大调） =================
        Map<String, Double> map5 = new HashMap<>();
        // 第一个八度（低于主音 1 的音区）
        map5.put("5_-1", 440.00);
        map5.put("#5_-1,b6_-1", 466.16);
        map5.put("6_-1", 493.88);
        map5.put("#6_-1,b7_-1", 523.25);
        map5.put("7_-1,b1_0", 554.37);
        // 第二个八度（1 = D）
        map5.put("1_0,#7_-1", 587.33);
        map5.put("#1_0,b2_0", 622.25);
        map5.put("2_0", 659.25);
        map5.put("#2_0,b3_0", 698.46);
        map5.put("3_0,b4_0", 739.99);
        map5.put("4_0,#3_0", 783.99);
        map5.put("#4_0,b5_0", 830.61);
        map5.put("5_0", 880.00);
        map5.put("#5_0,b6_0", 932.33);
        map5.put("6_0", 987.77);
        map5.put("#6_0,b7_0", 1046.50);
        map5.put("7_0,b1_1", 1108.73);
        // 第三个八度
        map5.put("1_1,#7_0", 1174.66);
        map5.put("#1_1,b2_1", 1244.51);
        map5.put("2_1", 1318.51);
        map5.put("#2_1,b3_1", 1396.91);
        map5.put("3_1,b4_1", 1479.98);
        map5.put("4_1,#3_1", 1567.98);
        map5.put("#4_1,b5_1", 1661.22);
        map5.put("5_1", 1760.00);
        map5.put("#5_1,b6_1", null);
        map5.put("6_1", 1975.53);
        map5.put("#6_1,b7_1", null);
        map5.put("7_1,b1_2", 2217.46);
        // 第四个八度
        map5.put("1_2,#7_1", 2349.32);
        aFreqMap.put(5, map5);
        FREQUENCIES.put("A", aFreqMap);

        /// Bb调哨笛
        Map<Integer, Map<String, Double>> bBFreqMap = new HashMap<>();
        // ================= 筒音作 1（Bb 大调） =================
        map1 = new HashMap<>();
        // 第一个八度
        map1.put("1_0", 466.16);
        map1.put("#1_0,b2_0", 493.88);
        map1.put("2_0", 523.25);
        map1.put("#2_0,b3_0", 554.37);
        map1.put("3_0,b4_0", 587.33);
        map1.put("4_0,#3_0", 622.25);
        map1.put("#4_0,b5_0", 659.25);
        map1.put("5_0", 698.46);
        map1.put("#5_0,b6_0", 739.99);
        map1.put("6_0", 783.99);
        map1.put("#6_0,b7_0", 830.61);
        map1.put("7_0,b1_1", 880.00);
        // 第二个八度
        map1.put("1_1,#7_0", 932.33);
        map1.put("#1_1,b2_1", 987.77);
        map1.put("2_1", 1046.50);
        map1.put("#2_1,b3_1", 1108.73);
        map1.put("3_1,b4_1", 1174.66);
        map1.put("4_1,#3_1", 1244.51);
        map1.put("#4_1,b5_1", 1318.51);
        map1.put("5_1", 1396.91);
        map1.put("#5_1,b6_1", 1479.98);
        map1.put("6_1", 1567.98);
        map1.put("#6_1,b7_1", 1661.22);
        map1.put("7_1,b1_2", 1760.00);
        // 第三个八度
        map1.put("1_2,#7_1", 1864.66);
        map1.put("#1_2,b2_2", null);
        map1.put("2_2", 2093.00);
        map1.put("#2_2,b3_2", null);
        map1.put("3_2,b4_2", 2349.32);
        map1.put("4_2,#3_2", 2489.02);
        bBFreqMap.put(1, map1);

        // ================= 筒音作 2（Ab 大调） =================
        map2 = new HashMap<>();
        // 第一个八度
        map2.put("2_0", 466.16);
        map2.put("#2_0,b3_0", 493.88);
        map2.put("3_0,b4_0", 523.25);
        map2.put("4_0,#3_0", 554.37);
        map2.put("#4_0,b5_0", 587.33);
        map2.put("5_0", 622.25);
        map2.put("#5_0,b6_0", 659.25);
        map2.put("6_0", 698.46);
        map2.put("#6_0,b7_0", 739.99);
        map2.put("7_0,b1_1", 783.99);
        // 第二个八度
        map2.put("1_1,#7_0", 830.61);
        map2.put("#1_1,b2_1", 880.00);
        map2.put("2_1", 932.33);
        map2.put("#2_1,b3_1", 987.77);
        map2.put("3_1,b4_1", 1046.50);
        map2.put("4_1,#3_1", 1108.73);
        map2.put("#4_1,b5_1", 1174.66);
        map2.put("5_1", 1244.51);
        map2.put("#5_1,b6_1", 1318.51);
        map2.put("6_1", 1396.91);
        map2.put("#6_1,b7_1", 1479.98);
        map2.put("7_1,b1_2", 1567.98);
        // 第三个八度
        map2.put("1_2,#7_1", 1661.22);
        map2.put("#1_2,b2_2", 1760.00);
        map2.put("2_2", 1864.66);
        map2.put("#2_2,b3_2", null);
        map2.put("3_2,b4_2", 2093.00);
        map2.put("4_2,#3_2", null);
        map2.put("#4_2,b5_2", 2217.46);
        map2.put("5_2", 2349.32);
        bBFreqMap.put(2, map2);

        // ================= 筒音作 5（Eb 大调） =================
        map5 = new HashMap<>();
        // 第一个八度（低于主音 1 的音区）
        map5.put("5_-1", 466.16);
        map5.put("#5_-1,b6_-1", 493.88);
        map5.put("6_-1", 523.25);
        map5.put("#6_-1,b7_-1", 554.37);
        map5.put("7_-1,b1_0", 587.33);
        // 第二个八度（1 = Eb）
        map5.put("1_0,#7_-1", 622.25);
        map5.put("#1_0,b2_0", 659.25);
        map5.put("2_0", 698.46);
        map5.put("#2_0,b3_0", 739.99);
        map5.put("3_0,b4_0", 783.99);
        map5.put("4_0,#3_0", 830.61);
        map5.put("#4_0,b5_0", 880.00);
        map5.put("5_0", 932.33);
        map5.put("#5_0,b6_0", 987.77);
        map5.put("6_0", 1046.50);
        map5.put("#6_0,b7_0", 1108.73);
        map5.put("7_0,b1_1", 1174.66);
        // 第三个八度
        map5.put("1_1,#7_0", 1244.51);
        map5.put("#1_1,b2_1", 1318.51);
        map5.put("2_1", 1396.91);
        map5.put("#2_1,b3_1", 1479.98);
        map5.put("3_1,b4_1", 1567.98);
        map5.put("4_1,#3_1", 1661.22);
        map5.put("#4_1,b5_1", 1760.00);
        map5.put("5_1", 1864.66);
        map5.put("#5_1,b6_1", null);
        map5.put("6_1", 2093.00);
        map5.put("#6_1,b7_1", null);
        map5.put("7_1,b1_2", 2349.32);
        // 第四个八度
        map5.put("1_2,#7_1", 2489.02);
        bBFreqMap.put(5, map5);
        FREQUENCIES.put("Bb", bBFreqMap);

        /// C调哨笛
        Map<Integer, Map<String, Double>> cFreqMap = new HashMap<>();
        // ================= 筒音作 1（C 大调） =================
        map1 = new HashMap<>();
        // 第一个八度
        map1.put("1_0", 261.63);
        map1.put("#1_0,b2_0", 277.18);
        map1.put("2_0", 293.66);
        map1.put("#2_0,b3_0", 311.13);
        map1.put("3_0,b4_0", 329.63);
        map1.put("4_0,#3_0", 349.23);
        map1.put("#4_0,b5_0", 369.99);
        map1.put("5_0", 392.00);
        map1.put("#5_0,b6_0", 415.30);
        map1.put("6_0", 440.00);
        map1.put("#6_0,b7_0", 466.16);
        map1.put("7_0,b1_1", 493.88);
        // 第二个八度
        map1.put("1_1,#7_0", 523.25);
        map1.put("#1_1,b2_1", 554.37);
        map1.put("2_1", 587.33);
        map1.put("#2_1,b3_1", 622.25);
        map1.put("3_1,b4_1", 659.25);
        map1.put("4_1,#3_1", 698.46);
        map1.put("#4_1,b5_1", 739.99);
        map1.put("5_1", 783.99);
        map1.put("#5_1,b6_1", 830.61);
        map1.put("6_1", 880.00);
        map1.put("#6_1,b7_1", 932.33);
        map1.put("7_1,b1_2", 987.77);
        // 第三个八度
        map1.put("1_2,#7_1", 1046.50);
        map1.put("#1_2,b2_2", null);
        map1.put("2_2", 1174.66);
        map1.put("#2_2,b3_2", null);
        map1.put("3_2,b4_2", 1318.51);
        map1.put("4_2,#3_2", 1396.91);
        cFreqMap.put(1, map1);

        // ================= 筒音作 2（Bb 大调） =================
        map2 = new HashMap<>();
        // 第一个八度
        map2.put("2_0", 261.63);
        map2.put("#2_0,b3_0", 277.18);
        map2.put("3_0,b4_0", 293.66);
        map2.put("4_0,#3_0", 311.13);
        map2.put("#4_0,b5_0", 329.63);
        map2.put("5_0", 349.23);
        map2.put("#5_0,b6_0", 369.99);
        map2.put("6_0", 392.00);
        map2.put("#6_0,b7_0", 415.30);
        map2.put("7_0,b1_1", 440.00);
        // 第二个八度
        map2.put("1_1,#7_0", 466.16);
        map2.put("#1_1,b2_1", 493.88);
        map2.put("2_1", 523.25);
        map2.put("#2_1,b3_1", 554.37);
        map2.put("3_1,b4_1", 587.33);
        map2.put("4_1,#3_1", 622.25);
        map2.put("#4_1,b5_1", 659.25);
        map2.put("5_1", 698.46);
        map2.put("#5_1,b6_1", 739.99);
        map2.put("6_1", 783.99);
        map2.put("#6_1,b7_1", 830.61);
        map2.put("7_1,b1_2", 880.00);
        // 第三个八度
        map2.put("1_2,#7_1", 932.33);
        map2.put("#1_2,b2_2", 987.77);
        map2.put("2_2", 1046.50);
        map2.put("#2_2,b3_2", null);
        map2.put("3_2,b4_2", 1174.66);
        map2.put("4_2,#3_2", null);
        map2.put("#4_2,b5_2", 1244.51);
        map2.put("5_2", 1396.91);
        cFreqMap.put(2, map2);

        // ================= 筒音作 5（F 大调） =================
        map5 = new HashMap<>();
        // 第一个八度（低于主音 1 的音区）
        map5.put("5_-1", 261.63);
        map5.put("#5_-1,b6_-1", 277.18);
        map5.put("6_-1", 293.66);
        map5.put("#6_-1,b7_-1", 311.13);
        map5.put("7_-1,b1_0", 329.63);
        // 第二个八度（1 = F）
        map5.put("1_0,#7_-1", 349.23);
        map5.put("#1_0,b2_0", 369.99);
        map5.put("2_0", 392.00);
        map5.put("#2_0,b3_0", 415.30);
        map5.put("3_0,b4_0", 440.00);
        map5.put("4_0,#3_0", 466.16);
        map5.put("#4_0,b5_0", 493.88);
        map5.put("5_0", 523.25);
        map5.put("#5_0,b6_0", 554.37);
        map5.put("6_0", 587.33);
        map5.put("#6_0,b7_0", 622.25);
        map5.put("7_0,b1_1", 659.25);
        // 第三个八度
        map5.put("1_1,#7_0", 698.46);
        map5.put("#1_1,b2_1", 739.99);
        map5.put("2_1", 783.99);
        map5.put("#2_1,b3_1", 830.61);
        map5.put("3_1,b4_1", 880.00);
        map5.put("4_1,#3_1", 932.33);
        map5.put("#4_1,b5_1", 987.77);
        map5.put("5_1", 1046.50);
        map5.put("#5_1,b6_1", null);
        map5.put("6_1", 1174.66);
        map5.put("#6_1,b7_1", null);
        map5.put("7_1,b1_2", 1318.51);
        // 第四个八度
        map5.put("1_2,#7_1", 1396.91);
        cFreqMap.put(5, map5);
        FREQUENCIES.put("C", cFreqMap);

        /// D调哨笛
        Map<Integer, Map<String, Double>> dFreqMap = new HashMap<>();
        // ================= 筒音作 1（D 大调） =================
        map1 = new HashMap<>();
        // 第一个八度
        map1.put("1_0", 293.66);
        map1.put("#1_0,b2_0", 311.13);
        map1.put("2_0", 329.63);
        map1.put("#2_0,b3_0", 349.23);
        map1.put("3_0,b4_0", 369.99);
        map1.put("4_0,#3_0", 392.00);
        map1.put("#4_0,b5_0", 415.30);
        map1.put("5_0", 440.00);
        map1.put("#5_0,b6_0", 466.16);
        map1.put("6_0", 493.88);
        map1.put("#6_0,b7_0", 523.25);
        map1.put("7_0,b1_1", 554.37);
        // 第二个八度
        map1.put("1_1,#7_0", 587.33);
        map1.put("#1_1,b2_1", 622.25);
        map1.put("2_1", 659.25);
        map1.put("#2_1,b3_1", 698.46);
        map1.put("3_1,b4_1", 739.99);
        map1.put("4_1,#3_1", 783.99);
        map1.put("#4_1,b5_1", 830.61);
        map1.put("5_1", 880.00);
        map1.put("#5_1,b6_1", 932.33);
        map1.put("6_1", 987.77);
        map1.put("#6_1,b7_1", 1046.50);
        map1.put("7_1,b1_2", 1108.73);
        // 第三个八度
        map1.put("1_2,#7_1", 1174.66);
        map1.put("#1_2,b2_2", null);
        map1.put("2_2", 1318.51);
        map1.put("#2_2,b3_2", null);
        map1.put("3_2,b4_2", 1479.98);
        map1.put("4_2,#3_2", 1567.98);
        dFreqMap.put(1, map1);

        // ================= 筒音作 2（C 大调） =================
        map2 = new HashMap<>();
        // 第一个八度
        map2.put("2_0", 293.66);
        map2.put("#2_0,b3_0", 311.13);
        map2.put("3_0,b4_0", 329.63);
        map2.put("4_0,#3_0", 349.23);
        map2.put("#4_0,b5_0", 369.99);
        map2.put("5_0", 392.00);
        map2.put("#5_0,b6_0", 415.30);
        map2.put("6_0", 440.00);
        map2.put("#6_0,b7_0", 466.16);
        map2.put("7_0,b1_1", 493.88);
        // 第二个八度
        map2.put("1_1,#7_0", 523.25);
        map2.put("#1_1,b2_1", 554.37);
        map2.put("2_1", 587.33);
        map2.put("#2_1,b3_1", 622.25);
        map2.put("3_1,b4_1", 659.25);
        map2.put("4_1,#3_1", 698.46);
        map2.put("#4_1,b5_1", 739.99);
        map2.put("5_1", 783.99);
        map2.put("#5_1,b6_1", 830.61);
        map2.put("6_1", 880.00);
        map2.put("#6_1,b7_1", 932.33);
        map2.put("7_1,b1_2", 987.77);
        // 第三个八度
        map2.put("1_2,#7_1", 1046.50);
        map2.put("#1_2,b2_2", 1108.73);
        map2.put("2_2", 1174.66);
        map2.put("#2_2,b3_2", null);
        map2.put("3_2,b4_2", 1318.51);
        map2.put("4_2,#3_2", null);
        map2.put("#4_2,b5_2", 1396.91);
        map2.put("5_2", 1567.98);
        dFreqMap.put(2, map2);

        // ================= 筒音作 5（G 大调） =================
        map5 = new HashMap<>();
        // 第一个八度（低于主音 1 的音区）
        map5.put("5_-1", 293.66);
        map5.put("#5_-1,b6_-1", 311.13);
        map5.put("6_-1", 329.63);
        map5.put("#6_-1,b7_-1", 349.23);
        map5.put("7_-1,b1_0", 369.99);
        // 第二个八度（1 = G）
        map5.put("1_0,#7_-1", 392.00);
        map5.put("#1_0,b2_0", 415.30);
        map5.put("2_0", 440.00);
        map5.put("#2_0,b3_0", 466.16);
        map5.put("3_0,b4_0", 493.88);
        map5.put("4_0,#3_0", 523.25);
        map5.put("#4_0,b5_0", 554.37);
        map5.put("5_0", 587.33);
        map5.put("#5_0,b6_0", 622.25);
        map5.put("6_0", 659.25);
        map5.put("#6_0,b7_0", 698.46);
        map5.put("7_0,b1_1", 739.99);
        // 第三个八度
        map5.put("1_1,#7_0", 783.99);
        map5.put("#1_1,b2_1", 830.61);
        map5.put("2_1", 880.00);
        map5.put("#2_1,b3_1", 932.33);
        map5.put("3_1,b4_1", 987.77);
        map5.put("4_1,#3_1", 1046.50);
        map5.put("#4_1,b5_1", 1108.73);
        map5.put("5_1", 1174.66);
        map5.put("#5_1,b6_1", null);
        map5.put("6_1", 1318.51);
        map5.put("#6_1,b7_1", null);
        map5.put("7_1,b1_2", 1479.98);
        // 第四个八度
        map5.put("1_2,#7_1", 1567.98);
        dFreqMap.put(5, map5);
        FREQUENCIES.put("D", dFreqMap);

        /// F调哨笛
        Map<Integer, Map<String, Double>> fFreqMap = new HashMap<>();
        // ================= 筒音作 1（F 大调） =================
        map1 = new HashMap<>();
        // 第一个八度
        map1.put("1_0", 349.23);
        map1.put("#1_0,b2_0", 369.99);
        map1.put("2_0", 392.00);
        map1.put("#2_0,b3_0", 415.30);
        map1.put("3_0,b4_0", 440.00);
        map1.put("4_0,#3_0", 466.16);
        map1.put("#4_0,b5_0", 493.88);
        map1.put("5_0", 523.25);
        map1.put("#5_0,b6_0", 554.37);
        map1.put("6_0", 587.33);
        map1.put("#6_0,b7_0", 622.25);
        map1.put("7_0,b1_1", 659.25);
        // 第二个八度
        map1.put("1_1,#7_0", 698.46);
        map1.put("#1_1,b2_1", 739.99);
        map1.put("2_1", 783.99);
        map1.put("#2_1,b3_1", 830.61);
        map1.put("3_1,b4_1", 880.00);
        map1.put("4_1,#3_1", 932.33);
        map1.put("#4_1,b5_1", 987.77);
        map1.put("5_1", 1046.50);
        map1.put("#5_1,b6_1", 1108.73);
        map1.put("6_1", 1174.66);
        map1.put("#6_1,b7_1", 1244.51);
        map1.put("7_1,b1_2", 1318.51);
        // 第三个八度
        map1.put("1_2,#7_1", 1396.91);
        map1.put("#1_2,b2_2", null);
        map1.put("2_2", 1567.98);
        map1.put("#2_2,b3_2", null);
        map1.put("3_2,b4_2", 1760.00);
        map1.put("4_2,#3_2", 1864.66);
        fFreqMap.put(1, map1);

        // ================= 筒音作 2（Eb 大调） =================
        map2 = new HashMap<>();
        // 第一个八度
        map2.put("2_0", 349.23);
        map2.put("#2_0,b3_0", 369.99);
        map2.put("3_0,b4_0", 392.00);
        map2.put("4_0,#3_0", 415.30);
        map2.put("#4_0,b5_0", 440.00);
        map2.put("5_0", 466.16);
        map2.put("#5_0,b6_0", 493.88);
        map2.put("6_0", 523.25);
        map2.put("#6_0,b7_0", 554.37);
        map2.put("7_0,b1_1", 587.33);
        // 第二个八度
        map2.put("1_1,#7_0", 622.25);
        map2.put("#1_1,b2_1", 659.25);
        map2.put("2_1", 698.46);
        map2.put("#2_1,b3_1", 739.99);
        map2.put("3_1,b4_1", 783.99);
        map2.put("4_1,#3_1", 830.61);
        map2.put("#4_1,b5_1", 880.00);
        map2.put("5_1", 932.33);
        map2.put("#5_1,b6_1", 987.77);
        map2.put("6_1", 1046.50);
        map2.put("#6_1,b7_1", 1108.73);
        map2.put("7_1,b1_2", 1174.66);
        // 第三个八度
        map2.put("1_2,#7_1", 1244.51);
        map2.put("#1_2,b2_2", 1318.51);
        map2.put("2_2", 1396.91);
        map2.put("#2_2,b3_2", null);
        map2.put("3_2,b4_2", 1567.98);
        map2.put("4_2,#3_2", null);
        map2.put("#4_2,b5_2", 1661.22);
        map2.put("5_2", 1864.66);
        fFreqMap.put(2, map2);

        // ================= 筒音作 5（Bb 大调） =================
        map5 = new HashMap<>();
        // 第一个八度（低于主音 1 的音区）
        map5.put("5_-1", 349.23);
        map5.put("#5_-1,b6_-1", 369.99);
        map5.put("6_-1", 392.00);
        map5.put("#6_-1,b7_-1", 415.30);
        map5.put("7_-1,b1_0", 440.00);
        // 第二个八度（1 = Bb）
        map5.put("1_0,#7_-1", 466.16);
        map5.put("#1_0,b2_0", 493.88);
        map5.put("2_0", 523.25);
        map5.put("#2_0,b3_0", 554.37);
        map5.put("3_0,b4_0", 587.33);
        map5.put("4_0,#3_0", 622.25);
        map5.put("#4_0,b5_0", 659.25);
        map5.put("5_0", 698.46);
        map5.put("#5_0,b6_0", 739.99);
        map5.put("6_0", 783.99);
        map5.put("#6_0,b7_0", 830.61);
        map5.put("7_0,b1_1", 880.00);
        // 第三个八度
        map5.put("1_1,#7_0", 932.33);
        map5.put("#1_1,b2_1", 987.77);
        map5.put("2_1", 1046.50);
        map5.put("#2_1,b3_1", 1108.73);
        map5.put("3_1,b4_1", 1174.66);
        map5.put("4_1,#3_1", 1244.51);
        map5.put("#4_1,b5_1", 1318.51);
        map5.put("5_1", 1396.91);
        map5.put("#5_1,b6_1", null);
        map5.put("6_1", 1567.98);
        map5.put("#6_1,b7_1", null);
        map5.put("7_1,b1_2", 1760.00);
        // 第四个八度
        map5.put("1_2,#7_1", 1864.66);
        fFreqMap.put(5, map5);
        FREQUENCIES.put("F", fFreqMap);

        /// G调哨笛
        Map<Integer, Map<String, Double>> gFreqMap = new HashMap<>();
        // ================= 筒音作 1（G 大调） =================
        map1 = new HashMap<>();
        // 第一个八度
        map1.put("1_0", 392.00);
        map1.put("#1_0,b2_0", 415.30);
        map1.put("2_0", 440.00);
        map1.put("#2_0,b3_0", 466.16);
        map1.put("3_0,b4_0", 493.88);
        map1.put("4_0,#3_0", 523.25);
        map1.put("#4_0,b5_0", 554.37);
        map1.put("5_0", 587.33);
        map1.put("#5_0,b6_0", 622.25);
        map1.put("6_0", 659.25);
        map1.put("#6_0,b7_0", 698.46);
        map1.put("7_0,b1_1", 739.99);
        // 第二个八度
        map1.put("1_1,#7_0", 783.99);
        map1.put("#1_1,b2_1", 830.61);
        map1.put("2_1", 880.00);
        map1.put("#2_1,b3_1", 932.33);
        map1.put("3_1,b4_1", 987.77);
        map1.put("4_1,#3_1", 1046.50);
        map1.put("#4_1,b5_1", 1108.73);
        map1.put("5_1", 1174.66);
        map1.put("#5_1,b6_1", 1244.51);
        map1.put("6_1", 1318.51);
        map1.put("#6_1,b7_1", 1396.91);
        map1.put("7_1,b1_2", 1479.98);
        // 第三个八度
        map1.put("1_2,#7_1", 1567.98);
        map1.put("#1_2,b2_2", null);
        map1.put("2_2", 1760.00);
        map1.put("#2_2,b3_2", null);
        map1.put("3_2,b4_2", 1975.53);
        map1.put("4_2,#3_2", 2093.00);
        gFreqMap.put(1, map1);

        // ================= 筒音作 2（F 大调） =================
        map2 = new HashMap<>();
        // 第一个八度
        map2.put("2_0", 392.00);
        map2.put("#2_0,b3_0", 415.30);
        map2.put("3_0,b4_0", 440.00);
        map2.put("4_0,#3_0", 466.16);
        map2.put("#4_0,b5_0", 493.88);
        map2.put("5_0", 523.25);
        map2.put("#5_0,b6_0", 554.37);
        map2.put("6_0", 587.33);
        map2.put("#6_0,b7_0", 622.25);
        map2.put("7_0,b1_1", 659.25);
        // 第二个八度
        map2.put("1_1,#7_0", 698.46);
        map2.put("#1_1,b2_1", 739.99);
        map2.put("2_1", 783.99);
        map2.put("#2_1,b3_1", 830.61);
        map2.put("3_1,b4_1", 880.00);
        map2.put("4_1,#3_1", 932.33);
        map2.put("#4_1,b5_1", 987.77);
        map2.put("5_1", 1046.50);
        map2.put("#5_1,b6_1", 1108.73);
        map2.put("6_1", 1174.66);
        map2.put("#6_1,b7_1", 1244.51);
        map2.put("7_1,b1_2", 1318.51);
        // 第三个八度
        map2.put("1_2,#7_1", 1396.91);
        map2.put("#1_2,b2_2", 1479.98);
        map2.put("2_2", 1567.98);
        map2.put("#2_2,b3_2", null);
        map2.put("3_2,b4_2", 1760.00);
        map2.put("4_2,#3_2", null);
        map2.put("#4_2,b5_2", 1864.66);
        map2.put("5_2", 2093.00);
        gFreqMap.put(2, map2);

        // ================= 筒音作 5（C 大调） =================
        map5 = new HashMap<>();
        // 第一个八度（低于主音 1 的音区）
        map5.put("5_-1", 392.00);
        map5.put("#5_-1,b6_-1", 415.30);
        map5.put("6_-1", 440.00);
        map5.put("#6_-1,b7_-1", 466.16);
        map5.put("7_-1,b1_0", 493.88);
        // 第二个八度（1 = C）
        map5.put("1_0,#7_-1", 523.25);
        map5.put("#1_0,b2_0", 554.37);
        map5.put("2_0", 587.33);
        map5.put("#2_0,b3_0", 622.25);
        map5.put("3_0,b4_0", 659.25);
        map5.put("4_0,#3_0", 698.46);
        map5.put("#4_0,b5_0", 739.99);
        map5.put("5_0", 783.99);
        map5.put("#5_0,b6_0", 830.61);
        map5.put("6_0", 880.00);
        map5.put("#6_0,b7_0", 932.33);
        map5.put("7_0,b1_1", 987.77);
        // 第三个八度
        map5.put("1_1,#7_0", 1046.50);
        map5.put("#1_1,b2_1", 1108.73);
        map5.put("2_1", 1174.66);
        map5.put("#2_1,b3_1", 1244.51);
        map5.put("3_1,b4_1", 1318.51);
        map5.put("4_1,#3_1", 1396.91);
        map5.put("#4_1,b5_1", 1479.98);
        map5.put("5_1", 1567.98);
        map5.put("#5_1,b6_1", null);
        map5.put("6_1", 1760.00);
        map5.put("#6_1,b7_1", null);
        map5.put("7_1,b1_2", 1975.53);
        // 第四个八度
        map5.put("1_2,#7_1", 2093.00);
        gFreqMap.put(5, map5);
        FREQUENCIES.put("G", gFreqMap);
    }

    /**
     * 简谱字符串转换为洞洞谱
     * @param text 简谱字符串
     * @param mode 指法模式
     * @param tune 调性
     */
    public static Map<String, Object> convertToDdp(String text, int mode, String tune) {
        Map<String, Object> result = new LinkedHashMap<>();
        int octaveNum = 0, halveNum = 0;

        // 1.获取token
        String[] parts = text.split("\\s+");
        int idx = 1;

        List<Token> tokens = new ArrayList<>();
        for (String part : parts) {
            switch (part) {
                case "" -> {
                    continue;
                }
                case "|" -> {
                    tokens.add(new Token("barline"));
                    continue;
                }
                case "-" -> {
                    tokens.add(new Token("sustain"));
                    continue;
                }
                case "0" -> {
                    tokens.add(new Token("rest", "0", "0", 0, 0, 1.0, idx++));
                    continue;
                }
            }

            // 解析音符
            char firstChar = part.charAt(0);
            if (firstChar < '1' || firstChar > '7') {
                // 抛出异常或返回错误信息
                throw new AppException("非法的输入内容：" + part);
            }

            int i = 1, octave = 0, halve = 0;   // 序号、八度、减时线
            StringBuilder point = new StringBuilder();  // 附点
            int numerator = 1, denominator = 1; // 分母和分子

            // 半音标记
            String semitoneSymbol = "", semitoneStr = "";

            while (i < part.length()) {
                char c = part.charAt(i);
                if (c == '\'') {
                    octave++;
                } else if (c == ',') {
                    octave--;
                } else if (c == '_') {
                    semitoneStr = "<span style=\"position: absolute; left: -6px; top: -3px; font-size: 0.9em;\">♭</span>";
                    semitoneSymbol = "b";
                } else if (c == '^') {
                    semitoneStr = "<span style=\"position: absolute; left: -6px; top: -3px; font-size: 0.9em;\">♯</span>";
                    semitoneSymbol = "#";
                } else if (c == '.') {
                    numerator = numerator * 2 + 1;
                    denominator = denominator * 2;
                    point.append("·");
                } else if (c == '/') {
                    denominator *= 2;
                    halve++;
                }
                i++;
            }

            String noteStr = semitoneStr + firstChar +
                    "<span style=\"position: absolute\">" + point + "</span>";
            String note = semitoneSymbol + firstChar;
            double duration = (double) numerator / denominator;

            tokens.add(new Token("note", noteStr, note, octave, halve, duration, idx++));

            if (Math.abs(octave) > octaveNum) {
                octaveNum = Math.abs(octave);
            }
            if (halve > halveNum) {
                halveNum = halve;
            }
        }

        // 2.根据token生成前端洞洞谱渲染内容
        StringBuilder renderStr = new StringBuilder();
        for (Token token : tokens) {
            // 小节线
            if (token.getType().equals("barline")) {
                renderStr.append("<div class=\"score-item\">").append("<div class=\"barline\"></div>").append("</div>");
                continue;
            }
            // 音符
            int octave = 0, halve = 0, index = token.getIndex();
            String opacity = "0", noteStr = "";
            int[] fingering = new int[]{0, 0, 0, 0, 0};
            if (token.getType().equals("rest")) {
                noteStr = "0";
            } else if (token.getType().equals("sustain")) {
                noteStr = "—";
                index = 0;
            } else {
                String noteKey = token.getNote() + "_" + token.getOctave();
                fingering = POSITION_MAP.get(mode).getOrDefault(noteKey, new int[]{0, 0, 0, 0, 0, 0});
                opacity = fingering != null ? "1" : "0.25";
                octave = token.getOctave();
                halve = token.getHalve();
                noteStr = token.getNoteStr();
            }
            /// 容器 开始
            renderStr.append("<div class=\"score-item\">");
            /// 音符渲染盒子 开始
            renderStr.append("<div class=\"note-group note-idx-").append(index).append("\">");

            /// 1.音符标签 开始
            renderStr.append("<div class=\"note-label\">");
            // 1.1 高八度点
            for (int i = 1; i <= octaveNum; i++) {
                renderStr.append("<div class=\"octave-dot\" style=\"opacity: ").append(octaveNum - octave < i ? 1 : 0).append("\">•</div>");
            }
            /// 1.2 音符 开始
            renderStr.append("<div class=\"note-num\">")
                    .append("<div>").append(noteStr).append("</div>");  // 数字
            // 减时线
            for (int i = 1; i <= halveNum; i++) {
                renderStr.append("<div class=\"halve-line\" style=\"opacity: ").append(halve >= i ? 1 : 0).append("\"></div>");
            }
            /// 1.2 音符 结束
            renderStr.append("</div>");
            // 1.3 低八度点
            for (int i = 1; i <= octaveNum; i++) {
                renderStr.append("<div class=\"halve-dot\" style=\"opacity: ").append(-octave >= i ? 1 : 0).append("\">•</div>");
            }
            /// 1.音符标签 结束
            renderStr.append("</div>");
            /// 1. 笛子部分 开始
            renderStr.append("<div class=\"whistle\" style=\"opacity: ").append(opacity).append("\">");
            /// 2.1 笛身 开始
            renderStr.append("<div class=\"whistle-body\">");
            for (int i : fingering) {
                String closeClass = i == 1 ? " half-close" : (i == 2 ? " close" : "");
                renderStr.append("<div class=\"hole").append(closeClass).append("\"></div>");
            }
            /// 2.1 笛身 结束
            renderStr.append("</div>");
            // 2.2.笛子超吹标记
            int overBlowCnt = mode == 5 ? octave + 1 : octave;  // 指法5时octave可以为负值
            for (int i = 1; i <= 3; i++) {  // 超吹的加号
                renderStr.append("<div class=\"whistle-octave\" style=\"opacity: ")
                        .append(overBlowCnt >= i ? 1 : 0)
                        .append("\">＋</div>");
            }
            /// 1. 笛子部分 结束
            renderStr.append("</div>");
            /// 音符渲染盒子 结束
            renderStr.append("</div>");
            /// 容器 结束
            renderStr.append("</div>");
        }
        result.put("renderStr", renderStr.toString());

        // 3.组装用于音乐播放的 events 数组
        Map<String, Double> originFreqMap = FREQUENCIES.get(tune).get(mode);
        Map<String, Double> freqMap = new HashMap<>();
        originFreqMap.forEach((key, value) -> {
            String[] keys = key.split(",");
            for (String k : keys) {
                freqMap.put(k.trim(), value);
            }
        });
        JSONArray events = new JSONArray();
        for (Token token : tokens) {
            // 小节线跳过
            if (token.getType().equals("barline")) {
                continue;
            }
            // 其他类型添加
            if (token.getType().equals("sustain") && !events.isEmpty()) {
                JSONObject preEvent = events.getJSONObject(events.size() - 1);
                preEvent.put("beats", preEvent.getDouble("beats") + 1);
            } else {
                JSONObject event = new JSONObject();
                event.put("beats", token.getDuration());
                event.put("type", token.getType());
                String key = token.getNote() + "_" + token.getOctave();
                event.put("note", key);
                event.put("index", token.getIndex());
                event.put("freq", freqMap.get(key));
                events.add(event);
            }
        }
        result.put("events", events);

        return result;
    }
}
