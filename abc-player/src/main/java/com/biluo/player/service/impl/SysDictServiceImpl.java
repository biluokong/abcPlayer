package com.biluo.player.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.biluo.player.mode.entity.SysDict;
import com.biluo.player.mapper.SysDictMapper;
import com.biluo.player.service.SysDictService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 字典Service实现类
 */
@Slf4j
@Service
public class SysDictServiceImpl extends ServiceImpl<SysDictMapper, SysDict> implements SysDictService {

    @Override
    public List<SysDict> getDictByType(String dictType) {
        LambdaQueryWrapper<SysDict> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysDict::getDictType, dictType)
               .eq(SysDict::getStatus, 1)
               .orderByAsc(SysDict::getSortOrder);
        return this.list(wrapper);
    }
}
