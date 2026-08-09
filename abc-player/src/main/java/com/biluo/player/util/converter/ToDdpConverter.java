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
    // 指法映射表
    private static final Map<String, Map<String, int[]>> POSITIONS = new LinkedHashMap<>();

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

        POSITIONS.put("1", mode1);

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
        mode2.put("#4_2,b5_1", new int[]{2, 1, 2, 2, 2, 2});
        mode2.put("5_2", new int[]{2, 0, 2, 0, 0, 2});

        POSITIONS.put("2", mode2);

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

        POSITIONS.put("5", mode5);
    }

    // 位置映射表（用于快速查找）
    private static final Map<String, Map<String, int[]>> POSITION_MAP = new HashMap<>();

    static {
        for (Map.Entry<String, Map<String, int[]>> entry : POSITIONS.entrySet()) {
            String mode = entry.getKey();
            Map<String, int[]> fingeringMap = entry.getValue();
            Map<String, int[]> resolvedMap = new HashMap<>();

            for (Map.Entry<String, int[]> fingerEntry : fingeringMap.entrySet()) {
                String key = fingerEntry.getKey();
                int[] value = fingerEntry.getValue();
                // 按逗号分割key
                String[] keys = key.split(",");
                for (String k : keys) {
                    resolvedMap.put(k.trim(), value);
                }
            }
            POSITION_MAP.put(mode, resolvedMap);
        }
    }

    /**
     * 简谱字符串转换为洞洞谱
     * @param text 简谱字符串
     * @param mode 指法模式
     */
    public static Map<String, Object> convertToDdp(String text, String mode) {
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
            /// 2.笛身 开始
            renderStr.append("<div class=\"whistle-body\" style=\"opacity: ").append(opacity).append("\">");
            for (int i : fingering) {
                String closeClass = i == 1 ? " half-close" : (i == 2 ? " close" : "");
                renderStr.append("<div class=\"hole").append(closeClass).append("\"></div>");
            }
            /// 2.笛身 结束
            renderStr.append("</div>");
            /// 音符渲染盒子 结束
            renderStr.append("</div>");
            /// 容器 结束
            renderStr.append("</div>");
        }
        result.put("renderStr", renderStr.toString());

        // 3.组装用于音乐播放的 events 数组
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
                event.put("note", token.getNote());
                event.put("octave", token.getOctave());
                event.put("index", token.getIndex());
                events.add(event);
            }
        }
        result.put("events", events);

        return result;
    }
}
