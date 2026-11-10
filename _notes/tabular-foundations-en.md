---
title: "Tabular Foundation Models: Consistency, a Map, and Expressivity"
subtitle: "Three sets of notes: is the model self-consistent, what does the field look like, what can it actually compute"
date: 2026-11-10
topics: ["foundation-models", "learning-theory", "machine-learning"]
summary: "Tabular foundation models claim to output posterior predictive distributions. This note replaces 'how far from the true posterior' with a testable joint-consistency question, measured by total variation, and adds a map of the field plus three expressivity bounds."
lang: en
permalink: /notes/tabular-foundations/
alt_url: /zh/notes/tabular-foundations/
math: true
---

The state of the art for tabular prediction is now a class of foundation models: TabPFN, TabICL, TabDPT, TabFM. They share one theoretical basis — the prior-data fitted network (PFN): a Transformer pretrained on synthetic datasets drawn from a prior, trained to predict hold-out targets. Müller et al. showed that models trained this way approximate the Bayesian posterior predictive distribution under that prior.

This yields one promise and one gap. The promise: weights are frozen at inference, the labelled dataset serves as context, and a single forward pass returns a univariate density $\hat p(y \mid x; D)$ that is meant to be the posterior predictive. The gap: the theory characterises the prior limit, and how closely a trained model approaches that limit had not been tested empirically.

These notes cover three things: whether a model agrees with itself, a map of the field, and three bounds on expressivity.

## 1. Does the model agree with its own predictions?

### Turning the question into something testable

"How far from the true posterior" cannot be computed: each row has a single observation, the true joint is unknown, the pretraining prior is unavailable, and there is nothing to compare against.

The authors weaken the question to: **could the model's univariate predictions come from some joint distribution?** A well-defined joint constrains its own marginals and conditionals — the law of total probability must hold, and the chain rule must agree across decomposition orders. The crucial point is that these constraints can be checked from the model's own outputs, with no labels and no prior knowledge.

Before talking about a joint, one has to construct it. The prediction head is univariate, but the context interface does not restrict what a column means: append the values of a target column as a feature column and you obtain a conditional prediction given that column. Hence for $d$ targets and any permutation $\pi$, the chain rule gives an autoregressive decomposition

$$
\hat p(y_1,\dots,y_d \mid x; D) = \prod_{j=1}^{d} \hat p\big(y_{\pi(j)} \mid y_{\pi(\lt j)}, x; D\big),
$$

with sampling in ancestral order, so each factor conditions on a different context set. The construction is valid only if the model really does approximate Bayesian inference — which is what the two conditions below test.

### Two conditions

**C1, marginalisation consistency.** For any $x$ and $a \in \mathcal{Y}_A$,

$$
\hat p(a \mid x; D^{A-B}) = \int \hat p(a \mid b, x; D^{A}) \, \hat p(b \mid x; D^{A-B}) \, \mathrm{d}b .
$$

The intuition: $b$ is the model's own estimate, so going through it should not change the model's belief about $a$. This is the law of total probability, the martingale property of a coherent forecasting system. A violation means the marginal estimate contradicts the model's own conditionals — the only difference between the two sides is that the left removes column $B$ and the right keeps it.

**C2, factorisation consistency.** For any $a \in \mathcal{Y}_A$ and $b \in \mathcal{Y}_B$,

$$
\hat p(a \mid b, x; D^{A}) \, \hat p(b \mid x; D^{A-B}) = \hat p(b \mid a, x; D^{B}) \, \hat p(a \mid x; D^{B-A}),
$$

that is, $\hat p(a,b) = \hat p(b,a)$. If the densities come from one joint, the two autoregressive orders must produce the same distribution; a violation means the output depends on the order in which targets are processed. Statistically this is a compatibility condition.

### Two propositions

**Proposition 1: C2 implies C1.** Substituting C2 into the integrand of C1 lets the $b$-free factor $\hat p(a \mid x; D^{A-B})$ leave the integral, and the remaining conditional integrates to one. The practical corollary: by contraposition, violating C1 already proves C2 is violated.

**Proposition 2: C1 does not imply C2.** The appendix gives two binary targets with uniform marginals, where one conditional depends on the other ($3/4$ versus $1/4$) while the other is independent ($1/2$ versus $1/2$). Both reproduce the uniform marginal $(1/2, 1/2)$, so C1 holds; but at $(0,0)$ one side gives $3/4 \cdot 1/2 = 3/8$ and the other $1/2 \cdot 1/2 = 1/4$, so C2 fails. The two orders produce joints with identical marginals and different dependence structure.

### Measurement and results

The metric is total variation distance, $\mathrm{TV}(p,q) = \tfrac12 \sum |p-q|$ (an integral in the continuous case). It is zero for identical distributions, one for disjoint support, and an intermediate value $t$ reads as "there is an event on which the two sides differ by $t$". Being bounded and dimensionless, it puts classification and regression on one scale.

Classification is a closed-form finite sum, so any non-zero TV is a violation by definition. Regression reduces every head to a common interface — the quantile curve — with a large-$K$ midpoint quadrature and a deliberately coarse shared grid; since TV cannot increase under grid coarsening, the coarse grid yields a conservative lower bound. No sampling is involved, so runs are reproducible.

Experiments cover six state-of-the-art TFMs (TabPFNv2/v3, TabICLv1/v2, TabDPTv1.2, TabFM) and 17 OpenML datasets (10 classification, 7 regression), selected so that two columns are dependent given the remaining features.

The result is uniformly negative: every model on every dataset, classification and regression alike, violates C1 — and for classification the computation is closed-form, so this cannot be sampling noise. C2 is violated more strongly overall, matching the strength relation of Proposition 1. The two violations correlate strongly (Pearson $0.89$, Spearman $0.90$), so the cheaper C1 can stand in as a predictor of C2.

One discussion point matters beyond this paper: consistency is a dimension **independent of accuracy**. Comparing each model's accuracy or RMSE with its consistency deviation shows neither a systematic trade-off nor mutual predictability — the top of a performance leaderboard need not be the most self-consistent model.

## 2. A map of the field

**What a table is.** In form it resembles text — both are symbol systems produced by humans. In origin it resembles an image — an image is sampled from a low-dimensional physical space and is an observation of the world, and so is a table. This duality shapes both model design and the downstream difficulties.

**Why TabPFN works.** Massively pretrained on high-quality synthetic data plus in-context learning: generate tasks that contain the relevant phenomena and let the model learn the corresponding strategies. Part of the feasibility comes from the formal resemblance between tables and text.

**Three product lines.** Specialised, transferable and general models coexist. Notably, a general foundation model is not always better than a specialised one: a single model may capture only cross-task average ability and lose expertise on a particular dataset. That suggests an organisational alternative — a model zoo holding several pretrained models, with retrieval, selection, adaptation and composition at task time.

**limiX.** Its core is context-conditional masked modelling, which treats data as a joint distribution over variables and missingness, with identity encoding, asymmetric interactions, and a formulation in which every task becomes "given some cells, predict others". It adds attention-guided retrieval and ensembling: the last-layer attention estimates which features matter for the current test sample and which context samples are most relevant, and only the high-scoring context is used.

**Five downstream directions.** (i) Open-environment tabular learning: build distribution shift into the pretraining task itself, as Drift-Resilient TabPFN does by learning how the data-generating mechanism changes over time. (ii) Task coverage and extension. (iii) Whether foundation models always beat specialised ones. (iv) Efficiency and deployment. (v) Connections between tables and other modalities.

## 3. Three bounds on expressivity

This group asks not what a model learned, but what a single forward pass can compute.

### The upper bound: TC⁰

Merrill and Sabharwal showed that when each position and intermediate result holds $O(\log n)$ bits and local operations run in $O(\log n)$ space, the whole Transformer is exactly simulated by a logspace-uniform $\mathrm{TC}^0$ circuit family. Each local function has only polynomially many possible inputs, so it expands into a shallow circuit, and a fixed number of layers provides only a fixed number of sequential rounds; total depth stays constant.

So a log-precision Transformer in a single pass is not Turing complete. It suits highly parallel computation, but under standard assumptions cannot uniformly and exactly solve problems that need deeper sequential computation. The result is asymptotic and does not directly cover chain-of-thought or multi-step autoregression.

### The gain: chain of thought

Feng and He explain CoT from the expressivity side. For arithmetic expressions and linear equations over finite fields, a fixed-depth, log-precision, polynomial-size Transformer in one pass lies in $\mathrm{TC}^0$, while both tasks are $\mathrm{NC}^1$-hard; under $\mathrm{TC}^0 \neq \mathrm{NC}^1$ it therefore cannot solve them exactly at arbitrary scale.

With CoT the picture changes: for any given task size one can construct a fixed-depth autoregressive Transformer with constant hidden width that solves the task exactly by generating a CoT of growing length — five layers suffice to evaluate arithmetic expressions step by step, four to generate Gaussian elimination. The mechanism is that each intermediate token returns to the context and is read by the next forward pass, so while the depth of each call is fixed, the effective depth of the generation grows with the CoT.

### The lower bound: an unconditional depth requirement

Chen et al. give the first unconditional lower bound for multi-layer decoder-only Transformers, independent of any unproven complexity conjecture. The theorem: when the product of head count $H$, head dimension $d$ and numerical precision $p$ is bounded, an $L$-layer model cannot solve the $L$-step sequential function composition task, where $i_1 = f_1(w_1)$, $i_2 = f_2(w_2, i_1)$, and so on.

The proof reduces the Transformer to an $L$-round autoregressive communication protocol: one attention layer is one round, and the information a token can carry is limited by $Hdp$. If a small model solved the task, a low-communication $L$-round protocol would solve it too; but a low-communication protocol cannot, because the function table is large while each round transmits only a short summary, so two different inputs must yield the same transcript while requiring different answers.

The intuition is memorable: put the function table, largest first, at the beginning of the prompt, and the $w$ that determines the query path at the end. Causal attention prevents the table from seeing the query, so the computation spent on the table cannot be directed toward the entry that will actually be needed; only on reading $w$ does the model learn where to look.

In one sentence: for strictly sequential tasks, Transformer depth is not only capacity, it is incompressible sequential time.

## How the three relate

Consistency, the family tree and expressivity answer three different questions:

- Consistency asks about the **semantic promise**: the model claims a posterior, so is that posterior internally coherent?
- The family tree asks about **engineering choice**: where do specialised, transferable and general models each gain?
- Expressivity asks about the **limits of capability**: what can one pass compute, and what does CoT buy on top?

All three depend only on the model's own behaviour, with no ground-truth labels — which is probably why they can be discussed together.

## Open questions

- C1 is cheap to measure but has no interpretive baseline: how small is "acceptably inconsistent"?
- If future TFMs output multivariate densities or copulas directly, both conditions must generalise from one pair of targets to arbitrary subsets, and the constraints become far stronger.
- Expressivity results are asymptotic, while tabular tasks are usually small (hundreds of rows). At what scale does the asymptotic bound start to bite?