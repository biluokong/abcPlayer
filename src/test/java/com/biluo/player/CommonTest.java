package com.biluo.player;

import org.apache.commons.lang3.math.Fraction;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 普通测试
 *
 * @author nz
 * @since 2026/4/28
 */
public class CommonTest {

    private static final String[] LETTER_ARR_UP = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};
    private static final String[] LETTER_AR_DOWN = {"C", "D$", "D", "E$", "E", "F", "G$", "G", "A$", "A", "B$", "B"};
    private static final Map<Character, String> LETTER_MAP = new HashMap<>();

    static {
        LETTER_MAP.put('0', "z");
    }

    private static Fraction mergeUnit = Fraction.getFraction(1, 4);
    private static Fraction unit = Fraction.getFraction(1, 4);  // L

    public static String convertHead(List<String> headList) {
        String one = "C";
        StringBuilder res = new StringBuilder();
        for (String line : headList) {
            if (line.startsWith("B:")) {        // 标题
                res.append("T: ").append(line.substring(2).trim()).append("\n");
            } else if (line.startsWith("Z:")) { // 作者
                res.append("C: ").append(line.substring(2).trim()).append("\n");
            } else if (line.startsWith("D:")) { // 调式
                res.append("K: C\n");
                one = line.substring(2).trim();
            } else if (line.startsWith("P:")) { // 拍号
                String signature = line.substring(2).trim();
                String[] split = signature.split("/");
                if (split[1].equals("8") && split[0].equals("6")) mergeUnit = Fraction.getFraction(3, 8);
                else if (split[1].equals("8")) mergeUnit = Fraction.getFraction(1, 8);
                res.append("M: ").append(signature).append("\n");
            }
        }
        res.append("L: 1/4\n");
        res.append("Q: 1/4=90\n");

        String[] letterArr = LETTER_ARR_UP;
        if (one.endsWith("$")) letterArr = LETTER_AR_DOWN;
        int idx = 0;
        for (int i = 0; i < letterArr.length; i++) {
            if (one.equals(letterArr[i])) {
                idx = i;
                break;
            }
        }
        StringBuilder suffix = new StringBuilder();
        for (int i = 1; i <= 7; i++) {
            if (idx >= letterArr.length) {
                suffix.append("'");
                idx = idx % letterArr.length;
            }
            LETTER_MAP.put((char) (i + '0'), letterArr[idx] + suffix);
            if (i == 3 || i == 7) idx++;
            else idx += 2;
        }
        System.out.println(LETTER_MAP);
        return res.toString();
    }

    public static String convertBody(List<String> bodyList) {
        StringBuilder result = new StringBuilder();
        for (String line : bodyList) {
            // 去掉每行开头的 "Q:" 和一些无用字符
            String currLine = line.substring(2).replaceAll("[ \t^~]", "");
            // 转换当前行
            String convertedLine = convertLine(currLine);
            result.append("\n").append(convertedLine);
        }
        if (!result.isEmpty()) {
            String res = result.substring(1);
            // 末尾的 "||" 要换成ABC谱的 "|]"
            if (res.endsWith("||")) return res.substring(0, res.length() - 1) + "]";
            // 如果有跳房子，可能末尾会是 "||]" 需要移除多余的 "|"
            if (res.endsWith("||]")) return res.substring(0, res.length() - 2) + "]";
            return res;
        }
        return "";
    }

    public static final List<Character> END_MARKER = new ArrayList<>();

    static {
        END_MARKER.add('0');
        END_MARKER.add('1');
        END_MARKER.add('2');
        END_MARKER.add('3');
        END_MARKER.add('4');
        END_MARKER.add('5');
        END_MARKER.add('6');
        END_MARKER.add('7');
        END_MARKER.add('|');
        END_MARKER.add(':');
    }

    private static String tempSection = "";

    private static String convertLine(String line) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        int n = line.length();
        while (i < n) {
            char c = line.charAt(i);
            // 处理数字 0-7
            if (c >= '0' && c <= '7') {
                // 收集数字后的连续修饰符
                int j = i + 1;
                StringBuilder modifierStr = new StringBuilder();
                while (j < n && !END_MARKER.contains(line.charAt(j))) {
                    if (line.charAt(j) == '[') {    // 倚音
                        int k = j + 1;
                        while (line.charAt(k) != ']') k++;
                        j = k;
                    }
                    j++;
                }
                if (j > i + 1) modifierStr.append(line, i + 1, j);
                handleModifier(LETTER_MAP.get(c), modifierStr.toString(), sb);
                i = j;
            } else {
                i = handleSectionEnd(line, c, i, sb);
            }
        }
        return sb.toString();
    }

    private static int handleSectionEnd(String line, char c, int i, StringBuilder sb) {
        // 小节线后的'"'不是注释。临时拍号: "p:x/x"
        if (c == '"' && line.charAt(i + 1) == 'p') {
            sb.append("\n");
            // 如果临时拍号前面没有内容，则删除多余的小节线和添加的换行符
            if (i == 1) sb.setLength(sb.length() - 2);
            String temp = line.substring(i + 3);
            int end = temp.indexOf('"');
            sb.append("M:").append(temp, 0, end).append("\n");
            return i + 3 + end + 1;
        }
        if (c == '[') {  // 小节线后的'['是跳房子, 后面跟用引号包裹的标签名
            int endIdx = line.indexOf("\"", i + 2);
            String tag = line.substring(i + 2, endIdx).replaceAll("\\.", "");   // ABC谱不支持.
            sb.append("[").append(tag).append(" ");
            return endIdx + 1;
        }
        if (c == ':' || c == '|') {  // 小节线：":|" "|" "||" "|:" "||/"
            // 分节后重新计算时值
            sb.append(tempSection.trim());
            tempSection = "";
            sumTime = Fraction.getFraction(0);

            int j = i + 1;
            while (j < line.length() && !LETTER_MAP.containsKey(line.charAt(j))) j++;
            String mark = line.substring(i, j).toLowerCase();
            if (mark.startsWith("||") || mark.startsWith("|:") || mark.startsWith(":|")) {
                String sectionTag = mark.substring(0, 2);
                if (j == i + 2 || mark.charAt(2) != '&') {
                    sb.append(sectionTag);
                    return i + 2;
                }
                int offset = handleEndMarker(mark.substring(3), sb);
                sb.append(sectionTag);
                return i + 3 + offset;
            }
            if (mark.startsWith("||/")) {
                if (j == i + 3 || mark.charAt(3) != '&') {
                    sb.append("||");
                    return i + 3;
                }
                int offset = handleEndMarker(mark.substring(4), sb);
                sb.append("||");
                return i + 4 + offset;
            }
            // 到这说明小节线是"|"
            /*if (j == i + 1 && j == line.length()) { // 如果到了行尾，需要把小节线转换为ABC谱的段落结束符
                // 如果行尾的|后还有其它内容，如修饰符等，目前这种不进行转换
                sb.append("||");
                return j;
            }*/
            if (j == i + 1 || mark.charAt(1) != '&') {
                sb.append("|");
                return i + 1;
            }
            int offset = handleEndMarker(mark.substring(2), sb);
            sb.append("|");
            return i + 2 + offset;
        }
        // 其它符号不作处理，直接追加
        sb.append(c);
        return ++i;
    }

    private static int handleEndMarker(String str, StringBuilder sb) {
        int j = 0;
        while (j < str.length()) {
            char c = str.charAt(j);
            if (!(c != '"' && c != '[' && c != ']')) break;
            j++;
        }
        String mark = str.substring(0, j);
        switch (mark) {
            case "fine" -> sb.append("!fine!");
            case "dc" -> sb.append("!D.C.!");
            case "ds" -> sb.append("!D.S.!");
        }
        return j;
    }

    private static String handleAppoggiatura(String str) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        int n = str.length();
        while (i < n) {
            char c = str.charAt(i);
            // 处理数字 0-7
            if (c >= '0' && c <= '7') {
                // 收集数字后的连续修饰符
                int j = i + 1;
                StringBuilder modifierStr = new StringBuilder();
                while (j < n && !END_MARKER.contains(str.charAt(j))) j++;
                if (j > i + 1) modifierStr.append(str, i + 1, j);

                // 转换数字和修饰符
                String target = LETTER_MAP.get(c);
                String[] split = target.split("[A-Gz]");
                if (split.length > 0) {
                    target = target.substring(0, 1);
                    modifierStr.append(split[1]);
                }
                int semitoneCnt = 0, restoreCnt = 0;            // 升降半音修饰
                int octaveCnt = 0;                              // 高低音修饰
                int idx = 0;
                while (idx < modifierStr.length()) {
                    char modifier = modifierStr.charAt(idx);
                    if (modifier == '#') semitoneCnt++;             // 升半音修饰
                    else if (modifier == '$') semitoneCnt--;        // 降半音修饰
                    else if (modifier == '=') restoreCnt++;         // 还原符
                    else if (modifier == '\'') octaveCnt++;         // 升八度修饰
                    else if (modifier == ',') octaveCnt--;          // 降八度修饰
                    idx++;
                }
                // 处理升降半音修饰
                StringBuilder prefix = new StringBuilder();
                prefix.append("^".repeat(Math.max(0, semitoneCnt)));
                prefix.append("_".repeat(Math.max(0, -semitoneCnt)));
                if (restoreCnt > 0) prefix = new StringBuilder("=");
                // 处理八度升降
                String suffix = "'".repeat(Math.max(0, octaveCnt)) + ",".repeat(Math.max(0, -octaveCnt));
                sb.append(prefix).append(target).append(suffix);

                i = j;
            } else {
                sb.append(c);
                i++;
            }
        }
        return sb.toString();
    }

    private static Fraction sumTime = Fraction.getFraction(0);

    private static void handleModifier(String target, String modifierStr, StringBuilder sb) {
        String[] split = target.split("[A-Gz]");
        if (split.length > 0) {
            target = target.substring(0, 1);
            modifierStr += split[1];
        }

        String prefix_1 = "";                           // 音符注释
        String prefix_2 = "";                           // 倚音
        int semitoneCnt = 0, restoreCnt = 0;            // 升降半音修饰
        int octaveCnt = 0;                              // 高低音修饰
        int numerator = 1, denominator = 1, doubling = 0;   // 时值修饰
        StringBuilder suffix_last = new StringBuilder();    // 延音/连音括号

        int idx = 0;
        while (idx < modifierStr.length()) {
            char modifier = modifierStr.charAt(idx);
            if (modifier == '#') semitoneCnt++;             // 升半音修饰
            else if (modifier == '$') semitoneCnt--;        // 降半音修饰
            else if (modifier == '=') restoreCnt++;         // 还原符
            else if (modifier == '\'') octaveCnt++;         // 升八度修饰
            else if (modifier == ',') octaveCnt--;          // 降八度修饰
            else if (modifier == '.') {                     // 附点音符
                numerator = numerator * 2 + 1;   // 分子乘以2再加1
                denominator = denominator * 2;   // 分母乘以2
            } else if (modifier == '/') denominator *= 2;   // 减时线 时值减半
            else if (modifier == '-') doubling++;           // 增时线
            else if (modifier == '(' || modifier == ')') suffix_last.append(modifier);  // 连音/延音
            else if (modifier == '"') { // 音符注释
                int endIdx = modifierStr.indexOf('"', idx + 1);
                prefix_1 = modifierStr.substring(idx, endIdx + 1);
                idx = endIdx;
            } else if (modifier == '[') { // 倚音
                if (modifierStr.charAt(idx + 1) == 'h') throw new RuntimeException("暂不支持后倚音转换");
                int endIdx = modifierStr.indexOf(']', idx + 1);
                String appoggiatura = modifierStr.substring(idx + 1, endIdx);
                prefix_2 = "{" + handleAppoggiatura(appoggiatura).replaceAll(" ", "") + "}";
                idx = endIdx;
            }
            idx++;
        }

        // 处理升降半音修饰
        StringBuilder prefix_3 = new StringBuilder();
        prefix_3.append("^".repeat(Math.max(0, semitoneCnt)));
        prefix_3.append("_".repeat(Math.max(0, -semitoneCnt)));
        if (restoreCnt > 0) prefix_3 = new StringBuilder("=");

        // 处理八度升降
        String suffix_1 = "'".repeat(Math.max(0, octaveCnt)) + ",".repeat(Math.max(0, -octaveCnt));

        // 处理时值修饰
        numerator += denominator * doubling;
        String suffix_2 = numerator + "/" + denominator;
        if (numerator == 1 && denominator == 1) suffix_2 = "";
        else if (numerator == 1) {
            suffix_2 = "/" + denominator;
        } else if (denominator == 1) {
            suffix_2 = numerator + "";
        }

        String res = prefix_1 + prefix_2 + prefix_3 + target + suffix_1 + suffix_2 + suffix_last + " ";
        tempSection += res;

        sumTime = sumTime.add(Fraction.getFraction(numerator, denominator).multiplyBy(unit));
        //if (target.equals("z") || sumTime.compareTo(mergeUnit) > 0) {
        if (sumTime.compareTo(mergeUnit) > 0) {
            sb.append(tempSection);
            sumTime = Fraction.getFraction(0);
            tempSection = "";
        } else if (sumTime.compareTo(mergeUnit) == 0) {
            sb.append(tempSection.replaceAll(" ", "")).append(" ");
            sumTime = Fraction.getFraction(0);
            tempSection = "";
        }
    }


    @Test
    public void fqCovertAbcTest() {
        String fqStr = """
                #============================以下为描述头定义==========================
                V: 1.0
                B: 当
                B: D调哨笛 筒音作5
                D: G
                P: 2/4
                #============================以下开始简谱主体==========================
                Q:  (6[5]. 3/) | (7[6]. 3/) | (1'/ 7/ 6/ 5/ | 3[2]) - | (6[5]. 3/) | (7[6]. 3/) | (1'/ 7/ 1'/ 2'/ | 3') - |
                Q:  (6[5]. 3/) | (7[6]. 3/) | (1'/ 7/ 6/ 5/ | 3[2]) - | (6[5]. 3/) | (7[6]. 3/) | (3'[2'] - | 3') - |:&fine
                Q: 0 0// 5,// 6,// 1// | 2// 1// 2// 1// 2// 3/ (2// | 1) 0// 5,// 6,// 5,// | 6,/ 1 (2/[1] |
                Q: 2) 0// 1// 1// 2// | 3/ (5/ 5/) 5// 5// | 6/ (3/ 3//) 0/ 6,// | 3// 2// 3// 2// 3/ 2// 1// |
                Q: 2 0/ 1// 1// | 6/ 1'// (1'// 1'//) 6/ 3//) | 6/ (5// 6// 5) | 3// 6/. 5/ 3// (2// |
                Q: 2/) 1/ 0/ 6,// 5,// | 3/[2]/ 2/. 0/ 1// 6,// |["1." 6/ 5// 5// 6/ (5// 2// | 3/) (2/ 2) :|]["2." 6/ 5/ 6// 5/ 3// |
                Q: 2/ (1/ 1) | 0 0// 5,// 1// 2// |:] 3// 5// 5// (5// 5//) 5/ 5// | 5// 5// 3//[2] (2// 2/) 0/ |
                Q: 6// 1'// 1'// (1'// 1'//) 1'/ 1'// | 6// 5// 3// (5// 5/) 0/ | 6// 1'// 1'// (1'// 1'//) 6/ 3// | 5// 5// 6// (3// 2// 1/.) |
                Q: 3// 2// 3// (2// 2//) 6,/ 1// |["1." 3// 5// 3// 2// 0// 5// 1// 2// :|]["2." 3/ 5 2/ | (2/ (1[32]. | 1)) - ||&dc]
                """;

        List<String> headList = new ArrayList<>(), bodyList = new ArrayList<>();
        for (String line : fqStr.split("\n")) {
            if (line.startsWith("Q:")) bodyList.add(line);
            else headList.add(line);
        }
        String head = convertHead(headList);
        String body = convertBody(bodyList);
        System.out.println(head + body);
    }
}
