---
title: "线性 In-Context Query 任务与条件性单次前向下界"
subtitle: "一个表格原生任务，以及固定深度模型一次前向的能力边界"
date: 2026-11-09
pinned: true
topics: ["learning-theory", "mathematics"]
summary: "定义一个表格原生的纯数值任务 LinICQ，并用一个 NC1-困难的自动机子族说明：在 TC0 ≠ NC1 的假设下，固定深度、对数精度、单次前向的表格基础模型不可能在所有规模上精确求解它。"
lang: zh
permalink: /zh/notes/linicq-bound/
alt_url: /notes/linicq-bound/
math: true
---

表格基础模型（TabPFN、LimiX 等）通常在一次前向传播里读入若干已标注的上下文行和一个待预测的查询行。这篇笔记定义一个纯数值的表格任务，用来问一个具体的问题：**当上下文已经足够确定答案时，固定深度的单次前向是否仍然可能算不出来？**

答案是条件性的「是」。构造分两步：先把线性求解写成一个表格 episode，再说明这个任务包含一个 NC1-困难的子族，而固定深度的单次前向落在 TC0 里。

## 问题设置

考虑一个表格 episode：它由带标签的 Context 样本和一个标签未知的 Query 样本组成。设特征维度为 $m$，Context 为

$$
\mathcal{D}_{C}=\{(a_i,b_i)\}_{i=1}^{m},\qquad a_i\in\mathbb{R}^{m},\ b_i\in\mathbb{R},
$$

Query 为

$$
\mathcal{D}_{Q}=\{(q,\mathsf{MASK})\},\qquad q\in\mathbb{R}^{m}.
$$

这里的 $\mathsf{MASK}$ 表示 Query 标签未知，需要由模型预测。我们承诺存在同一个未知参数向量 $\theta\in\mathbb{R}^{m}$，使所有 Context 行都严格满足

$$
a_i^{\top}\theta=b_i,\qquad i=1,\dots,m,
$$

任务是根据 Context 预测 Query 标签 $y_Q=q^{\top}\theta$。

## 线性 In-Context Query

**定义（LinICQ）。** 给定

$$
A\in\{-1,0,1\}^{m\times m},\qquad b\in\{0,1\}^{m},\qquad q\in\{0,1\}^{m},
$$

其中 $A$ 可逆。令 $\theta=A^{-1}b$。Context 由 $A$ 的各行及其对应标签组成，Query 为 $q$，模型需要输出

$$
y_Q=q^{\top}A^{-1}b .
$$

在用于二分类下界的困难子族中，进一步承诺 $q^{\top}A^{-1}b\in\{0,1\}$。

将 Context 与 Query 合并后，整个 episode 就是一个普通的数值表格：

$$
T(A,b,q)=
\begin{bmatrix}
A & b\\
q^{\top} & \mathsf{MASK}
\end{bmatrix}.
$$

其中前 $m$ 行是 Context，最后一行是 Query；前 $m$ 列是特征，最后一列是标签列。

### 与表格模型接口的对应

对于采用训练集 / 测试集接口的模型，可以取 $X_{\text{train}}=A$、$y_{\text{train}}=b$、$X_{\text{test}}=q^{\top}$。

对于采用联合 masked table 接口的模型，直接输入 $T(A,b,q)$。Query 的标签位置被编码为 NaN、缺失值或专门的 MASK embedding，但真实的 $y_Q$ 不进入模型输入。

### 为什么这是表格原生任务

每个 Context 行 $(a_i,b_i)$ 都是标准的数值型特征—标签样本。方程 $a_i^{\top}\theta=b_i$ 只是这些监督样本共同满足的代数规律，而不是自然语言形式的「方程字符串」。

Context 行可以任意重排；若同时置换 $A$ 的列、$q$ 的坐标和 $\theta$ 的坐标，任务答案保持不变。因此，该任务不依赖自然语言 token 的绝对顺序。

## 由有限自动机产生的困难子族

为了说明 LinICQ 包含长顺序计算，固定一个确定有限自动机

$$
D=(S,\Sigma,\delta,s_0,F),
$$

其中 $S$ 是状态集合，$\Sigma$ 是字符集合，$\delta:S\times\Sigma\to S$ 是转移函数，$s_0$ 是初始状态，$F\subseteq S$ 是接受状态集合。输入字符串记为 $w=\omega_1\omega_2\cdots\omega_n$。

选择一个其成员问题为 NC1-完全问题的固定有限自动机。下面把「$D$ 是否接受 $w$」编码成一个 LinICQ episode。

### 状态变量

对每个时间 $i\in\{0,1,\dots,n\}$ 和状态 $s\in S$，定义

$$
z_{i,s}=\mathbf{1}\{\text{自动机读完 }\omega_1\cdots\omega_i\text{ 后处于状态 }s\}.
$$

因为自动机在每个时刻只能处于一个状态，向量 $z_i=(z_{i,s})_{s\in S}$ 是 one-hot 向量，并满足

$$
\sum_{s\in S} z_{i,s}=1 .
$$

### 初始条件与转移方程

初始状态由以下方程确定：

$$
z_{0,s_0}=1,\qquad z_{0,s}=0\quad(s\neq s_0).
$$

读到第 $i$ 个字符 $\omega_i$ 后，对每个目标状态 $s\in S$ 写出

$$
z_{i,s}-\sum_{r:\,\delta(r,\omega_i)=s} z_{i-1,r}=0 .
$$

右侧的求和遍历所有在读取 $\omega_i$ 后会转移到 $s$ 的前驱状态 $r$。由于 $z_{i-1}$ 是 one-hot 向量，该和式只能等于 $0$ 或 $1$，并且恰好表示第 $i$ 步是否到达状态 $s$。

### 最终接受变量

增加一个未知变量 $u$，并写出

$$
u-\sum_{s\in F} z_{n,s}=0 .
$$

由于最终状态向量 $z_n$ 是 one-hot 向量，

$$
u=\mathbf{1}\{w\in L(D)\}.
$$

这里的 $u$ 是需要由方程组确定的未知输出变量，并未作为已知答案写入 Context。

### 矩阵形式

将未知变量按时间顺序排列：

$$
\theta_w=(z_0,z_1,\dots,z_n,u)^{\top}.
$$

全部方程可统一写成 $A_w\theta_w=b_w$，其中 $A_w$ 具有单位块下三角结构：

$$
A_w=
\begin{bmatrix}
I & 0 & 0 & \cdots & 0\\
-M_{\omega_1} & I & 0 & \cdots & 0\\
0 & -M_{\omega_2} & I & \cdots & 0\\
\vdots & & \ddots & \ddots & \vdots\\
0 & \cdots & 0 & -c_F^{\top} & 1
\end{bmatrix}.
$$

这里 $M_{\omega_i}$ 是字符 $\omega_i$ 的状态转移矩阵，$c_F$ 是接受状态的指示向量。所有对角块均为单位矩阵，因此

$$
\det(A_w)=1,
$$

故 $A_w$ 可逆，方程组有唯一解。

令 $e_u$ 表示选择变量 $u$ 的标准基向量，并取 Query 为 $q=e_u$。于是

$$
q^{\top}A_w^{-1}b_w=u=\mathbf{1}\{w\in L(D)\}.
$$

一个自动机成员实例 $w$，就这样被转化成了一个纯数值的 Context / Query 表格预测实例。

## 条件性单次前向能力边界

设 $N$ 表示整个表格 episode 的二进制编码长度。考虑一族 TabPFN / LimiX 式轴向表格 Transformer，并施加以下资源限制：

$$
L=O(1),\qquad p(N)=O(\log N),\qquad \operatorname{size}(M_N)=\operatorname{poly}(N),
$$

其中 $L$ 是 block 深度，$p(N)$ 是内部数值精度，并且模型只进行一次非递归前向传播。

若 embedding、跨特征注意力、跨样本注意力、FFN、residual、normalization 和输出比较均满足相应的有限精度电路模拟条件，则

$$
\text{Embed},\ \text{FeatureAttn},\ \text{SampleAttn},\ \text{FFN/Norm/Residual}\in \mathrm{TC}^0 .
$$

固定数量组件和固定数量 block 的复合仍属于 TC0，因此

$$
\mathcal{F}_{\text{TabularTransformer}}\subseteq \mathrm{TC}^0 .
$$

另一方面，映射

$$
\rho:\ w\mapsto (A_w,b_w,e_u)
$$

可以由 uniform AC0（事实上在合适编码下可由更弱的局部电路）计算，因为 $A_w$ 的每个系数只依赖固定自动机的转移表、固定行列位置和至多一个输入字符 $\omega_i$。该归约没有预先计算自动机的运行结果。

> **定理。** 假设 $\mathrm{TC}^0\neq\mathrm{NC}^1$。不存在一个可扩展的 TabPFN / LimiX 式轴向表格 Transformer 模型族，同时满足：固定 block 深度、$O(\log N)$ 位精度、多项式总规模和一次非递归前向传播，并能对所有规模、所有合法的上述 LinICQ 困难子族 episode 精确预测 Query 标签。

**证明思路。** 反设存在这样的模型族 $M$。对任意自动机成员实例 $w$，先用 $\rho\in\mathrm{AC}^0$ 构造表格 $T_w=T(A_w,b_w,e_u)$，再调用 $M$ 得到

$$
M(T_w)=e_u^{\top}A_w^{-1}b_w=\mathbf{1}\{w\in L(D)\}.
$$

由于 $\mathrm{AC}^0\subseteq\mathrm{TC}^0$，且 TC0 对常数次复合封闭，便得到这个 NC1-完全的自动机成员问题属于 TC0，于是 $\mathrm{NC}^1\subseteq\mathrm{TC}^0$。结合标准的包含关系 $\mathrm{TC}^0\subseteq\mathrm{NC}^1$，得到 $\mathrm{TC}^0=\mathrm{NC}^1$，与假设矛盾。

### 这条下界说了什么，没说什么

该结论是**条件性、最坏情况、增长规模、精确求解和 one-shot** 意义下的结论。它不表示某个有限的 checkpoint 在所有小规模实例上都会失败，也不直接推出平均分布准确率低、近似求解不可能，或加入多轮迭代之后仍然不可能。

### 一个明确的困难自动机

不同固定 DFA 的成员判断复杂度可以不同。由 Barrington 定理及其 uniform 版本的标准推论，固定语言

$$
WPe(S_5)=\{g_1\cdots g_n\in S_5^{*}: g_1g_2\cdots g_n=e\}
$$

对 DLOGTIME-uniform NC1 在 DLOGTIME-uniform AC0 many-one 归约下完全。该语言由固定 DFA

$$
D_{\text{hard}}=(S_5,S_5,\delta,e,\{e\}),\qquad \delta(q,g)=qg
$$

识别。这里使用一个明确的困难 DFA 作为归约源，并不声称所有 DFA 都具有相同复杂度。

对固定状态编号、字符编号和表格布局，映射 $\rho_n:w\mapsto T(A_w,b_w,e_u)$ 的每个输出单元只依赖固定坐标、固定转移表和至多一个输入字符。因此 $\rho_n$ 是 DLOGTIME-uniform AC0 transducer：它只写出系数和右端，没有预先计算状态轨迹或接受答案。

## 小结

这条边界只约束「一次非递归前向」。把状态传播展开成显式的推理步，或者把转移过程合并成一棵平衡树，都属于另一类计算模型，能力上界需要另行讨论——那是这个任务的下一步。

## 参考文献

1. D. A. Barrington. Bounded-width polynomial-size branching programs recognize exactly those languages in NC1. *Journal of Computer and System Sciences*, 38(1):150–164, 1989.
2. W. Merrill and A. Sabharwal. The parallelism tradeoff: Limitations of log-precision transformers. *Transactions of the Association for Computational Linguistics*, 11:531–545, 2023. [arXiv:2207.00729](https://arxiv.org/abs/2207.00729)
3. G. Feng, B. Zhang, Y. Gu, H. Ye, D. He, and L. Wang. Towards revealing the mystery behind chain of thought: A theoretical perspective. In *NeurIPS*, 2023. [arXiv:2305.15408](https://arxiv.org/abs/2305.15408)
4. A. Moitra, E. Mossel, and C. Sandon. Parallels between phase transitions and circuit complexity? 2019. [arXiv:1904.05483](https://arxiv.org/abs/1904.05483)
5. N. Hollmann, S. Müller, L. Purucker, A. Krishnakumar, M. Körfer, S. B. Hoo, R. T. Schirrmeister, and F. Hutter. Accurate predictions on small data with a tabular foundation model. *Nature*, 637:319–326, 2025.
6. LimiX Team (Stable AI and Tsinghua University). LimiX: Unleashing structured-data modeling capability for generalist intelligence. Technical report, 2025.
7. S. Müller, N. Hollmann, S. Pineda Arango, J. Grabocka, and F. Hutter. Transformers can do Bayesian inference. In *ICLR*, 2022. [arXiv:2112.10510](https://arxiv.org/abs/2112.10510)