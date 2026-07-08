package com.biluo.player.annotation;

import java.lang.annotation.*;

/**
 * 权限注解
 * 可用于类和方法上，用于校验当前用户是否具有对应的菜单权限和操作权限
 * <p>
 * 当标注在类上时，该类下所有方法都需要具备指定权限
 * 当标注在方法上时，仅该方法需要权限校验（方法注解优先级高于类注解）
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Permission {

    /**
     * 菜单权限字符串
     * 对应 sys_user 表中 menu_permissions 字段的值
     */
    String menu() default "";

    /**
     * 操作权限字符串
     * 用于细粒度的操作级别权限控制
     */
    String operation() default "";
}
