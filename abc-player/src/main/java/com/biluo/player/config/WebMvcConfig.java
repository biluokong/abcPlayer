package com.biluo.player.config;

import com.biluo.player.interceptor.JwtInterceptor;
import com.biluo.player.interceptor.PermissionInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.annotation.Resource;

/**
 * Web MVC配置类
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Resource
    private JwtInterceptor jwtInterceptor;

    @Resource
    private PermissionInterceptor permissionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 添加JWT拦截器（先执行，负责认证并填充用户上下文）
        registry.addInterceptor(jwtInterceptor)
                // 拦截所有API请求
                .addPathPatterns("/api/**")
                // 排除登录接口和静态资源
                .excludePathPatterns(
                        "/api/user/login"      // 登录接口
                );

        // 添加权限拦截器（后执行，基于用户上下文进行权限校验）
        registry.addInterceptor(permissionInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/user/login"      // 登录接口不需要权限校验
                );
    }

    // 全局 CORS 配置（已交给nginx处理）
    /*@Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")  // 对所有 API 接口
                .allowedOrigins(
                        "https://biluokong.github.io", "http://localhost:5173",
                        "http://43.226.44.12", "https://43.226.44.12"
                )  // 允许的前端域名
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // 必须包含 OPTIONS
//                .allowedHeaders("*")  // 允许所有请求头
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)  // 如果使用 Cookie/Authorization 头，设为 true
                .exposedHeaders("Authorization");  // 如果需要前端读取自定义响应头
    }*/
}
