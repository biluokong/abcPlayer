#!/bin/bash

# 检查是否传入提交信息参数
if [ $# -eq 0 ]; then
    echo "错误：请提供提交信息作为参数。"
    echo "用法：./git-push.sh '你的提交信息'"
    exit 1
fi

# 获取提交信息
COMMIT_MESSAGE="$1"

# 执行 Git 命令
echo "正在执行 git add ..."
git add .

echo "正在提交更改：$COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

echo "正在推送代码到远程仓库..."
git push

echo "操作完成！"