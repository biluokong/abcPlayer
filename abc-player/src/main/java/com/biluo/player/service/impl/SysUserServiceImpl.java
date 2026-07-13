package com.biluo.player.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.biluo.player.mapper.SysDictMapper;
import com.biluo.player.mapper.SysUserMapper;
import com.biluo.player.mapper.SysUserTokenMapper;
import com.biluo.player.mode.entity.SysDict;
import com.biluo.player.mode.entity.SysUser;
import com.biluo.player.mode.entity.SysUserToken;
import com.biluo.player.mode.vo.UserVo;
import com.biluo.player.service.SysUserService;
import com.biluo.player.util.AppException;
import com.biluo.player.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

/**
 * 用户Service实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {
    private final SysUserTokenMapper sysUserTokenMapper;
    private final SysDictMapper sysDictMapper;

    @Override
    public SysUser getUserById(Long id) {
        SysUser user = getById(id);
        if (user == null) throw new AppException(401, "用户不存在");
        return user;
    }

    @Override
    public SysUser login(String username, String password) {
        SysUser user = lambdaQuery()
                .eq(SysUser::getUsername, username)
                .eq(SysUser::getPassword, password)
                .one();
        if (user == null) throw new AppException("用户名或密码错误");
        if (user.getStatus() != 1) throw new AppException("账号已被禁用");

        user.setLastLoginTime(LocalDateTime.now());
        updateById(user);

        return user;
    }

    @Override
    public void saveToken(Long userId, String token, HttpServletRequest request) {
        SysUserToken userToken = sysUserTokenMapper.selectOne(new LambdaQueryWrapper<SysUserToken>()
                .eq(SysUserToken::getUserId, userId));
        if (userToken == null) userToken = new SysUserToken();

        Claims claims = JwtUtil.getClaims(token);
        if (claims == null) throw new AppException("Token已过期");
        userToken.setTokenJti(claims.getId())
                .setTokenExpireTime(LocalDateTime.ofInstant(claims.getExpiration().toInstant(), ZoneId.systemDefault()))
                .setDeviceAddr(request.getRemoteAddr() + ":" + request.getRemotePort())
                .setDeviceInfo(request.getHeader("User-Agent"))
                .setLoginTime(LocalDateTime.now());

        if (userToken.getUserId() == null) {
            userToken.setUserId(userId);
            sysUserTokenMapper.insert(userToken);
        } else {
            sysUserTokenMapper.update(userToken, new LambdaQueryWrapper<SysUserToken>()
                    .eq(SysUserToken::getUserId, userId));
        }
    }

    @Override
    public SysUserToken getUserToken(Long userId) {
        return sysUserTokenMapper.selectOne(new LambdaQueryWrapper<SysUserToken>()
                .eq(SysUserToken::getUserId, userId));
    }

    @Override
    public void deleteUserToken(Long userId) {
        sysUserTokenMapper.delete(new LambdaQueryWrapper<SysUserToken>()
                .eq(SysUserToken::getUserId, userId));
    }

    @Override
    public void updateUser(Long userId, UserVo user) {
        // 获取用户信息
        SysUser sysUser = getUserById(userId);
        if (sysUser == null) throw new AppException("用户不存在");

        if (StringUtils.isNotEmpty(user.getNewPassword())) {
            // 验证旧密码是否正确
            if (!sysUser.getPassword().equals(user.getOldPassword())) {
                throw new AppException("旧密码错误");
            }
            lambdaUpdate().set(SysUser::getNickname, user.getNickname())
                    .set(SysUser::getPassword, user.getNewPassword())
                    .eq(SysUser::getId, userId)
                    .update();
            // 密码修改后，需要重新登录，使token失效
            sysUserTokenMapper.delete(new LambdaQueryWrapper<SysUserToken>()
                    .eq(SysUserToken::getUserId, userId));
            return;
        }

        lambdaUpdate().set(SysUser::getNickname, user.getNickname())
                .eq(SysUser::getId, userId)
                .update();
    }

    @Override
    public List<SysUser> getUserList() {
        return lambdaQuery()
                .ne(SysUser::getUsername, "admin")
                .orderByDesc(SysUser::getCreateTime)
                .list();
    }

    @Override
    public void createUser(SysUser user) {
        // 检查用户名是否已存在
        long count = lambdaQuery()
                .eq(SysUser::getUsername, user.getUsername())
                .count();
        if (count > 0) {
            throw new AppException("用户名已存在");
        }

        // 设置默认值
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        if (user.getMenuPermissions() == null) {
            user.setMenuPermissions("");
        }

        save(user);
    }

    @Override
    public void deleteUser(Long id) {
        SysUser user = getUserById(id);
        if (user == null) {
            throw new AppException("用户不存在");
        }
        removeById(id);
    }

    @Override
    public void updateUserStatus(Long id, Integer status) {
        SysUser user = getUserById(id);
        if (user == null) {
            throw new AppException("用户不存在");
        }
        lambdaUpdate()
                .set(SysUser::getStatus, status)
                .eq(SysUser::getId, id)
                .update();
    }

    @Override
    public List<SysDict> getMenuList() {
        return sysDictMapper.selectList(new LambdaQueryWrapper<SysDict>()
                .eq(SysDict::getDictType, "menu")
                .eq(SysDict::getStatus, 1));
    }

    @Override
    public void updateUserPermissions(Long id, String menuPermissions) {
        SysUser user = getUserById(id);
        if (user == null) {
            throw new AppException("用户不存在");
        }
        lambdaUpdate()
                .set(SysUser::getMenuPermissions, menuPermissions)
                .eq(SysUser::getId, id)
                .update();
    }

    @Override
    public void updateExpirationTime(Long id, LocalDateTime expirationTime) {
        SysUser user = getUserById(id);
        if (user == null) {
            throw new AppException("用户不存在");
        }
        lambdaUpdate()
                .set(SysUser::getExpirationTime, expirationTime)
                .eq(SysUser::getId, id)
                .update();
    }

    @Override
    public void handleExpiredUsers() {
        List<SysUser> expiredUsers = lambdaQuery()
                .ne(SysUser::getUsername, "admin")
                .isNotNull(SysUser::getExpirationTime)
                .lt(SysUser::getExpirationTime, LocalDateTime.now())
                .eq(SysUser::getStatus, 1)
                .list();

        for (SysUser user : expiredUsers) {
            lambdaUpdate()
                    .set(SysUser::getStatus, 0)
                    .set(SysUser::getRemark, "已过期")
                    .eq(SysUser::getId, user.getId())
                    .update();
            log.info("用户 {} (ID: {}) 已过期，自动禁用", user.getUsername(), user.getId());
        }
    }
}
