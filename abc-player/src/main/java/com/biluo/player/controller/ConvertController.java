package com.biluo.player.controller;

import com.biluo.player.annotation.Permission;
import com.biluo.player.util.ConverterUtil;
import com.biluo.player.util.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 转换不同谱
 *
 * @author nz
 * @since 2026/5/20
 */
@Slf4j
@RestController
@RequestMapping("/api/convert")
public class ConvertController {

    /**
     * 将简谱字符串转换为ABC谱
     *
     * @param fq 简谱格式字符串
     * @return ABC谱格式字符串
     */
    @Permission(menu = "fqConvertAbc")
    @GetMapping("/fqToAbc")
    public Result<String> convertFqToAbc(@RequestParam String fq) {
        String result = ConverterUtil.convertFqToAbc(fq);
        return Result.success("转换成功", result);
    }

    /**
     * 将简谱字符串转换为洞洞谱
     */
    @Permission(menu = "generateDdp")
    @GetMapping("/toDdp")
    public Result<Map<String, Object>> convertFqToDd(@RequestParam String text, @RequestParam String mode) {
        Map<String, Object> result = ConverterUtil.convertToDdp(text, mode);
        return Result.success("转换成功", result);
    }
}
