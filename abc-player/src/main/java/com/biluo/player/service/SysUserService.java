package com.biluo.player.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.biluo.player.mode.entity.SysDict;
import com.biluo.player.mode.entity.SysUser;
import com.biluo.player.mode.entity.SysUserToken;
import com.biluo.player.mode.vo.UserVo;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户Service接口
 */
public interface SysUserService extends IService<SysUser> {

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    SysUser getUserById(Long username);

    /**
     * 用户登录
     *
     * @param username 用户名
     * @param password 密码
     * @return 用户信息
     */
    SysUser login(String username, String password);

    /**
     * 保存用户token信息
     *
     * @param userId   用户ID
     * @param token    用户token
     * @param request  请求对象
     */
    void saveToken(Long userId, String token, HttpServletRequest request);

    /**
     * 根据用户ID获取用户token
     *
     * @param userId 用户ID
     * @return 用户token信息
     */
    SysUserToken getUserToken(Long userId);

    /**
     * 删除用户token信息
     *
     * @param userId 用户ID
     */
    void deleteUserToken(Long userId);

    /**
     * 修改用户信息
     *
     * @param userId 用户ID
     * @param user   用户信息
     */
    void updateUser(Long userId, UserVo user);

    /**
     * 获取用户列表（管理端）
     *
     * @return 用户列表
     */
    java.util.List<SysUser> getUserList();

    /**
     * 创建新用户（管理端）
     *
     * @param user 用户信息
     */
    void createUser(SysUser user);

    /**
     * 删除用户（管理端）
     *
     * @param id 用户ID
     */
    void deleteUser(Long id);

    /**
     * 更新用户状态（管理端）
     *
     * @param id     用户ID
     * @param status 状态：0-禁用，1-启用
     */
    void updateUserStatus(Long id, Integer status);

    /**
     * 获取用户菜单列表（管理端）
     *
     * @return 菜单列表
     */
    List<SysDict> getMenuList();

    /**
     * 更新用户菜单权限（管理端）
     *
     * @param id              用户ID
     * @param menuPermissions 菜单权限
     */
    void updateUserPermissions(Long id, String menuPermissions);

    /**
     * 更新用户过期时间（管理端）
     *
     * @param id             用户ID
     * @param expirationTime 过期时间
     */
    void updateExpirationTime(Long id, LocalDateTime expirationTime);

    /**
     * 处理已过期的用户：将过期用户的status改为禁用，并更新备注
     */
    void handleExpiredUsers();

}
