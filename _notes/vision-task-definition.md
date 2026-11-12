---
title: "传统视觉任务只是「感知」"
subtitle: "从一张闭环图出发，整理「传统 CV 属于哪个阶段」以及「为什么这个定义经不起追问」"
date: 2026-11-12
topics: ["computer-vision", "machine-learning", "uncertainty"]
summary: "把「感知—预测/推理—行动」这张图形式化之后，传统视觉任务只占第一格：它是单向、开环、离线的观测编码器。由此可以逐条拆开「视觉任务定义不清」的五条根因，并给出一个以智能体需求为轴心的替代定义。"
lang: zh
permalink: /zh/notes/vision-task-definition/
alt_url: /notes/vision-task-definition/
math: true
---

一张常被引用的图把智能体的循环画成四段：**感知 → 预测 ⇄ 推理 → 行动**，再由行动回流到感知。围绕它最常被问的问题是：传统的计算机视觉任务，属于其中哪一段？

答案看起来简单——感知。但要把这个答案说扎实，需要先说明「属于」是什么意思，再说明为什么这个划分会引出一连串关于「视觉任务定义」的质疑。这篇笔记做这两件事。

## 一、先把图读成一个形式化结构

图里的四个框加一条回流，用 POMDP 的语言可以对得很准：

| 图中的框 | 数学角色 | 做什么 |
| --- | --- | --- |
| 感知（Perception） | 观测模型 $e: \mathcal{I} \to \mathcal{S}$ | 把像素压成可判读的状态描述 |
| 预测 | 转移模型 $T: \mathcal{S} \times \mathcal{A} \to \Delta(\mathcal{S})$ | 给出「下一步会怎样」的分布 |
| 推理 | 在 $T$ 上做反事实与规划 | 比较不同动作导致的未来 |
| 行动 | 策略 $\pi: \mathcal{S} \to \mathcal{A}$ | 把状态变成作用于世界的动作 |
| 回流 | $a_t \to I_{t+1}$ | 决策改变下一次观测 |

两个细节值得留意：**预测与推理之间是双向箭头**，说明这里有「假设—检验—修正」的内部循环；**底部那条回流箭头**说明整个系统被自己的行动喂养。

**关于这个词**：图出自[西湖大学 Zhenhailong Wang 实验室](https://mikewangwzhl.github.io/lab/)，原图英文写的是 **Perception**；流传的中文版把它译作「洞察力」。这不是翻译，是术语替换——而且换得不像科研：

- **不可操作化**：感知可以写成 $e: I \to s$，配 mAP、IoU、ECE 这类指标；洞察力没有单位、没有指标，也没有失败模式，你无法设计实验去测它是否提升。
- **范畴错误**：它是对人的判断能力的评价词，不是系统计算出的函数；把它安在一个模块上，是拟人化而不是建模。
- **预设结论**：「洞察力」已经预设了这一格产出了理解，而「这一格只产出状态估计」正是下文要论证的。

所以下面一律用「感知」，只在讨论这处译名时提「洞察力」。

## 二、传统 CV 只占第一格

一句话定义：传统视觉任务可刻画为一个**单向、开环、离线**的观测编码器。输入是图像，输出是描述，中间没有动作 $a$，也没有下一状态 $s'$。

这不是修辞，可以逐条检验：

| 检验问题 | 传统 CV 的答案 | 越过这一格需要什么 |
| --- | --- | --- |
| 输出里有「下一步」吗 | 没有，只有当前帧的性质 | 转移模型、视频预测 |
| 支持「如果……会怎样」吗 | 不支持，只拟合相关性 | 可干预的因果/动力学模型 |
| 会产生作用于环境的动作吗 | 不会，输出给人或下游模块 | 策略与执行器 |
| 决策会改变下一次输入吗 | 不会，开环、离线、逐帧评估 | 主动感知、具身闭环 |
| 优化目标是任务回报吗 | 不是，是标注数据的似然（交叉熵、IoU、AP） | 回报函数、价值函数 |

五条全是「否」，因此它严格属于感知阶段。打个比方：**它是眼睛，不是脑，也不是手。**

更形式化地说：传统 CV 优化的是 $P(y \mid I)$ 的经验风险，闭环系统求解的是 $\arg\max_a \mathbb{E}[R \mid s]$。前者是统计推断，后者是控制。

## 三、三类「看起来越界」的工作

1. **光流、视频预测、轨迹预测、早期动作识别**：形式上做了 $s \to s'$，但预测的是可观测量自身的延续，不服务于任何决策，也没有反事实分支。这是预测的雏形，不是世界模型。判据只有一条：它能不能回答「我如果做 $a$ 会怎样」。
2. **SLAM、多视图几何、NeRF / 3D 重建**：输出位姿、结构、辐射场，属于状态估计。它是闭环的**接口**（给下游提供 $s$），但自己不合环——没有动作，也没有回报。
3. **主动视觉、具身智能**：只有这里的「看哪里、动一下再看」是由策略决定的，才真正用上了那条回流箭头。这是传统 CV 与行动之间唯一实质性的连接。

## 四、为什么「视觉任务」这个定义经不起追问

| # | 根因 | 例子 |
| --- | --- | --- |
| 1 | 任务是**数据集定义**的，不是问题定义的 | COCO 检测与 LVIS 检测不是同一个任务；AP 里的 IoU 阈值与 NMS 实质参与了任务定义 |
| 2 | **真值是人类约定**，且约定互相冲突 | 同一像素在语义、部件、amodal、panoptic 分割里有四种「正确答案」 |
| 3 | 任务被假定成**函数**，实际是条件分布 | 遮挡下的形状、单目深度本质欠定；多峰的条件分布被压缩为单一众数 |
| 4 | 任务清单是**历史沿革的产物**，缺乏本体论 | MNIST → ImageNet → COCO → VQA，每一步都是「上个任务的缺口 + 新数据集」 |
| 5 | **划分依据倒置**：任务按「人能标什么」倒推，而非按「要用什么」正推 | 可供性、物理属性、不确定性没有标准任务；而一些精细任务的上下游用途有限 |

第 5 条是根子，前四条是它的症状。

## 五、构念效度：测的不是声称在测的

所有症状最后汇聚成一个测量学问题。模型可以利用数据里的伪相关通过测试（shortcut learning），可以在 ImageNet 上超过人类却在分布偏移下崩溃。这说明被定义并优化的那个映射，并不是任务名所声称的能力。

这就是**构念效度**（construct validity）缺失：benchmark 是一个操作定义，而操作定义被当成了本质定义。传统任务在**内部**是良定义的——给定数据分布、标注协议、指标，它就是一个明确的优化问题；它的含混全部在**外部**：能否迁移、是否对应真实能力、边界在哪里。

## 六、一个更可操作的替代定义

与其问「有哪些视觉任务」，不如问「智能体需要知道什么」。按这个标准，任务只有四类：

1. **状态估计**：$I \to \Delta(\mathcal{S})$，且要给出校准后的不确定性；
2. **动力学**：$(s, a) \to \Delta(\mathcal{S})$；
3. **可供性**：$s \to 2^{\mathcal{A}}$，即该状态允许哪些动作；
4. **价值**：$s \to \mathbb{R}$，即该状态有多好。

传统 CV 占了第一类的一半不到。这也解释了为什么「传统任务清单」看起来发散：它是对「智能体需要什么」按标注成本做的一次投影，投影当然会失真。

## 七、结论

> 传统计算机视觉任务可被刻画为观测模型 $e: I \to s$ 的经验拟合：输入为单帧或短时观测，输出为对当前状态的描述，优化目标为标注数据的似然而非任务回报，评估协议为离线、开环、逐帧。因此它在「感知—预测/推理—行动」的闭环中仅承担感知编码职能，既不具备状态转移模型，也不产生作用于环境的动作，因而不构成闭环。将此类任务等同于「视觉能力」，本质上是把一个由数据集与标注协议锚定的操作定义误当成了能力定义，这正是其任务边界长期含混的根源。

## 附：术语对照

| 中文 | English | 说明 |
| --- | --- | --- |
| 感知 | perception | 中文流传版把它译作「洞察力」（insight），属术语替换，非科研用语 |
| 观测模型 | observation model | $e: I \to s$ |
| 转移模型 | transition model | $T: (s, a) \to \Delta(\mathcal{S})$ |
| 策略 | policy | $\pi: s \to a$ |
| 开环 / 闭环 | open-loop / closed-loop | |
| 标注数据的似然 | label likelihood | 传统任务的优化目标 |
| 操作定义 | operational definition | |
| 构念效度 | construct validity | |
| 可供性 | affordance | |
| 欠定 | underdetermined | |
| 历史沿革的产物 | historical accumulation | |
| 逐帧评估 | per-frame evaluation | |

## 参考文献

- [Zhenhailong Wang's Lab, Westlake University](https://mikewangwzhl.github.io/lab/) — 闭环图的出处。
- Marr, *Vision: A Computational Investigation into the Human Representation and Processing of Visual Information* (1982).
- Bertero, Poggio & Torre, [Ill-posed problems in early vision](https://scholar.google.fr/citations?view_op=view_citation&hl=ja&user=ngaTx78AAAAJ&citation_for_view=ngaTx78AAAAJ:u-x6o8ySG0sC), *Proceedings of the IEEE* (1988).
- Geirhos et al., [Shortcut learning in deep neural networks](https://ei.is.mpg.de/publications/geirhosetal20), *Nature Machine Intelligence* (2020).
- Raji et al., [AI and the Everything in the Whole Wide World Benchmark](https://export.arxiv.org/abs/2111.15366) (2021).
- Jacobs & Wallach, [Measurement and Fairness](https://export.arxiv.org/abs/1912.05511v2), FAccT (2021).
- Zamir et al., [Taskonomy: Disentangling Task Transfer Learning](https://openaccess.thecvf.com/content_cvpr_2018/html/Zamir_Taskonomy_Disentangling_Task_CVPR_2018_paper.html), CVPR (2018).
- Zhai et al., [A Large-scale Study of Representation Learning with the Visual Task Adaptation Benchmark](https://scholar.google.ru/scholar?cluster=2504838252241466889) (2019).
- LeCun, *A Path Towards Autonomous Machine Intelligence* (2022).

---

*如果要用一句话概括：传统视觉任务把「看见」做成了一个可评测的问题，却从未回答「看见是为了什么」。*
