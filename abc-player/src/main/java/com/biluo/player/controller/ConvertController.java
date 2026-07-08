package com.biluo.player.controller;

import com.biluo.player.annotation.Permission;
import com.biluo.player.util.Result;
import com.biluo.player.util.FqToAbcConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 简谱转ABC谱控制器
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
        log.info("接收到简谱转换请求，长度: {}", fq.length());
        String result = FqToAbcConverter.convert(fq);
        log.info("简谱转换成功，结果长度: {}", result.length());
        return Result.success("转换成功", result);
    }
}
