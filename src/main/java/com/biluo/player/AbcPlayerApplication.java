package com.biluo.player;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * ABC谱播放器应用启动类
 *
 * @author nz
 * @since 2026/5/20
 */
@SpringBootApplication
@EnableScheduling
public class AbcPlayerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AbcPlayerApplication.class, args);
    }
}
