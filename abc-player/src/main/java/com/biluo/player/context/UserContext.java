package com.biluo.player.context;

import com.biluo.player.mode.vo.LoginUser;

/**
 * 全局用户上下文对象
 * 基于ThreadLocal实现，用于在请求链路中存储和获取当前登录用户信息
 * 用户信息从Token中解析，无需每次请求查询数据库
 */
public class UserContext {

    private static final ThreadLocal<LoginUser> USER_HOLDER = new ThreadLocal<>();

    /**
     * 设置当前用户信息
     */
    public static void setCurrentUser(LoginUser user) {
        USER_HOLDER.set(user);
    }

    /**
     * 获取当前用户信息
     */
    public static LoginUser getCurrentUser() {
        return USER_HOLDER.get();
    }

    /**
     * 获取当前用户ID
     */
    public static Long getCurrentUserId() {
        LoginUser user = USER_HOLDER.get();
        return user != null ? user.getUserId() : null;
    }

    /**
     * 获取当前用户名
     */
    public static String getCurrentUsername() {
        LoginUser user = USER_HOLDER.get();
        return user != null ? user.getUsername() : null;
    }

    /**
     * 获取当前用户菜单权限
     */
    public static String getMenuPermissions() {
        LoginUser user = USER_HOLDER.get();
        return user != null ? user.getMenuPermissions() : null;
    }

    /**
     * 清除当前用户信息（请求结束后调用，防止内存泄漏）
     */
    public static void clear() {
        USER_HOLDER.remove();
    }
}
