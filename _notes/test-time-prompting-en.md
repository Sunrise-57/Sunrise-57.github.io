---
title: "Adapting Without Touching the Weights: Prompts, Routing, Text"
subtitle: "Four papers on test-time prompting and training-free adaptation"
date: 2026-11-10
topics: ["deep-learning", "machine-learning"]
summary: "When backpropagation is unavailable or undesirable, adaptation moves to the edges: prompt vectors, expert routing, and the text embedding itself."
lang: en
permalink: /notes/test-time-prompting/
alt_url: /zh/notes/test-time-prompting/
---

Backpropagation has a cost. Quantised models, hard-coded models, and services that expose inference only cannot absorb a gradient step. Adaptation therefore moves elsewhere: the prompt vector, the expert assignment, or the text embedding. The four papers below each take one of those routes to its limit, and they share a constraint — **only the outside of the model, or something very shallow inside it, may change**.

| Paper | Venue | Claim in one line |
| --- | --- | --- |
| D²TPT | AAAI 2026 Oral | Tuning prompts on unlabelled data introduces bias; remove it twice |
| FOZO | CVPR 2026 | Estimate the prompt gradient in two forward passes |
| R²-T² | ICML 2026 | Router weights are sub-optimal; re-route using similar correct cases |
| NEAT | Negation understanding | Look at VLM negation through the TTA lens |

## D²TPT: two removals of prompt-optimisation bias

Test-time prompt tuning (TPT) avoids labels by optimising a learnable prompt to fit the target task. Optimising on unlabelled test data alone, however, introduces a prompt-optimisation bias that can hurt downstream accuracy.

The first correction happens on the prediction side: dynamic retrieval-augmented modulation. Every class keeps a registry of capacity $K$ holding image features of high-confidence samples together with their minimum entropy. For a new sample, an entropy threshold filters the augmented views, the most frequent pseudo-label is taken, and the smallest entropy among views carrying that label becomes the sample's confidence. A full registry replaces its highest-entropy entry when a lower-entropy sample arrives. Retrieval uses the visual feature as query, the class prototype mean as key and a one-hot vector as value; the retrieved logits are combined by an RBF-style weighting and added to the original logits with residual ratio $\lambda$.

The second correction happens on the optimisation side: reliability-aware prompt optimisation with two regularisers. Confidence-weighted ensembling scores each view by the sum of its similarities to all other views and weights the fused prediction accordingly, suppressing low-quality augmentations. Cross-modal consistency distillation lets image and text alternate as teacher and student — original visual to tuned text, tuned text to original visual, tuned visual to tuned text — and sums the three logit terms.

Evaluations span 15 benchmarks covering natural distribution shift and cross-dataset generalisation, with top-1 accuracy on 10 datasets; all $p$-values are below 0.05. Normalised image–text feature distances are used to show that distillation improves alignment.

One design choice is worth remembering: **the knowledge base stores only high-confidence samples and evicts by entropy**. That converts an unlabelled problem into a self-consistency problem.

## FOZO: prompt optimisation with forward passes only

The motivation for zeroth-order optimisation in TTA is straightforward: update without gradients, and without modifying internal parameters, which makes the method applicable to quantised or immutable models.

Estimation uses SPSA: perturb the prompt, run two forward passes, and obtain an unbiased gradient estimate; averaging several perturbations (n-SPSA) reduces variance. The perturbation vector is resampled from a seed rather than stored, so memory cost equals that of inference.

Two theoretical points matter. The convergence rate depends on the effective rank $r$ rather than the parameter dimension $d$, so optimisation remains efficient in a high-dimensional prompt space. And the perturbation scale $\epsilon_t$ cannot stay constant: if it does not decay to zero, the bias term persists and blocks convergence; yet early in optimisation, or on noisy out-of-distribution streams, a larger $\epsilon_t$ buys exploration and helps escape local minima. Hence a dynamic perturbation schedule.

For supervision, [CLS] tokens from intermediate layers are split into a shallow group and a deep group, each aligned to precomputed source statistics $\mu_k^S$, $\sigma_k^S$, which corrects low-level appearance change and high-level semantic shift at the same time; prediction entropy minimisation is added on top.

Experiments cover ImageNet-C, a quantised ViT (8-bit PTQ4ViT), ImageNet-R and ImageNet-Sketch. One practical note: overly large batches smooth the feature statistics and lose fine-grained domain information.

## R²-T²: re-routing at test time

Multimodal MoE performance depends heavily on the router, and a router trained end to end does not always produce optimal routing weights for a given test sample. This is a decision-level issue, independent of model size.

The working hypothesis is transferability of knowledge and skill: similar problems need similar underlying capabilities. A neighbourhood of the test sample is located inside a reference set — samples the model already answered correctly on other data — and the successful routing weights of that neighbourhood become targets for a local correction. Neighbourhoods are defined either as the $k$ nearest samples or as everything within a distance threshold; similarity must be computed in an embedding space, not on raw pixels or text.

Three optimisation strategies trade cost against quality:

- Neighbourhood gradient descent (NGD): build a surrogate loss from the neighbourhood (the test sample has no label, but its neighbours do) and iterate on the routing weights. Best results, highest cost.
- Kernel regression: kernel-weighted average of neighbouring successful routings, scaled by a searched fusion coefficient.
- Mode seeking: move the current routing vector by a fixed step toward the densest region of routing space.

On MoAI-7B, across 9 benchmarks against 7B/8B/13B vision-language models, the base 7B model improves substantially. Ablations cover neighbourhood hyperparameters, similarity kernels, gradient steps and embedding models. The authors conclude that the routing decision matters as much as model scale.

## NEAT: reading negation as double concept shift

Vision-language models struggle with negation ("a road without ice", "a lung nodule without malignant features"). Pretraining data is dominated by affirmative descriptions, so negation is rare; data-driven remedies such as NegBench and NegationCLIP need millions of generated negative image–text pairs, which is expensive and hard to sustain.

The obstacle is characterised as a double concept shift, quantified by two MMD values. Affirmative and negative texts that describe the same image are far apart, at 1.57. A negative text and its reversal — which wrongly asserts the absent element and denies the present one — are close, at 0.08. The model treats text as a bag of words and ignores syntax.

The method updates only layer-norm parameters and optimises three losses. Negation separation uses a lightweight LLM to decompose a negated query into a positive component (attributes that should be present) and a negative component (attributes to exclude). KNN fails here, because cosine similarity in the embedding space is exactly what the shift has broken; instead a similarity of "positive match multiplied by a negation penalty" is used, on top of which a refined entropy loss is minimised. Semantic reversal swaps the two components to build a semantically opposite text, and only the least similar visual candidate is used as the hardest negative, since a standard contrastive loss would pull unrelated images closer and damage the learned semantic structure. Text debiasing then adjusts the distribution of text embeddings directly.

The results are striking: on MS-COCO negation retrieval, using 0.007% of NegFull's data and under 0.014% of its parameters, $rSum$ exceeds the fully fine-tuned state of the art by 12.44. On MSR-VTT video negation retrieval, 1,000 unlabelled videos suffice for consistent gains. The most telling comparison is multiple choice: other TTA methods improve retrieval slightly while multiple-choice accuracy drops, which suggests they narrow the modality gap without understanding negation.

## Across the four

All four assume that changing the model's interior is too expensive, so adaptation is pushed to the boundary: the prompt at the input, the router in the middle (but only as a selection), the text embedding at the output. The further out you go, the more control you have and the less you can change.

Two recurring tricks. First, **use the model's own high-confidence outputs as anchors** — D²TPT's knowledge base, NEAT's refined entropy, FOZO's entropy minimisation — which is self-consistency in three different costumes. Second, **replace an unreliable similarity**; NEAT swaps KNN for a match-times-penalty score, a reminder that under distribution shift the most basic retrieval primitive is itself what fails.

## Open questions

- Can prompt-, routing- and text-level adaptation substitute for one another? They are currently validated separately.
- How much does the variance of zeroth-order estimation depend on the ratio of prompt dimension to effective rank?
- NEAT suggests alignment and understanding are different things. Should TTA evaluations report them separately?