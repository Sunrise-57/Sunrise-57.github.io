---
title: "固定深度表格基础模型的计算能力边界"
subtitle: "一个条件性平均情形分离"
date: 2026-11-09
pinned: true
topics: ["learning-theory", "mathematics"]
summary: "当上下文已经包含足够信息时，固定深度、单次前向的表格预测器是否仍可能因计算不足而失败？本文构造一族无噪声表格任务，在 TC0 ≠ NC1 的假设下给出一个平均情形的分离。"
lang: zh
permalink: /zh/notes/average-case-separation/
alt_url: /notes/average-case-separation/
math: true
---

先验数据拟合网络（PFN）及其表格模型实例 TabPFN、LimiX，通常在一次前向传播中读入已标注的上下文行与待预测的查询行。这引出一个区分：模型失败究竟是因为**上下文没有识别任务所需的信息**，还是因为**信息虽然存在，固定深度的推理过程无法完成所需计算**？

这篇笔记构造的任务把两者分开。固定规模参数 $n$，每个 episode 先采样隐藏参数 $\theta$，再从同一行分布独立采样 $m$ 条上下文和一条查询。上下文不包含查询答案或中间计算结果；在 $m=2n$ 时 Bayes 准确率趋于 $1$。同时，任务的每条标签都包含一个 NC1-困难的线性求解核。

全文的结论可以先概括为：

$$
\mathrm{Acc}^{\text{Bayes}}_{n}\longrightarrow 1
\qquad\text{但}\qquad
\liminf_{n\to\infty}\ \sup_{M\in\mathcal{M}_n(L,k)} \mathrm{Acc}_n(M)=\frac12 .
$$

左边表示信息充分，右边表示固定深度的单次前向计算不足。

## 形式框架

### 表格 ICL、平均准确率与 Bayes 风险

固定任务先验 $\Pi_n$。每个 episode 先采样隐藏参数 $\theta\sim\Pi_n$，再条件于 $\theta$ 独立同分布地采样

$$
X_1,\dots,X_m,X^{*}\ \overset{\text{i.i.d.}}{\sim}\ P_n .
$$

上下文与查询分别为

$$
D=\{(X_1,f_\theta(X_1)),\dots,(X_m,f_\theta(X_m))\},\qquad X^{*}.
$$

预测器观察 $(D,X^{*})$，输出 $f_\theta(X^{*})$ 的预测。本文只讨论固定且公开的 episode 分布。预测器 $M$ 的平均准确率和风险定义为

$$
\mathrm{Acc}_{n,m}(M):=\Pr_{\theta,D,X^{*}}\!\big[M(D,X^{*})=f_\theta(X^{*})\big],
\qquad
R_{n,m}(M):=1-\mathrm{Acc}_{n,m}(M).
$$

Bayes 准确率可以直观理解为「数据本身最多允许预测多准」：若不限制计算资源，并已知任务先验与数据生成规律，只根据当前 context 和 query 所能达到的最高平均正确率。它衡量的是**预测信息是否充分**，而不是计算是否够用。

### 复杂度类与条件性前提

设 $N$ 为二进制输入长度。TC0 是由常数深度、多项式规模、无界扇入阈值电路族计算的函数类；NC1 是由 $O(\log N)$ 深度、多项式规模、有界扇入电路族计算的函数类。本文使用通常的非一致版本，并采用以下未证明的复杂性假设：

> **假设。** $\mathrm{TC}^0\neq\mathrm{NC}^1$。

Barrington 定理表明，固定非可解有限群（例如 $A_5$）上的字问题是 NC1-完全的；第 3 节会把该问题归约到本文的线性计算核。

非一致模型允许第 $n$ 个电路硬编码只依赖 $n$、长度为多项式的常量，这足以固定概率方法所保证存在的随机掩码，以及平均化论证所选出的上下文。但它不允许在看到 $n$ 之后任意改变资源指数：深度界 $L$ 与规模指数 $k$ 必须预先固定，即同一电路族满足 $\operatorname{depth}(C_n)\le L$ 和 $\operatorname{size}(C_n)\le N^{k}+k$。

### 单次前向预测器类

令 $N_n$ 为整个 episode 的二进制输入长度，定义

$$
\mathcal{M}_n(L,k):=\Big\{M:\ M\ \text{的完整推理流程可由深度至多}\ L\ \text{、规模至多}\ N_n^{k}+k\ \text{的阈值电路模拟}\Big\}.
$$

## 有限域上的一坐标线性任务

### 任务定义与标签平衡

**定义 3.1（一坐标线性任务）。** 令

$$
\Omega_n:=\mathrm{GL}(n,2)\times\mathbb{F}_2^{n},
\qquad
g_n(A,b):=e_1^{\top}A^{-1}b\in\{0,1\},
$$

其中 $e_1$ 是第一个标准基向量。输入分布为

$$
A\sim\mathrm{Unif}(\mathrm{GL}(n,2)),\qquad b\sim\mathrm{Unif}(\mathbb{F}_2^{n}),
$$

且 $A,b$ 独立。输入由 $A,b$ 的全部 $n^2+n$ 个二进制特征组成，不含运算符、解向量或中间结果。

对每个固定的 $A$，映射 $b\mapsto A^{-1}b$ 是 $\mathbb{F}_2^{n}$ 上的双射，故 $A^{-1}b$ 均匀，$g_n(A,b)$ 也严格均匀。因此常数预测器的准确率恰为 $1/2$。

需要注意：不同表格行是独立同分布的；由于 $A$ 被限制为可逆矩阵，同一行内的矩阵元素并非独立。

### 精确随机自归约

自归约的想法是：要算原实例的 $g_n(A,b)$，转而去算同一个函数在随机新实例 $(A',b')$ 上的值，再异或回来。

**引理 3.2（矩阵自归约）。** 固定任意 $(A,b)\in\Omega_n$，独立采样

$$
R\sim\mathrm{Unif}(\mathrm{GL}(n,2)),\qquad t\sim\mathrm{Unif}(\mathbb{F}_2^{n}),
$$

并定义 $A':=RA$、$b':=R(b+At)$。则：

1. $(A')^{-1}b'=A^{-1}b+t$，从而 $g_n(A',b')=g_n(A,b)\oplus t_1$；
2. 对每个固定的 $(A,b)$，映射 $(R,t)\mapsto(A',b')$ 是 $\mathrm{GL}(n,2)\times\mathbb{F}_2^{n}$ 上的双射，因此 $(A',b')$ 精确服从定义 3.1 的输入分布；
3. 逆映射为 $R=A'A^{-1}$ 和 $t=A^{-1}(R^{-1}b'+b)$，但执行前向变换不需要求 $A^{-1}$。

**证明。** 直接计算：

$$
(A')^{-1}b'=(RA)^{-1}R(b+At)=A^{-1}b+t,
$$

即得 (1)。给定 $(A,b)$ 与 $(A',b')$ 时，上述逆公式唯一确定 $(R,t)$，故映射为双射，得到 (2) 与 (3)。

**引理 3.3（平均优势转化为逐点随机优势）。** 设确定预测器 $h$ 在定义 3.1 的均匀分布上准确率为 $q$。定义

$$
\tilde h(A,b;R,t):=h\big(RA,\,R(b+At)\big)\oplus t_1 ,
$$

则对每一个 $(A,b)\in\Omega_n$ 都有

$$
\Pr_{R,t}\big[\tilde h(A,b;R,t)=g_n(A,b)\big]=q .
$$

**证明。** 由引理 3.2(1)，事件 $\tilde h(A,b;R,t)=g_n(A,b)$ 等价于 $h(A',b')=g_n(A',b')$（两边同时异或一个 $t_1$）；由引理 3.2(2)，对每个固定原输入，$(A',b')$ 都精确服从目标均匀分布。

### NC1-困难性

**命题 3.4（一坐标任务已经足够困难）。** 若函数族 $\{g_n\}$ 可由 TC0 电路精确计算，则 $A_5$ 群字问题也属于 TC0。因此，由 Barrington 定理，$\{g_n\}$ 对 NC1 是困难的。

**证明思路。** 把输入群元素表示成五维置换矩阵 $P_1,\dots,P_\ell$。对每个 $j\in\{1,\dots,5\}$ 引入五维变量块 $u_0,\dots,u_\ell$，并令

$$
u_0=e_j,\qquad u_i=P_{\ell+1-i}\,u_{i-1}\quad(i=1,\dots,\ell).
$$

这些方程构成维度 $n=5(\ell+1)$ 的块下双对角系统，对角块都是 $I_5$，因而对每个输入都可逆；其解满足

$$
u_\ell=P_1P_2\cdots P_\ell\,e_j .
$$

通过固定的变量列置换，可把 $u_\ell$ 的任一坐标移到解向量第一坐标。对 $i,j\in\{1,\dots,5\}$ 作常数 $25$ 次 $g_n$ 查询即可恢复乘积矩阵，再判断其是否为单位矩阵。从群元素编码生成该线性系统、做列置换和最后的比较均可在 AC0 中完成。

### 均匀分布上的近随机猜测下界

**定理 3.5（一坐标线性任务的平均情形下界）。** 在假设 $\mathrm{TC}^0\neq\mathrm{NC}^1$ 下，对任意预先固定的 $L,k$ 和任意 $\gamma>0$，存在无限多个 $n$ 使

$$
\sup_{h\in C_n(L,k)}\ \Pr_{(A,b)\sim\mathrm{Unif}(\Omega_n)}\big[h(A,b)=g_n(A,b)\big]\le\frac12+\gamma .
$$

等价地，

$$
\liminf_{n\to\infty}\ \sup_{h\in C_n(L,k)} \mathrm{Acc}_n(h)=\frac12 .
$$

**证明思路。** 反设存在固定的 $L,k,\gamma>0$，使所有充分大的 $n$ 都有电路 $h_n$ 取得 $q_n>1/2+\gamma$ 的平均准确率。

先固定任意一个合法输入 $(A,b)\in\Omega_n$；它的真实标签 $g_n(A,b)$ 在下面的随机过程中保持不变。对每个 $r=1,\dots,T$，独立采样一对掩码 $R^{(r)}\sim\mathrm{Unif}(\mathrm{GL}(n,2))$、$t^{(r)}\sim\mathrm{Unif}(\mathbb{F}_2^{n})$，并运行引理 3.3 的随机变换。令

$$
Z_r:=\mathbf{1}\Big\{h_n\big(R^{(r)}A,\ R^{(r)}(b+At^{(r)})\big)\oplus t^{(r)}_1=g_n(A,b)\Big\}\in\{0,1\},
$$

其中 $Z_r=1$ 表示第 $r$ 次经 $t^{(r)}_1$ 校正后的答案正确。由引理 3.3，这些随机变量相互独立，且对每个 $r$ 都有 $\Pr[Z_r=1]=q_n>1/2+\gamma$。

记 $\bar Z:=T^{-1}\sum_{r=1}^{T}Z_r$。取 $T$ 为奇数时，多数表决失败只可能在 $\bar Z\le 1/2$ 时发生。Hoeffding 不等式的下尾形式给出

$$
\Pr\big[\bar Z-\mathbb{E}[\bar Z]\le-\varepsilon\big]\le\exp(-2T\varepsilon^{2}).
$$

本处 $\mathbb{E}[\bar Z]=q_n>1/2+\gamma$；因此若 $\bar Z\le 1/2$，则 $\bar Z-q_n<-\gamma$。代入 $\varepsilon=\gamma$ 得到对这个固定输入的逐点失败概率

$$
\Pr[\text{多数表决失败}]\le\Pr\Big[\bar Z\le\frac12\Big]\le\Pr\big[\bar Z-q_n\le-\gamma\big]\le\exp(-2T\gamma^{2}).
$$

合法输入总数满足

$$
|\Omega_n|=|\mathrm{GL}(n,2)|\,2^{n}<2^{n^2+n},
$$

这里只用了 $|\mathrm{GL}(n,2)|<2^{n^2}$，即它是所有 $n\times n$ 二元矩阵集合的子集。取奇数

$$
T>\frac{(n^2+n+1)\log 2}{2\gamma^{2}},
$$

则 $\exp(-2T\gamma^{2})<2^{-(n^2+n+1)}$。

现在把同一组 $T$ 对随机掩码一起记为 $R$。对每个合法输入 $(A,b)$，令 $F_{A,b}$ 表示「由 $R$ 给出的多数表决在 $(A,b)$ 上失败」的事件。上面的逐点界对每个 $(A,b)$ 都成立，联合界给出

$$
\Pr_R\Big[\bigcup_{(A,b)\in\Omega_n}F_{A,b}\Big]\le\sum_{(A,b)\in\Omega_n}\Pr_R[F_{A,b}]
\le|\Omega_n|\exp(-2T\gamma^{2})
<2^{n^2+n}\,2^{-(n^2+n+1)}=\frac12<1 .
$$

左侧是「随机抽取一整组 $T$ 对掩码后，这组掩码使至少一个合法输入失败」的概率。它小于 $1$ 意味着补事件「所有合法输入同时正确」具有正概率，故至少存在一组具体的 $T$ 对掩码，使多数表决对全部 $(A,b)\in\Omega_n$ 同时正确。

固定这些掩码后，相应的输入变换均可由常数深度、多项式规模的阈值电路计算。将 $T$ 个 $h_n$ 并行运行并对校正后的输出作多数表决，所得精确算法仍属于 TC0。这与命题 3.4 及假设矛盾。

最后，标签严格平衡保证常数预测器的准确率为 $1/2$，从而每个规模上的最优准确率都至少为 $1/2$；反证又表明对每个 $\gamma>0$ 都有无限多个规模使最优准确率不超过 $1/2+\gamma$。两者合起来，该下极限恰为 $1/2$。

## 隐藏读出的表格 ICL 任务

### 任务构造

**构造 4.1（隐藏读出任务）。** 每个 episode 采样

$$
\theta\sim\mathrm{Unif}(\mathbb{F}_2^{n}),
$$

其中 $\theta$ 不作为输入列出现。每行独立采样 $A\sim\mathrm{Unif}(\mathrm{GL}(n,2))$、$b\sim\mathrm{Unif}(\mathbb{F}_2^{n})$，并赋予标签

$$
y=f_\theta(A,b):=\theta^{\top}A^{-1}b .
$$

上下文包含 $m=2n$ 条已标注行，查询行按同一分布独立采样且标签被遮蔽。每行有 $d=n^2+n$ 个二进制特征，不含 $\theta$、$A^{-1}b$ 或任何中间结果。给定 $\theta$ 后，上下文与查询严格独立同分布；共有 $2^{n}$ 个互不相同的目标函数。

### 精确 Bayes 准确率

对第 $i$ 条上下文行定义 $u_i:=A_i^{-1}b_i\in\mathbb{F}_2^{n}$，并把 $u_i^{\top}$ 排成 $m\times n$ 矩阵 $U$。上下文标签满足

$$
U\theta=y_D .
$$

**定理 4.2（隐藏读出任务的 Bayes 准确率）。** 在构造 4.1 中，

$$
\mathrm{Acc}^{\text{Bayes}}_{n,m}=\frac12+\frac12\,\mathbb{E}_U\big[2^{\operatorname{rank}(U)-n}\big],
$$

且

$$
\Pr[\operatorname{rank}(U)<n]\le(2^{n}-1)2^{-m}<2^{n-m},
\qquad
1-\mathrm{Acc}^{\text{Bayes}}_{n,m}<2^{n-m-1}.
$$

特别地，$m=2n$ 时 Bayes 风险小于 $2^{-n-1}$。

**证明。** 对第 $i$ 条上下文行，条件于任意固定的可逆矩阵 $A_i$，映射 $b_i\mapsto A_i^{-1}b_i$ 是 $\mathbb{F}_2^{n}$ 上的双射。因此当 $b_i$ 在 $\mathbb{F}_2^{n}$ 上均匀分布时，$u_i$ 也在 $\mathbb{F}_2^{n}$ 上均匀分布。又因为各对 $(A_i,b_i)$ 独立采样，所以 $u_1,\dots,u_m$ 相互独立且均匀分布。

将 $u_i^{\top}$ 作为第 $i$ 行排列成矩阵 $U\in\mathbb{F}_2^{m\times n}$，并将上下文标签排列成列向量 $y_D\in\mathbb{F}_2^{m}$。由于每个标签满足 $y_i=u_i^{\top}\theta$，整个上下文可以等价地写成 $U\theta=y_D$。

定义候选集合

$$
S(U,y_D):=\{\vartheta\in\mathbb{F}_2^{n}:U\vartheta=y_D\},
$$

真实的 $\theta$ 一定属于该集合，因此集合非空。由于 $\theta$ 的先验在 $\mathbb{F}_2^{n}$ 上均匀，且标签由 $y_D=U\theta$ 无噪声地确定，所以条件于 $U$ 和 $y_D$ 后，所有属于 $S(U,y_D)$ 的候选具有相同的后验概率。

接下来考虑查询行。定义 $u^{*}:=(A^{*})^{-1}b^{*}\in\mathbb{F}_2^{n}$，查询标签为 $y^{*}:=(u^{*})^{\top}\theta$。与上下文中相同，$u^{*}$ 在 $\mathbb{F}_2^{n}$ 上均匀分布，并且独立于上下文矩阵 $U$。

固定 $U$ 和 $y_D$，令 $r:=\operatorname{rank}(U)$。分两种情况。

第一种情况是 $(u^{*})^{\top}$ 属于 $U$ 的行空间 $\operatorname{row}(U)$。这意味着存在系数向量 $\lambda\in\mathbb{F}_2^{m}$ 使 $(u^{*})^{\top}=\lambda^{\top}U$。于是对任意相容候选 $\vartheta\in S(U,y_D)$，

$$
(u^{*})^{\top}\vartheta=\lambda^{\top}U\vartheta=\lambda^{\top}y_D ,
$$

右端只由已观察到的上下文标签决定，不依赖具体选择哪个候选。所有相容候选都会给出相同的查询标签，此时 Bayes 预测可以完全确定 $y^{*}$，条件准确率为 $1$。

第二种情况是 $(u^{*})^{\top}$ 不属于 $\operatorname{row}(U)$。由正交关系 $\operatorname{row}(U)=\ker(U)^{\perp}$ 可知，此时存在向量 $v\in\mathbb{F}_2^{n}$ 使

$$
Uv=0,\qquad (u^{*})^{\top}v=1 .
$$

对任意 $\vartheta\in S(U,y_D)$，向量 $\vartheta\oplus v$ 仍然与上下文相容，因为 $U(\vartheta\oplus v)=y_D$；但这两个候选给出的查询标签恰好相反：

$$
(u^{*})^{\top}(\vartheta\oplus v)=(u^{*})^{\top}\vartheta\oplus 1 .
$$

因此映射 $\vartheta\mapsto\vartheta\oplus v$ 把 $S(U,y_D)$ 中的候选两两配对，每一对分别给出标签 $0$ 和 $1$。由于后验在 $S(U,y_D)$ 上均匀，两个查询标签的后验概率严格相等，条件准确率为 $1/2$。

因为 $\operatorname{row}(U)$ 的维数为 $r$，它包含 $2^{r}$ 个向量，而整个 $\mathbb{F}_2^{n}$ 包含 $2^{n}$ 个向量；又因为 $u^{*}$ 均匀分布，

$$
\Pr[(u^{*})^{\top}\in\operatorname{row}(U)\mid U]=\frac{2^{r}}{2^{n}}=2^{r-n}.
$$

于是在固定 $U$ 后，

$$
\mathrm{Acc}^{\text{Bayes}}(U)=2^{r-n}\cdot 1+\big(1-2^{r-n}\big)\cdot\frac12=\frac12+\frac12\,2^{r-n}.
$$

对随机上下文矩阵 $U$ 取期望，即得第一条公式。

下面估计 $U$ 不满秩的概率。事件 $\operatorname{rank}(U)<n$ 等价于：存在非零向量 $v\in\mathbb{F}_2^{n}$ 使 $Uv=0$。对任意固定的非零 $v$，由于 $u_i$ 均匀，内积 $u_i^{\top}v$ 取 $0$ 和 $1$ 的概率各为 $1/2$；又因为各行相互独立，

$$
\Pr[Uv=0]=\prod_{i=1}^{m}\Pr[u_i^{\top}v=0]=2^{-m}.
$$

$\mathbb{F}_2^{n}$ 中共有 $2^{n}-1$ 个非零向量，对所有非零 $v$ 使用联合界：

$$
\Pr[\operatorname{rank}(U)<n]\le\sum_{v\neq 0}\Pr[Uv=0]=(2^{n}-1)2^{-m}<2^{n-m}.
$$

当 $\operatorname{rank}(U)=n$ 时，$U$ 的行空间等于整个 $\mathbb{F}_2^{n}$，每个查询标签都能被完全确定，Bayes 风险为 $0$；当 $\operatorname{rank}(U)<n$ 时，Bayes 风险至多为 $1/2$。因此

$$
1-\mathrm{Acc}^{\text{Bayes}}_{n,m}\le\frac12\Pr[\operatorname{rank}(U)<n]<2^{n-m-1}.
$$

特别地，当 $m=2n$ 时 $1-\mathrm{Acc}^{\text{Bayes}}_{n,2n}<2^{-n-1}$：只使用 $2n$ 条上下文行，Bayes 准确率就已经随 $n$ 的增大迅速趋近于 $1$。

### 单次前向预测器的平均情形下界

**定理 4.3（表格任务的单次前向下界）。** 在假设 $\mathrm{TC}^0\neq\mathrm{NC}^1$ 下，对任意预先固定的 $L,k$ 和任意 $\gamma>0$，存在无限多个 $n$ 使

$$
\sup_{M\in\mathcal{M}_n(L,k)} \mathrm{Acc}_{n,2n}(M)\le\frac12+\gamma ,
$$

其中准确率对 $\theta$、上下文和查询的联合分布取平均。

**证明思路。** 反设存在固定 $L,k,\gamma>0$，使所有充分大的 $n$ 都有预测器 $M_n$ 的平均准确率超过 $1/2+\gamma$。事件 $\theta=0$ 的概率为 $2^{-n}$，且其条件准确率至多为 $1$；因此对充分大的 $n$，条件于 $\theta\neq 0$ 的平均准确率仍超过 $1/2+\gamma/2$。再对非零 $\theta$ 与上下文 $D$ 取平均，存在固定的 $\theta_0\neq 0$ 和合法上下文 $D_0$，使 $M_n(D_0,\cdot)$ 在随机查询上的准确率超过 $1/2+\gamma/2$。

把非零行向量 $\theta_0^{\top}$ 扩充为 $\mathbb{F}_2^{n}$ 的一组基，并以这些基向量为行组成 $S\in\mathrm{GL}(n,2)$。于是 $S$ 的第一行是 $\theta_0^{\top}$，即 $\theta_0^{\top}S^{-1}=e_1^{\top}$。对该任务的输入 $(A,b)$ 定义

$$
h_n(A,b):=M_n\big(D_0,(AS,b)\big).
$$

由于右乘固定 $S$ 是 $\mathrm{GL}(n,2)$ 上的双射，$(AS,b)$ 仍服从表格查询分布，并且

$$
f_{\theta_0}(AS,b)=\theta_0^{\top}(AS)^{-1}b=\theta_0^{\top}S^{-1}A^{-1}b=e_1^{\top}A^{-1}b=g_n(A,b).
$$

因此 $h_n$ 在定义 3.1 的均匀分布上取得超过 $1/2+\gamma/2$ 的准确率。固定 $D_0,\theta_0,S$ 只使用多项式长度的建议串；右乘固定矩阵也在 TC0 内，所以 $h_n$ 仍是固定深度多项式规模电路，与定理 3.5（取优势 $\gamma/2$）矛盾。

### Bayes 风险严格为零的最小变体

如果希望把「信息不足」完全排除，而不仅是让 Bayes 风险趋零，可以使用一比特标签偏移。

**推论 4.4（零 Bayes 风险变体）。** 每个 episode 采样 $\tau\sim\mathrm{Unif}\{0,1\}$，并令

$$
y=g_n(A,b)\oplus\tau .
$$

任意一条无噪声上下文行都唯一确定 $\tau=y_1\oplus g_n(A_1,b_1)$，故 Bayes 风险严格为零。在 $\mathrm{TC}^0\neq\mathrm{NC}^1$ 的假设下，对任意固定 $L,k,\gamma>0$，仍有无限多个 $n$ 使最优单次前向预测器的准确率至多 $1/2+\gamma$。

**证明。** Bayes 结论由标签定义直接得到。若某单次前向预测器持续取得超过 $1/2+\gamma$ 的平均准确率，对 $(\tau,D)$ 取平均可固定一组 $(\tau_0,D_0)$，再把预测输出异或 $\tau_0$，即可得到在该任务上具有相同优势的固定深度电路，与定理 3.5 矛盾。

## 参考文献

1. D. A. Barrington. Bounded-width polynomial-size branching programs recognize exactly those languages in NC1. *Journal of Computer and System Sciences*, 38(1):150–164, 1989.
2. G. Feng, B. Zhang, Y. Gu, H. Ye, D. He, and L. Wang. Towards revealing the mystery behind chain of thought: A theoretical perspective. In *NeurIPS*, 2023. [arXiv:2305.15408](https://arxiv.org/abs/2305.15408).
3. N. Hollmann, S. Müller, L. Purucker, A. Krishnakumar, M. Körfer, S. B. Hoo, R. T. Schirrmeister, and F. Hutter. Accurate predictions on small data with a tabular foundation model. *Nature*, 637:319–326, 2025.
4. LimiX Team (Stable AI and Tsinghua University). LimiX: Unleashing structured-data modeling capability for generalist intelligence. Technical report, 2025.
5. W. Merrill and A. Sabharwal. The parallelism tradeoff: Limitations of log-precision transformers. *Transactions of the Association for Computational Linguistics*, 11:531–545, 2023. [arXiv:2207.00729](https://arxiv.org/abs/2207.00729).
6. W. Merrill and A. Sabharwal. The expressive power of transformers with chain of thought. In *ICLR*, 2024. [arXiv:2310.07923](https://arxiv.org/abs/2310.07923).
7. A. Moitra, E. Mossel, and C. Sandon. Parallels between phase transitions and circuit complexity? [arXiv:1904.05483](https://arxiv.org/abs/1904.05483), 2019.
8. S. Müller, N. Hollmann, S. Pineda Arango, J. Grabocka, and F. Hutter. Transformers can do Bayesian inference. In *ICLR*, 2022. [arXiv:2112.10510](https://arxiv.org/abs/2112.10510).