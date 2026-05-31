package com.biluo.player.mode.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 系统字典实体类
 */
@Data
@TableName("sys_dict")
public class SysDict implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 字典项ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 字典类型（如：menu_type表示菜单类型）
     */
    private String dictType;

    /**
     * 字典显示名称
     */
    private String dictName;

    /**
     * 字典值（如菜单权限标识）
     */
    private String dictValue;

    /**
     * 父级ID，支持树形结构
     */
    private Long parentId;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 是否为默认选项
     */
    private Boolean isDefault;

    /**
     * 前端CSS类名
     */
    private String cssClass;

    /**
     * 列表展示样式类
     */
    private String listClass;

    /**
     * 记录创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 记录更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 备注信息
     */
    private String remark;
}
