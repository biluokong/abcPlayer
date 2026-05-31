package com.biluo.player.task;

import com.biluo.player.service.SysUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 用户过期处理定时任务
 * 定时检查过期用户并自动禁用
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserExpirationTask {

    private final SysUserService userService;

    /**
     * 将当前时间已超过过期时间的启用用户自动禁用
     */
//    @Scheduled(cron = "0 * * * * ?")
    @Scheduled(cron = "0 0 1 * * ?")
    public void handleExpiredUsers() {
        log.info("开始执行过期用户检查任务...");
        try {
            userService.handleExpiredUsers();
            log.info("过期用户检查任务执行完成");
        } catch (Exception e) {
            log.error("过期用户检查任务执行失败", e);
        }
    }
}
