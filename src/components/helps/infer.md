---
title: ""
date: 2023-11-05
description: ""
---
### 1. 模型激活
模型只有在激活选中后才能进行推理或者应用全局设置。
+ 单个模型激活：点击模型卡片右上角滑块
+ 全部模型激活：全局设置-模型全选
### 2. 全局设置
在全局设置面板可以对已选中的模型进行批量参数修改
### 3. 随机音频示例
通过搜索指定根目录下的`train.list`与`var.list`文件，随机抽取一条训练使用的语音与文本用于推理与对比。需要指定抽取的根目录与语言，默认为`/Data`