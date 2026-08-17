package com.biluo.player.interceptor;

import com.alibaba.fastjson.JSON;
import com.biluo.player.context.UserContext;
import com.biluo.player.mode.entity.SysUserToken;
import com.biluo.player.mode.vo.LoginUser;
import com.biluo.player.service.SysUserService;
import com.biluo.player.util.AppException;
import com.biluo.player.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * JWT认证拦截器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {
    private final SysUserService sysUserService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 放行 OPTIONS 预检（已交给nginx处理）
        /*if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }*/

        // 获取请求头中的Token
        String token = request.getHeader("Authorization");

        // 如果Token为空，尝试从参数中获取
        if (StringUtils.isBlank(token)) {
            // Token无效，返回401
            log.warn("Token为空，IP: {}, URI: {}", request.getRemoteAddr(), request.getRequestURI());
            buildResponseData(response, "{\"code\":401,\"message\":\"未登录或登录已过期\"}");
            return false;
        }

        // 移除可能的 "Bearer " 前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // 验证Token
        boolean validated = JwtUtil.validateToken(token, sysUserService::deleteUserToken);
        if (!validated) {
            // Token无效，返回401
            log.warn("Token验证失败，IP: {}, URI: {}", request.getRemoteAddr(), request.getRequestURI());
            buildResponseData(response, "{\"code\":401,\"message\":\"未登录或登录已过期\"}");
            return false;
        }

        // Token有效，检查用户是否重复登录
        log.info("Token验证通过: {}", JSON.toJSONString(JwtUtil.getClaims(token)));

        Long userId = JwtUtil.getUserId(token);
        SysUserToken userToken = sysUserService.getUserToken(userId);
        if (userToken == null) {
            log.warn("用户未登录，IP: {}, URI: {}", request.getRemoteAddr(), request.getRequestURI());
            throw new AppException(401, "登录已过期，请重新登录");
        }

        if (!userToken.getTokenJti().equals(JwtUtil.getJti(token))) {
            throw new AppException(401, "您的账号已在其他设备登录，请重新登录");
        }

        // 从 Token 中解析用户信息存入上下文，无需查询数据库
        LoginUser loginUser = LoginUser.builder()
                .userId(userId)
                .username(JwtUtil.getUsername(token))
                .nickname(JwtUtil.getNickname(token))
                .menuPermissions(JwtUtil.getMenuPermissions(token))
                .build();
        UserContext.setCurrentUser(loginUser);

        request.setAttribute("userId", userId);
        request.setAttribute("username", JwtUtil.getUsername(token));

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 请求结束后清除用户上下文，防止内存泄漏
        UserContext.clear();
    }

    private static void buildResponseData(HttpServletResponse resp, String s) throws IOException {
        resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write(s);
    }
}
