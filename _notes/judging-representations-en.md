---
title: "Judging a Representation: Quality, Interpretability, Capacity"
subtitle: "Reading notes on three ways to measure what a representation is worth"
date: 2026-11-10
topics: ["machine-learning", "deep-learning"]
summary: "Quality can be approximated by rank (QME), interpretability by the area under a fidelity–sparsity curve (IIS), and capacity by whether modalities compete for the same gradients (Uni-X)."
lang: en
permalink: /notes/judging-representations/
alt_url: /zh/notes/judging-representations/
---

The earlier notes asked how to combine modalities. This one asks a different question: once combined, how do we know whether the resulting representation deserves trust? Three papers provide three rulers — quality (which stream of scores is reliable), interpretability (how much semantics survives a projection to a concept space), and capacity (whether modalities compete for the same parameters).

| Paper | Venue | The ruler |
| --- | --- | --- |
| QME | ICCV 2025 | Similarity rank used as a quality label |
| IIS | ICLR 2025 | Area under the fidelity–sparsity curve |
| Uni-X | ICLR 2026 | Similarity of gradients as a conflict score |

## QME: rank as quality

Whole-body biometrics models faces, gait and body separately and then fuses the scores. The usual approach weights the per-modality similarity matrices and averages them, but each modality produces its own score distribution, so simple weighting neither aligns the distributions nor assigns sensible importance.

QME makes score fusion learnable with a mixture of experts, each expert standing for one fusion strategy. The hard part is routing: instead of predicting assignment probabilities from the input, the router is driven by weights produced by a quality estimator.

The quality estimator treats rank as its supervision. For each query, features are extracted with a pretrained model and compared with gallery templates; the resulting similarity rank is taken as a proxy for the sample's quality. The weight $w_i$ is mapped from the mean and variance of intermediate backbone features and $r_i$ is the rank of $q_i$; a pseudo-quality loss trains the estimator without human annotations. The hyperparameter $\delta$ sets tolerance for low ranks: with small $\delta$, samples ranked below $\delta$ have their quality weight pushed to zero; with large $\delta$, even a poorly ranked sample may keep substantial weight.

The loss is also modified. A standard triplet loss constrains only relative order — the positive should be closer than the negative — and says nothing about the absolute value of the negative distance. Even if the positive is much closer, a small negative distance can still let the wrong match be accepted. A score triplet loss suppresses non-matching scores directly and forces matching scores up to a margin $m$.

Training runs in two stages: the quality estimator is trained first, frozen, and then the mixture of experts is trained on top. Ablations show that dropping the estimator in favour of averaging all experts degrades performance, and a scatter plot confirms that predicted quality weights correlate with true ranks.

## IIS: interpretability as a measurable area

Pretrained visual representations are usually optimised for downstream discriminability, while applications increasingly demand interpretability. Both existing routes pay a price. Interpretability-oriented methods impose semantic constraints on the representation space and often lose accuracy; discriminability-oriented methods explain after the fact, but nothing guarantees the semantics are captured by the explainer, so information is lost.

The paper defines interpretability as **how much task-relevant semantics survives when the representation is projected into a human-understandable concept space and used for prediction**. The inherent interpretability score (IIS) measures exactly that: the area under the curve of retained predictive accuracy as the projection to concept space is made sparse. A larger area means less semantic loss and higher interpretability.

The empirical claim is counter-intuitive and useful: across models, IIS and predictive accuracy are positively correlated. Interpretability and discriminability are not necessarily in tension — training that improves interpretability can raise accuracy, and more discriminative representations can yield more faithful explanations.

## Uni-X: gradient conflict and separating the ends

Unified multimodal models try to put text reasoning, visual understanding and image generation into one framework. The mainstream route quantises visual input into discrete tokens and predicts a single sequence autoregressively. The problem: a standard Transformer with fully shared parameters suffers severe gradient conflict on such input.

The measurement is direct. Two separate mini-batches — one pure text, one image–text pairs — are run forward and backward from the same checkpoint to obtain $g_{\text{text}}$ and $g_{\text{img}}$, and their similarity defines the conflict $c_g$.

The attribution uses conditional entropy: visual token sequences have markedly higher conditional entropy than English, German or Chinese, and a shared Transformer must reconcile these very different statistics in both shallow and deep layers, which is where the conflict concentrates. Representations in the middle layers become abstract and semantic, and align across modalities naturally there.

The architecture therefore separates both ends and shares the middle: modality-specific layers handle low-level processing in the shallow and deep blocks, while a shared central block performs high-level semantic fusion. Ablations show an n-shaped trend in the number of separated layers — more separation helps modality-specific low-level processing, but too much shrinks the shared middle and weakens cross-modal reasoning; a 9:5 split (slightly more shallow separation) works best.

There is a side benefit. Because the separated layers run strictly isolated computation streams, for visual tokens of length $a$ and text tokens of length $b$ the self-attention cost drops from $O((a+b)^2)$ to something proportional to $a^2+b^2$.

## How the three rulers divide the work

- Quality is a **sample-level** judgment: which stream of scores to trust for this query. It needs pseudo-labels, and rank happens to be a free and stable one.
- Interpretability is a **representation-level** judgment: whether the space preserves semantics. It needs a concept space and a projection, but no labels.
- Capacity is an **architecture-level** judgment: whether modalities fight over the same parameters. It needs gradient statistics and describes training dynamics rather than final metrics.

They are not substitutes. A model can estimate quality well and remain uninterpretable; it can be highly interpretable and still short of capacity.

## Open questions

- Using rank as a quality proxy assumes similarity rank increases monotonically with quality. Does that survive across domains?
- IIS is defined through a projection, and the area is meaningful when the projection is close to linear. What happens when the explainer is nonlinear?
- Uni-X chooses its separation ratio from the entropy gap between modalities. If two modalities had similar conditional entropy, would separation still help?