---
title: "How to Combine Modalities: Weights, Experts, Gradients, Order, Conditions"
subtitle: "Five papers on how several streams of information should be combined"
date: 2026-11-10
topics: ["multimodal-learning", "gradient-learning", "uncertainty"]
summary: "Fusion is not concatenation. Five papers each move a different part: the weights (uncertainty), the division of labour (interaction experts), the gradients (decoupling), the order (reinforcement learning), the source of parameters (hypernetworks)."
lang: en
permalink: /notes/multimodal-fusion/
alt_url: /zh/notes/multimodal-fusion/
---

"More modalities" does not automatically mean "better". The fusion layer can suppress the encoders, the modalities can contradict each other, and one view can be pure noise for a whole segment. The five papers below each intervene at a different point: FUML at the weights, I²MoE at the division of labour, DGL at the gradients, MvRL at the order, HyperDet3D at where the parameters come from.

| Paper | Venue | What it changes |
| --- | --- | --- |
| FUML | ICML 2025 | Fusion weight = uncertainty plus conflict |
| I²MoE | ICML 2025 | Experts split by interaction type (unique, synergy, redundancy) |
| DGL | ICCV 2025 | The fusion layer's suppression of encoder gradients |
| MvRL | CVPR 2025 | The order in which views are combined |
| HyperDet3D | CVPR 2022 / TPAMI 2024 | Generate network parameters from a scene prior |

## When the streams disagree, who gets the weight (FUML)

Trustworthy multi-view classification often builds on evidential deep learning, but most methods look only at the amount of evidence, not at whether the evidence agrees. The consequence is paradoxical: on a conflicting instance, several views can each give strong but contradictory evidence, and the aggregated uncertainty comes out low, badly underestimating the risk.

FUML splits a view's class-level confidence into membership (how possible it is that the sample belongs to each class) and necessity (how certain it is that the sample belongs to class $k$ and not to the others); in the binary case confidence reduces to membership, and the whole thing is supervised by cross-entropy. A Shannon entropy over the per-class confidences then yields the view's decision uncertainty.

Decision uncertainty alone captures only within-modal doubt, not disagreement between views, so conflict is modelled separately. The final fusion weight accounts for both.

The theoretical intuition is clean. Fuse a clean view A with a noisy view B and B carries high uncertainty, so its weight drops. Fuse A with a misaligned view C and C's uncertainty may be unremarkable, but its conflict with the others is high, so its weight drops as well. Fuse B with C and both terms are in play.

## Give each way of combining information its own expert (I²MoE)

Most fusion methods use one set of parameters for every modality interaction, so complementary, redundant and conflicting information is treated identically — information is lost, and the decision is unreadable.

I²MoE writes partial information decomposition (PID) directly into the architecture: $n$ unique experts (one per modality), one synergy expert and one redundancy expert. The division of labour is induced by weak supervision: during training, modalities are randomly masked with noise vectors and predictions are compared across three inputs — the full input, the input with only modality $i$, and the input with only modality $j$.

- Unique experts use a triplet loss: the full input should predict like "only modality $i$" and unlike "only modality $j$".
- Synergy experts minimise cosine similarity between full and degraded predictions, since synergy only appears when everything is present.
- Redundancy experts maximise that similarity, because they extract shared information.

A reweighting module then scores the experts per sample. The weight distribution for a single sample gives local interpretability; the distribution over a whole dataset gives global interpretability.

A few ablation results are worth keeping: applying the interaction loss to intermediate embeddings beats applying it to outputs; replacing sample-level reweighting with a shared global weight degrades results noticeably; and more thorough perturbation during training produces more complete coverage of interaction types.

## Multimodal training stalls when fusion cuts the gradients (DGL)

Multimodal models often fail to match the single-modal version of their own strongest encoder. The usual explanation is imbalance between modalities — a strong modality suppressing a weak one — and the usual remedies are teacher assistance, gradient modulation and alternating optimisation. Each has a cost: teacher methods need extra training stages, gradient modulation improves the weak modality while degrading the strong one, and alternating optimisation does not explain why the strong modality gets worse.

DGL locates the cause structurally: the fusion layer suppresses the gradient that flows back to each encoder. If fusion is assumed to be concatenation, rewriting the gradient reveals a scaling factor below one, so during multimodal training every modality — including the strongest — receives a smaller gradient than it would in single-modal training. Learning is slower and accuracy drops, and the suppression worsens as training proceeds.

Two operations decouple the gradients. Gradient detaching applies `detach()` to the inputs of fusion, so the loss acts only on the fusion and classification layers and never reaches the encoders. Gradient reorganising rebuilds an independent optimisation path per modality: zero out all inputs except the current modality, compute a single-modal loss, and zero the single-modal gradient inside the fusion module before the multimodal gradient is formed; the two updates run in parallel rather than summed.

Experiments use ResNet18 throughout on three datasets and compare against G-Blending, the CVPR 2020 gradient-blending method that balances modality gradients with dynamic weights. G-Blending still lets every gradient share a path, so it cannot remove the conflict between encoder and fusion layer.

## The order in which streams are combined can itself be learned (MvRL)

Parallel fusion assumes all views are merged once, at the same stage. That ignores two things: views may contradict each other, and different views deserve different importance and possibly a different order.

MvRL casts multi-view fusion as sequential decision making: an agent (NVS) chooses the next view, an environment (PI) performs the pairwise fusion, and a DQN learns the order. The state is the current fused feature plus the history of actions (the latter tells the agent whether a view has already been used), the action space is $V+1$ dimensional, and the reward combines intra-cluster compactness with inter-cluster separation.

The key design on the PI side is a clustering head. Multi-view clustering has no labels, so the quality of a fused feature cannot be measured directly; a softmax fully connected head produces soft cluster assignments and a DDC loss (inter-cluster separation, intra-cluster compactness, sharp boundaries) serves as a replaceable quality measure. Training samples the number of steps $T \in [1,V]$ and the order at random, so the model cannot overfit to a fixed sequence.

Beyond accuracy, the paper analyses the effect of fusion order, the reward hyperparameters, and whether views may be reused (with a cooldown mechanism), and visualises the sequences the agent selects.

## Guess the scene first, then generate the weights (HyperDet3D)

Point clouds are sparse and unordered, and looking only at the object produces ambiguity — a fridge read as a cabinet. Knowing that the candidate sits in something like a kitchen changes the answer. HyperDet3D injects this scene-conditioned information into the backbone's parameters.

The scene prior is decomposed into scene-agnostic and scene-specific parts, learned jointly with multi-head scene-conditioned attention, and aggregated with object-level features in the decoder. The detection head is disentangled accordingly, so classification and regression draw on different priors.

From the perspective of "how does a hypernetwork produce correct parameters", two points matter. First, the hypernetwork needs an explicit learning signal: the follow-up design replaces "raw scene into hypernetwork" with upstream scene-level pretext tasks — predict which classes occur, predict where objects are likely to be — and generates decoder weights from those priors. Second, the quality of the embedding that conditions the hypernetwork sets the ceiling: in any pipeline that extracts features before generating parameters, information loss must stay small.

## Summary

The five intervention points map onto five different failures:

- Weights are inaccurate → model conflict in addition to uncertainty (FUML).
- The division of labour is unclear → force experts apart with weak supervision (I²MoE).
- Training stalls → check whether gradients are being cut at the fusion layer (DGL).
- The order should not be fixed → treat fusion as a sequence (MvRL).
- Parameters should not be globally shared → condition them on the scene (HyperDet3D).

## Open questions

- Can conflict and uncertainty be merged into one quantity instead of two additive terms?
- Should the number of experts be decoupled from the number of modalities? Current designs grow linearly with modalities.
- After gradient decoupling, does the fusion layer need more capacity, or has the conflict simply moved inside it?
- How should hypernetwork-generated parameters be balanced against the backbone's own gradient updates? At the moment this ratio is set empirically.