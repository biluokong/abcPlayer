package com.biluo.player.interceptor;

import com.biluo.player.annotation.Permission;
import com.biluo.player.context.UserContext;
import com.biluo.player.mode.vo.LoginUser;
import com.biluo.player.util.AppException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 权限校验拦截器
 * 检查方法/类上的 @RequirePermission 注解，从用户上下文中获取用户信息进行权限校验
 */
@Slf4j
@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行 OPTIONS 预检（已交给nginx处理）
        /*if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }*/

        // 非Controller方法直接放行（如静态资源处理器）
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // 优先获取方法上的注解，其次获取类上的注解
        Permission permission = handlerMethod.getMethodAnnotation(Permission.class);
        if (permission == null) {
            permission = handlerMethod.getBeanType().getAnnotation(Permission.class);
        }

        // 没有权限注解，直接放行
        if (permission == null) {
            return true;
        }

        // 从用户上下文获取当前登录用户
        LoginUser currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(401, "未登录或登录已过期");
        }

        // 校验菜单权限
        String requiredMenu = permission.menu();
        if (StringUtils.isNotBlank(requiredMenu)) {
            String userMenuPermissions = currentUser.getMenuPermissions();
            if (StringUtils.isBlank(userMenuPermissions)) {
                log.warn("用户[{}]无菜单权限，要求: {}", currentUser.getUsername(), requiredMenu);
                throw new AppException(403, "无权限访问该功能");
            }

            Set<String> allowedMenus = Arrays.stream(userMenuPermissions.split(","))
                    .map(String::trim)
                    .filter(StringUtils::isNotBlank)
                    .collect(Collectors.toSet());

            if (!allowedMenus.contains(requiredMenu)) {
                log.warn("用户[{}]菜单权限不足，拥有: {}，要求: {}", currentUser.getUsername(), userMenuPermissions, requiredMenu);
                throw new AppException(403, "无权限访问该功能");
            }
        }

        // 校验操作权限（预留，当前仅做日志记录）
        /*String requiredOperation = permission.operation();
        if (StringUtils.isNotBlank(requiredOperation)) {
            log.info("用户[{}]执行操作: {}", currentUser.getUsername(), requiredOperation);
            // 操作权限校验逻辑可在此扩展
        }*/

        return true;
    }
}
