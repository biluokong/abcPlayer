package com.biluo.player.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.biluo.player.mode.entity.SysDict;

import java.util.List;

/**
 * 字典Service接口
 */
public interface SysDictService extends IService<SysDict> {

    /**
     * 根据字典类型查询字典列表
     *
     * @param dictType 字典类型
     * @return 字典列表
     */
    List<SysDict> getDictByType(String dictType);
}
