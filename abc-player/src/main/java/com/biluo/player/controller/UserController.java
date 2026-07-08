package com.biluo.player.controller;

import com.biluo.player.annotation.Permission;
import com.biluo.player.context.UserContext;
import com.biluo.player.mode.entity.SysDict;
import com.biluo.player.mode.entity.SysUser;
import com.biluo.player.mode.vo.LoginUser;
import com.biluo.player.mode.vo.UserVo;
import com.biluo.player.service.SysUserService;
import com.biluo.player.util.JwtUtil;
import com.biluo.player.util.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户管理Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final SysUserService userService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(HttpServletRequest request, @RequestParam String username, @RequestParam String password) {
        SysUser user = userService.login(username, password);

        // 生成JWT Token（将用户信息存入token，后续请求无需查库）
        String token = JwtUtil.generateToken(user);

        // 保存token纪录
        userService.saveToken(user.getId(), token, request);

        // 返回用户信息和Token
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("username", user.getUsername());
        result.put("nickname", user.getNickname());
        result.put("menuPermissions", user.getMenuPermissions());

        return Result.success("登录成功", result);
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo() {
        LoginUser user = UserContext.getCurrentUser();

        Map<String, Object> result = new HashMap<>();
        result.put("username", user.getUsername());
        result.put("nickname", user.getNickname());
        result.put("menuPermissions", user.getMenuPermissions());
        return Result.success(result);
    }

    /**
     * 修改用户信息
     */
    @PutMapping
    public Result<Void> updateUser(@RequestBody UserVo user) {
        Long userId = UserContext.getCurrentUserId();
        userService.updateUser(userId, user);

        return Result.success("修改成功");
    }

    /**
     * 获取用户列表（管理端）
     */
    @Permission(menu = "userManage")
    @GetMapping("/list")
    public Result<List<SysUser>> getUserList() {
        List<SysUser> userList = userService.getUserList();
        return Result.success(userList);
    }

    /**
     * 创建新用户（管理端）
     */
    @Permission(menu = "userManage")
    @PostMapping("/create")
    public Result<Void> createUser(@RequestBody SysUser user) {
        userService.createUser(user);
        return Result.success("创建成功");
    }

    /**
     * 删除用户（管理端）
     */
    @Permission(menu = "userManage")
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("删除成功");
    }

    /**
     * 更新用户状态（管理端）
     */
    @Permission(menu = "userManage")
    @PutMapping("/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.updateUserStatus(id, status);
        return Result.success("更新成功");
    }

    /**
     * 获取菜单列表（管理端）
     */
    @Permission(menu = "userManage")
    @GetMapping("/menu/list")
    public Result<List<SysDict>> getMenuList() {
        List<SysDict> menuList = userService.getMenuList();
        return Result.success(menuList);
    }

    /**
     * 更新用户菜单权限（管理端）
     */
    @Permission(menu = "userManage")
    @PutMapping("/{id}/permissions")
    public Result<Void> updateUserPermissions(@PathVariable Long id, @RequestParam String menuPermissions) {
        userService.updateUserPermissions(id, menuPermissions);
        return Result.success("权限更新成功");
    }

    /**
     * 更新用户过期时间（管理端）
     */
    @Permission(menu = "userManage")
    @PutMapping("/{id}/expiration")
    public Result<Void> updateExpirationTime(@PathVariable Long id, @RequestParam String expirationTime) {
        userService.updateExpirationTime(id, LocalDateTime.parse(expirationTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return Result.success("过期时间更新成功");
    }
}
