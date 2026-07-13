package com.biluo.player.util;

import com.biluo.player.mode.entity.SysUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

/**
 * JWT工具类
 */
@Slf4j
public class JwtUtil {

    // JWT密钥（实际项目中应该从配置文件读取）
    private static final String SECRET_KEY = "abc-player-secret-key-2026-jwt-token-generation";

    // Token有效期：2小时（毫秒）
    private static final long EXPIRATION_TIME = 2 * 60 * 60 * 1000;

    /**
     * 生成密钥
     */
    private static SecretKey getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 生成JWT Token
     *
     * @param user 用户信息
     * @return JWT Token
     */
    public static String generateToken(SysUser user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", user.getUsername());
        claims.put("nickname", user.getNickname() != null ? user.getNickname() : "");
        claims.put("menuPermissions", user.getMenuPermissions() != null ? user.getMenuPermissions() : "");

        String jti = UUID.randomUUID().toString().replaceAll("-", "");
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setClaims(claims)
                .setId(jti)
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 获取 jti
     *
     * @param token JWT Token
     * @return jti
     */
    public static String getJti(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getId() : null;
    }

    /**
     * 获取Token的过期时间
     *
     * @param token JWT Token
     * @return 过期时间
     */
    public static Date getExpirationDate(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getExpiration() : null;
    }

    /**
     * 从Token中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public static String getUsername(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("username").toString() : null;
    }

    /**
     * 从Token中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public static Long getUserId(String token) {
        Claims claims = getClaims(token);
        return claims != null ? Long.valueOf(claims.getSubject()) : null;
    }

    /**
     * 从Token中获取用户昵称
     *
     * @param token JWT Token
     * @return 用户昵称
     */
    public static String getNickname(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("nickname", String.class) : null;
    }

    /**
     * 从Token中获取菜单权限
     *
     * @param token JWT Token
     * @return 菜单权限
     */
    public static String getMenuPermissions(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("menuPermissions", String.class) : null;
    }

    /**
     * 验证Token是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public static boolean validateToken(String token, Consumer<Long> expiredCb) {
        try {
            Claims claims = getClaims(token);
            if (claims == null) {
                return false;
            }
            Date expiration = claims.getExpiration();
            boolean unExpired = expiration.after(new Date());
            if (!unExpired) {
                expiredCb.accept(Long.valueOf(claims.getSubject()));
            }
            return unExpired;
        } catch (Exception e) {
            log.error("Token验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 从Token中获取Claims
     *
     * @param token JWT Token
     * @return Claims
     */
    public static Claims getClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("解析Token失败: {}", e.getMessage());
            return null;
        }
    }
}
