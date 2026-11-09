---
title: "Computational Limits of Fixed-Depth Tabular Foundation Models"
subtitle: "A conditional average-case separation"
date: 2026-11-09
topics: ["learning-theory", "mathematics"]
summary: "When the context already carries enough information, can a fixed-depth single-pass tabular predictor still fail for lack of computation? A family of noiseless tabular tasks gives an average-case separation under TC0 ≠ NC1."
lang: en
permalink: /notes/average-case-separation/
alt_url: /zh/notes/average-case-separation/
math: true
---

Prior-data fitted networks (PFNs) and their tabular instantiations TabPFN and LimiX read labelled context rows and an unlabelled query row in a single forward pass. This raises a distinction: does a model fail because **the context does not identify the task**, or because **the information is there but a fixed-depth computation cannot process it**?

The task constructed here separates the two. Fix a scale parameter $n$; each episode first samples a hidden parameter $\theta$, then samples $m$ context rows and one query row i.i.d. from the same row distribution. The context contains neither the query answer nor any intermediate computation, and at $m=2n$ the Bayes accuracy tends to $1$. At the same time, every label contains an NC1-hard linear computation.

The conclusion can be summarised as

$$
\mathrm{Acc}^{\text{Bayes}}_{n}\longrightarrow 1
\qquad\text{but}\qquad
\liminf_{n\to\infty}\ \sup_{M\in\mathcal{M}_n(L,k)} \mathrm{Acc}_n(M)=\frac12 .
$$

The left side says the information is sufficient; the right side says fixed-depth single-pass computation is not.

## Formal framework

### Tabular ICL, average accuracy and Bayes risk

Fix a task prior $\Pi_n$. Each episode samples a hidden parameter $\theta\sim\Pi_n$, then samples i.i.d. rows conditional on $\theta$:

$$
X_1,\dots,X_m,X^{*}\ \overset{\text{i.i.d.}}{\sim}\ P_n .
$$

The context and query are

$$
D=\{(X_1,f_\theta(X_1)),\dots,(X_m,f_\theta(X_m))\},\qquad X^{*}.
$$

A predictor observes $(D,X^{*})$ and outputs a prediction of $f_\theta(X^{*})$. We consider only this fixed, public episode distribution. The average accuracy and risk of a predictor $M$ are

$$
\mathrm{Acc}_{n,m}(M):=\Pr_{\theta,D,X^{*}}\!\big[M(D,X^{*})=f_\theta(X^{*})\big],
\qquad
R_{n,m}(M):=1-\mathrm{Acc}_{n,m}(M).
$$

Bayes accuracy is the best average accuracy attainable from the current context and query when computation is unrestricted and the task prior and data-generating law are known. It measures whether **the predictive information is sufficient**, not whether computation is affordable.

### Complexity classes and the conditional premise

Let $N$ be the binary input length. TC0 is the class computed by constant-depth, polynomial-size, unbounded-fan-in threshold circuits; NC1 is computed by $O(\log N)$-depth, polynomial-size, bounded-fan-in circuits. We use the usual non-uniform versions and the following unproven assumption:

> **Assumption.** $\mathrm{TC}^0\neq\mathrm{NC}^1$.

Barrington's theorem shows that the word problem of a fixed non-solvable finite group (for instance $A_5$) is NC1-complete; Section 3 reduces that problem to the linear task below.

Non-uniform models allow the $n$-th circuit to hard-code constants that depend only on $n$ and have polynomial length. That suffices to fix the random masks guaranteed by a probabilistic method, and the contexts selected by an averaging argument. It does not allow the resource exponents to change after seeing $n$: the depth bound $L$ and the size exponent $k$ are fixed in advance, so one circuit family satisfies $\operatorname{depth}(C_n)\le L$ and $\operatorname{size}(C_n)\le N^{k}+k$.

### The single-pass predictor class

Let $N_n$ be the binary input length of the whole episode and define

$$
\mathcal{M}_n(L,k):=\Big\{M:\ \text{the full inference of } M \text{ is simulated by a threshold circuit of depth}\le L \text{ and size}\le N_n^{k}+k\Big\}.
$$

## A one-coordinate linear task over a finite field

### Task definition and label balance

**Definition 3.1 (one-coordinate linear task).** Let

$$
\Omega_n:=\mathrm{GL}(n,2)\times\mathbb{F}_2^{n},
\qquad
g_n(A,b):=e_1^{\top}A^{-1}b\in\{0,1\},
$$

where $e_1$ is the first standard basis vector. The input distribution is

$$
A\sim\mathrm{Unif}(\mathrm{GL}(n,2)),\qquad b\sim\mathrm{Unif}(\mathbb{F}_2^{n}),
$$

with $A,b$ independent. The input consists of all $n^2+n$ binary features of $A,b$; it contains no operators, solution vector or intermediate result.

For every fixed $A$ the map $b\mapsto A^{-1}b$ is a bijection of $\mathbb{F}_2^{n}$, so $A^{-1}b$ is uniform and $g_n(A,b)$ is exactly uniform. A constant predictor therefore has accuracy exactly $1/2$.

Note that different table rows are i.i.d.; because $A$ is restricted to invertible matrices, the matrix entries within one row are not independent.

### An exact random self-reduction

The idea is to compute $g_n(A,b)$ by evaluating the same function on a random new instance $(A',b')$ and XOR-ing back.

**Lemma 3.2 (matrix self-reduction).** Fix any $(A,b)\in\Omega_n$ and sample independently

$$
R\sim\mathrm{Unif}(\mathrm{GL}(n,2)),\qquad t\sim\mathrm{Unif}(\mathbb{F}_2^{n}),
$$

and set $A':=RA$, $b':=R(b+At)$. Then:

1. $(A')^{-1}b'=A^{-1}b+t$, hence $g_n(A',b')=g_n(A,b)\oplus t_1$;
2. for each fixed $(A,b)$ the map $(R,t)\mapsto(A',b')$ is a bijection of $\mathrm{GL}(n,2)\times\mathbb{F}_2^{n}$, so $(A',b')$ is exactly distributed as in Definition 3.1;
3. the inverse map is $R=A'A^{-1}$ and $t=A^{-1}(R^{-1}b'+b)$, but the forward transform never needs $A^{-1}$.

**Proof.** Direct computation gives

$$
(A')^{-1}b'=(RA)^{-1}R(b+At)=A^{-1}b+t,
$$

which is (1). Given $(A,b)$ and $(A',b')$, the inverse formulas determine $(R,t)$ uniquely, so the map is a bijection, giving (2) and (3).

**Lemma 3.3 (average advantage becomes pointwise random advantage).** Let a deterministic predictor $h$ have accuracy $q$ on the uniform distribution of Definition 3.1, and define

$$
\tilde h(A,b;R,t):=h\big(RA,\,R(b+At)\big)\oplus t_1 .
$$

Then for every $(A,b)\in\Omega_n$,

$$
\Pr_{R,t}\big[\tilde h(A,b;R,t)=g_n(A,b)\big]=q .
$$

**Proof.** By Lemma 3.2(1), the event $\tilde h(A,b;R,t)=g_n(A,b)$ is equivalent to $h(A',b')=g_n(A',b')$ (XOR-ing $t_1$ on both sides); by Lemma 3.2(2), $(A',b')$ is exactly uniform for every fixed original input.

### NC1-hardness

**Proposition 3.4 (one coordinate is already hard).** If the family $\{g_n\}$ is exactly computable by TC0 circuits, then the $A_5$ word problem is in TC0 as well. Hence, by Barrington's theorem, $\{g_n\}$ is hard for NC1.

**Proof idea.** Represent the input group elements as five-dimensional permutation matrices $P_1,\dots,P_\ell$. For each $j\in\{1,\dots,5\}$ introduce five-dimensional variable blocks $u_0,\dots,u_\ell$ and set

$$
u_0=e_j,\qquad u_i=P_{\ell+1-i}\,u_{i-1}\quad(i=1,\dots,\ell).
$$

These equations form a block lower bidiagonal system of dimension $n=5(\ell+1)$ whose diagonal blocks are all $I_5$, hence invertible for every input; its solution satisfies

$$
u_\ell=P_1P_2\cdots P_\ell\,e_j .
$$

A fixed column permutation moves any coordinate of $u_\ell$ to the first coordinate of the solution vector. Constant $25$ queries to $g_n$ for $i,j\in\{1,\dots,5\}$ recover the product matrix, which is then tested for being the identity. Building the system from the group-element encoding, permuting columns and the final comparison are all in AC0.

### A near-random-guessing bound on the uniform distribution

**Theorem 3.5 (average-case lower bound for the one-coordinate linear task).** Under $\mathrm{TC}^0\neq\mathrm{NC}^1$, for any fixed $L,k$ and any $\gamma>0$ there are infinitely many $n$ with

$$
\sup_{h\in C_n(L,k)}\ \Pr_{(A,b)\sim\mathrm{Unif}(\Omega_n)}\big[h(A,b)=g_n(A,b)\big]\le\frac12+\gamma .
$$

Equivalently,

$$
\liminf_{n\to\infty}\ \sup_{h\in C_n(L,k)} \mathrm{Acc}_n(h)=\frac12 .
$$

**Proof idea.** Suppose there are fixed $L,k,\gamma>0$ such that for all large $n$ some circuit $h_n$ attains average accuracy $q_n>1/2+\gamma$.

Fix any legal input $(A,b)\in\Omega_n$; its true label $g_n(A,b)$ stays unchanged in the random process below. For each $r=1,\dots,T$, sample independently $R^{(r)}\sim\mathrm{Unif}(\mathrm{GL}(n,2))$ and $t^{(r)}\sim\mathrm{Unif}(\mathbb{F}_2^{n})$, and run the random transform of Lemma 3.3. Let

$$
Z_r:=\mathbf{1}\Big\{h_n\big(R^{(r)}A,\ R^{(r)}(b+At^{(r)})\big)\oplus t^{(r)}_1=g_n(A,b)\Big\}\in\{0,1\},
$$

where $Z_r=1$ means the $r$-th answer is correct after the $t^{(r)}_1$ correction. By Lemma 3.3 these variables are independent and $\Pr[Z_r=1]=q_n>1/2+\gamma$ for every $r$.

Write $\bar Z:=T^{-1}\sum_{r=1}^{T}Z_r$. For odd $T$, majority vote can fail only if $\bar Z\le 1/2$. The lower tail of Hoeffding's inequality gives

$$
\Pr\big[\bar Z-\mathbb{E}[\bar Z]\le-\varepsilon\big]\le\exp(-2T\varepsilon^{2}).
$$

Here $\mathbb{E}[\bar Z]=q_n>1/2+\gamma$; if $\bar Z\le 1/2$ then $\bar Z-q_n<-\gamma$. With $\varepsilon=\gamma$ the pointwise failure probability for this fixed input is

$$
\Pr[\text{majority fails}]\le\Pr\Big[\bar Z\le\frac12\Big]\le\Pr\big[\bar Z-q_n\le-\gamma\big]\le\exp(-2T\gamma^{2}).
$$

The number of legal inputs satisfies

$$
|\Omega_n|=|\mathrm{GL}(n,2)|\,2^{n}<2^{n^2+n},
$$

using only $|\mathrm{GL}(n,2)|<2^{n^2}$, i.e. that it is a subset of all $n\times n$ binary matrices. Take odd

$$
T>\frac{(n^2+n+1)\log 2}{2\gamma^{2}},
$$

so that $\exp(-2T\gamma^{2})<2^{-(n^2+n+1)}$.

Now regard the same $T$ pairs of masks as one random object $R$. For each legal input $(A,b)$ let $F_{A,b}$ be the event that the majority vote induced by $R$ fails on $(A,b)$. The pointwise bound holds for every $(A,b)$, and the union bound gives

$$
\Pr_R\Big[\bigcup_{(A,b)\in\Omega_n}F_{A,b}\Big]\le\sum_{(A,b)\in\Omega_n}\Pr_R[F_{A,b}]
\le|\Omega_n|\exp(-2T\gamma^{2})
<2^{n^2+n}\,2^{-(n^2+n+1)}=\frac12<1 .
$$

The left side is the probability that a random set of $T$ mask pairs makes at least one legal input fail. Being less than $1$, its complement has positive probability: some concrete set of $T$ mask pairs makes the majority vote correct on all $(A,b)\in\Omega_n$ simultaneously.

With those masks fixed, the input transforms are computable by constant-depth, polynomial-size threshold circuits. Running the $T$ copies of $h_n$ in parallel and taking a majority over the corrected outputs is an exact algorithm still in TC0, contradicting Proposition 3.4 and the assumption.

Finally, exact label balance makes the constant predictor's accuracy $1/2$, so the optimal accuracy at every scale is at least $1/2$; the contradiction shows that for every $\gamma>0$ there are infinitely many scales where it is at most $1/2+\gamma$. Together the liminf is exactly $1/2$.

## The hidden-readout tabular ICL task

### Construction

**Construction 4.1 (hidden readout).** Each episode samples

$$
\theta\sim\mathrm{Unif}(\mathbb{F}_2^{n}),
$$

where $\theta$ does not appear as an input column. Each row samples independently $A\sim\mathrm{Unif}(\mathrm{GL}(n,2))$ and $b\sim\mathrm{Unif}(\mathbb{F}_2^{n})$, and receives the label

$$
y=f_\theta(A,b):=\theta^{\top}A^{-1}b .
$$

The context contains $m=2n$ labelled rows; the query row is sampled independently from the same distribution and has its label masked. Each row has $d=n^2+n$ binary features and contains neither $\theta$, nor $A^{-1}b$, nor any intermediate result. Given $\theta$, context and query are exactly i.i.d.; there are $2^{n}$ distinct target functions.

### Exact Bayes accuracy

For the $i$-th context row define $u_i:=A_i^{-1}b_i\in\mathbb{F}_2^{n}$ and stack $u_i^{\top}$ into an $m\times n$ matrix $U$. The context labels satisfy

$$
U\theta=y_D .
$$

**Theorem 4.2 (Bayes accuracy of the hidden-readout task).** In Construction 4.1,

$$
\mathrm{Acc}^{\text{Bayes}}_{n,m}=\frac12+\frac12\,\mathbb{E}_U\big[2^{\operatorname{rank}(U)-n}\big],
$$

and

$$
\Pr[\operatorname{rank}(U)<n]\le(2^{n}-1)2^{-m}<2^{n-m},
\qquad
1-\mathrm{Acc}^{\text{Bayes}}_{n,m}<2^{n-m-1}.
$$

In particular, for $m=2n$ the Bayes risk is below $2^{-n-1}$.

**Proof.** For the $i$-th context row, conditional on any fixed invertible $A_i$ the map $b_i\mapsto A_i^{-1}b_i$ is a bijection of $\mathbb{F}_2^{n}$. So when $b_i$ is uniform on $\mathbb{F}_2^{n}$, $u_i$ is uniform too. Since the pairs $(A_i,b_i)$ are sampled independently, $u_1,\dots,u_m$ are independent and uniform.

Stack $u_i^{\top}$ as the $i$-th row of $U\in\mathbb{F}_2^{m\times n}$ and stack the context labels into $y_D\in\mathbb{F}_2^{m}$. Since every label satisfies $y_i=u_i^{\top}\theta$, the whole context can be written as $U\theta=y_D$.

Define the candidate set

$$
S(U,y_D):=\{\vartheta\in\mathbb{F}_2^{n}:U\vartheta=y_D\}.
$$

The true $\theta$ lies in it, so the set is non-empty. Because the prior on $\theta$ is uniform on $\mathbb{F}_2^{n}$ and the labels are determined noiselessly by $y_D=U\theta$, all candidates in $S(U,y_D)$ have the same posterior probability conditional on $U$ and $y_D$.

Turn to the query row. Define $u^{*}:=(A^{*})^{-1}b^{*}\in\mathbb{F}_2^{n}$, so the query label is $y^{*}:=(u^{*})^{\top}\theta$. As in the context, $u^{*}$ is uniform on $\mathbb{F}_2^{n}$ and independent of $U$.

Fix $U$ and $y_D$, and let $r:=\operatorname{rank}(U)$. There are two cases.

In the first case $(u^{*})^{\top}$ lies in the row space $\operatorname{row}(U)$. Then there is $\lambda\in\mathbb{F}_2^{m}$ with $(u^{*})^{\top}=\lambda^{\top}U$, so for every consistent candidate $\vartheta\in S(U,y_D)$,

$$
(u^{*})^{\top}\vartheta=\lambda^{\top}U\vartheta=\lambda^{\top}y_D ,
$$

whose right side depends only on the observed context labels and not on the candidate. All consistent candidates give the same query label, so the Bayes prediction determines $y^{*}$ exactly and the conditional accuracy is $1$.

In the second case $(u^{*})^{\top}\notin\operatorname{row}(U)$. Using $\operatorname{row}(U)=\ker(U)^{\perp}$ there is $v\in\mathbb{F}_2^{n}$ with

$$
Uv=0,\qquad (u^{*})^{\top}v=1 .
$$

For any $\vartheta\in S(U,y_D)$ the vector $\vartheta\oplus v$ is still consistent, since $U(\vartheta\oplus v)=y_D$; but the two candidates give opposite query labels:

$$
(u^{*})^{\top}(\vartheta\oplus v)=(u^{*})^{\top}\vartheta\oplus 1 .
$$

Thus $\vartheta\mapsto\vartheta\oplus v$ pairs up the candidates in $S(U,y_D)$, each pair giving labels $0$ and $1$. Because the posterior is uniform on $S(U,y_D)$, the two query labels have exactly equal posterior probability and the conditional accuracy is $1/2$.

Since $\operatorname{row}(U)$ has dimension $r$ it contains $2^{r}$ vectors, while $\mathbb{F}_2^{n}$ contains $2^{n}$; as $u^{*}$ is uniform,

$$
\Pr[(u^{*})^{\top}\in\operatorname{row}(U)\mid U]=\frac{2^{r}}{2^{n}}=2^{r-n}.
$$

Hence, for fixed $U$,

$$
\mathrm{Acc}^{\text{Bayes}}(U)=2^{r-n}\cdot 1+\big(1-2^{r-n}\big)\cdot\frac12=\frac12+\frac12\,2^{r-n}.
$$

Taking expectation over the random context matrix $U$ gives the first formula.

It remains to bound the probability that $U$ is rank deficient. The event $\operatorname{rank}(U)<n$ is equivalent to the existence of a non-zero $v\in\mathbb{F}_2^{n}$ with $Uv=0$. For any fixed non-zero $v$, uniformity of $u_i$ makes $u_i^{\top}v$ equally likely to be $0$ or $1$; independence across rows gives

$$
\Pr[Uv=0]=\prod_{i=1}^{m}\Pr[u_i^{\top}v=0]=2^{-m}.
$$

There are $2^{n}-1$ non-zero vectors in $\mathbb{F}_2^{n}$, so a union bound yields

$$
\Pr[\operatorname{rank}(U)<n]\le\sum_{v\neq 0}\Pr[Uv=0]=(2^{n}-1)2^{-m}<2^{n-m}.
$$

When $\operatorname{rank}(U)=n$, the row space of $U$ is all of $\mathbb{F}_2^{n}$ and every query label is determined exactly, so the Bayes risk is $0$; when $\operatorname{rank}(U)<n$ the Bayes risk is at most $1/2$. Therefore

$$
1-\mathrm{Acc}^{\text{Bayes}}_{n,m}\le\frac12\Pr[\operatorname{rank}(U)<n]<2^{n-m-1}.
$$

In particular, for $m=2n$ we get $1-\mathrm{Acc}^{\text{Bayes}}_{n,2n}<2^{-n-1}$: with only $2n$ context rows the Bayes accuracy already approaches $1$ rapidly as $n$ grows.

### An average-case lower bound for single-pass predictors

**Theorem 4.3 (single-pass lower bound for the tabular task).** Under $\mathrm{TC}^0\neq\mathrm{NC}^1$, for any fixed $L,k$ and any $\gamma>0$ there are infinitely many $n$ with

$$
\sup_{M\in\mathcal{M}_n(L,k)} \mathrm{Acc}_{n,2n}(M)\le\frac12+\gamma ,
$$

where accuracy averages over the joint distribution of $\theta$, context and query.

**Proof idea.** Suppose there are fixed $L,k,\gamma>0$ such that for all large $n$ a predictor $M_n$ has average accuracy above $1/2+\gamma$. The event $\theta=0$ has probability $2^{-n}$ and conditional accuracy at most $1$, so for large $n$ the accuracy conditional on $\theta\neq 0$ still exceeds $1/2+\gamma/2$. Averaging over non-zero $\theta$ and contexts $D$, there are a fixed $\theta_0\neq 0$ and a legal context $D_0$ such that $M_n(D_0,\cdot)$ has accuracy above $1/2+\gamma/2$ on a random query.

Extend the non-zero row vector $\theta_0^{\top}$ to a basis of $\mathbb{F}_2^{n}$ and take those basis vectors as the rows of $S\in\mathrm{GL}(n,2)$. The first row of $S$ is $\theta_0^{\top}$, so $\theta_0^{\top}S^{-1}=e_1^{\top}$. For an input of this task $(A,b)$ define

$$
h_n(A,b):=M_n\big(D_0,(AS,b)\big).
$$

Since right multiplication by a fixed $S$ is a bijection of $\mathrm{GL}(n,2)$, $(AS,b)$ still follows the tabular query distribution, and

$$
f_{\theta_0}(AS,b)=\theta_0^{\top}(AS)^{-1}b=\theta_0^{\top}S^{-1}A^{-1}b=e_1^{\top}A^{-1}b=g_n(A,b).
$$

So $h_n$ attains accuracy above $1/2+\gamma/2$ on the uniform distribution of Definition 3.1. Fixing $D_0,\theta_0,S$ uses only a polynomial-length advice string, and right multiplication by a fixed matrix is in TC0, so $h_n$ is still a fixed-depth polynomial-size circuit, contradicting Theorem 3.5 (with advantage $\gamma/2$).

### A minimal variant with strictly zero Bayes risk

To exclude insufficient information entirely, rather than merely driving Bayes risk to zero, use a one-bit label shift.

**Corollary 4.4 (zero-Bayes-risk variant).** Each episode samples $\tau\sim\mathrm{Unif}\{0,1\}$ and sets

$$
y=g_n(A,b)\oplus\tau .
$$

Any single noiseless context row determines $\tau=y_1\oplus g_n(A_1,b_1)$ uniquely, so the Bayes risk is strictly zero. Under $\mathrm{TC}^0\neq\mathrm{NC}^1$, for any fixed $L,k,\gamma>0$ there are still infinitely many $n$ where the best single-pass predictor has accuracy at most $1/2+\gamma$.

**Proof.** The Bayes claim follows directly from the label definition. If some single-pass predictor sustained average accuracy above $1/2+\gamma$, averaging over $(\tau,D)$ would fix a pair $(\tau_0,D_0)$; XOR-ing the prediction with $\tau_0$ then gives a fixed-depth circuit with the same advantage on this task, contradicting Theorem 3.5.

## References

1. D. A. Barrington. Bounded-width polynomial-size branching programs recognize exactly those languages in NC1. *Journal of Computer and System Sciences*, 38(1):150–164, 1989.
2. G. Feng, B. Zhang, Y. Gu, H. Ye, D. He, and L. Wang. Towards revealing the mystery behind chain of thought: A theoretical perspective. In *NeurIPS*, 2023. [arXiv:2305.15408](https://arxiv.org/abs/2305.15408).
3. N. Hollmann, S. Müller, L. Purucker, A. Krishnakumar, M. Körfer, S. B. Hoo, R. T. Schirrmeister, and F. Hutter. Accurate predictions on small data with a tabular foundation model. *Nature*, 637:319–326, 2025.
4. LimiX Team (Stable AI and Tsinghua University). LimiX: Unleashing structured-data modeling capability for generalist intelligence. Technical report, 2025.
5. W. Merrill and A. Sabharwal. The parallelism tradeoff: Limitations of log-precision transformers. *Transactions of the Association for Computational Linguistics*, 11:531–545, 2023. [arXiv:2207.00729](https://arxiv.org/abs/2207.00729).
6. W. Merrill and A. Sabharwal. The expressive power of transformers with chain of thought. In *ICLR*, 2024. [arXiv:2310.07923](https://arxiv.org/abs/2310.07923).
7. A. Moitra, E. Mossel, and C. Sandon. Parallels between phase transitions and circuit complexity? [arXiv:1904.05483](https://arxiv.org/abs/1904.05483), 2019.
8. S. Müller, N. Hollmann, S. Pineda Arango, J. Grabocka, and F. Hutter. Transformers can do Bayesian inference. In *ICLR*, 2022. [arXiv:2112.10510](https://arxiv.org/abs/2112.10510).