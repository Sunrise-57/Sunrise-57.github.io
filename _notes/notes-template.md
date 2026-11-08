---
# ---------------------------------------------------------------------------
# 笔记模板：这个文件默认不发布（published: false）。
# 想发布时：复制一份改名，把 published 改成 true（或删掉这一行）。
# 文件名会成为网址：_notes/attention-as-computation.md → /notes/attention-as-computation/
# ---------------------------------------------------------------------------
title: "在这里写标题"
subtitle: "可选的一行副标题，会显示在标题下方"
date: 2026-11-08
topics: ["machine-learning", "deep-learning"]   # 可用值见 _data/topics.yml
summary: "一到两句话概括这篇笔记，会显示在列表页和搜索结果里。"
math: true          # 有公式时设为 true（会加载本地 KaTeX）
published: false    # 改完记得删掉这行或改成 true
---

开头先写结论或问题。读者在前两段就应该知道你想说什么。

## 一个小节

正文支持 **加粗**、*斜体*、`行内代码`、[链接](https://example.com) 和引用：

> 引用一段原文，或写一句用来撑住论证的话。

行内公式写成 $a^2 + b^2 = c^2$，独立公式用两个美元符号：

$$
\mathcal{L}(\theta) = \mathbb{E}_{x \sim \mathcal{D}}\left[ \ell(f_\theta(x), y) \right]
$$

### 代码

```python
import torch

def train(model, loader, optimizer):
    for x, y in loader:
        loss = model.loss(x, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

### 列表与表格

- 第一条
- 第二条
  - 嵌套也可以

| 方法 | 假设 | 代价 |
| --- | --- | --- |
| 方法 A | 数据独立同分布 | 低 |
| 方法 B | 分布缓慢漂移 | 中 |

## 开放问题

1. 这篇论文的结论在什么条件下不成立？
2. 如果去掉某个假设，会先坏在哪里？

---

*最后留一句自己的判断，哪怕还很粗糙。*