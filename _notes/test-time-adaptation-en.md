---
title: "Adapting at Inference Time: Statistics, Consistency, Attention"
subtitle: "Seven papers on test-time adaptation for multimodal models"
date: 2026-11-10
topics: ["deep-learning", "machine-learning"]
summary: "What the design space looks like when adaptation happens on unlabelled test data, at frame rate, with several modalities that can fail independently."
lang: en
permalink: /notes/test-time-adaptation/
alt_url: /zh/notes/test-time-adaptation/
---

A model trained on source data degrades on a new scene, and no labels are available at test time. Test-time adaptation (TTA) answers this by moving the model onto the test stream and adjusting a small part of it with a signal that does not require labels. Multimodality raises the difficulty: the shift happens not only inside each modality but between them, and one sensor may be unusable for a frame while another stays clean.

The seven papers below are ordered along three questions: what gets updated, how reliability is estimated, and what supervises the update.

| Paper | Venue | Claim in one line |
| --- | --- | --- |
| READ | ICLR 2024 | Decide which modality is contaminated before weighting it |
| MM-TTA | CVPR 2022 | Fast/slow model consistency produces the pseudo-labels |
| Learnable consistency | CVPR 2023 | Parameterise the auxiliary loss so it aligns with the main task |
| CTTA-OD | CVPR 2025 | Domain-sensitive channels should be pruned, not adapted |
| ABPEM | AAAI 2025 | The self/cross-attention gap is itself an optimisable object |
| RGB-T TTA | CVPR 2025 | No gradients: EMA on batch statistics, plus periodic recovery |
| TCR | Cross-modal retrieval | When the query itself shifts, optimise the query predictions first |

## READ: reliability bias, and updating only what is safe

The difficulty in multimodal TTA is not only that each modality shifts, but that reliability ceases to be equal across modalities after the shift. Some modalities are contaminated at test time while others stay clean. If the model cannot identify this, the contaminated modality dominates the fused prediction — fusion can end up worse than a single modality. The authors call this reliability bias.

The method has two parts. Reliable fusion inserts a learnable projection layer before fusion and modulates it with attention so that weight moves toward unbiased modalities. Robust adaptation builds a confidence-aware loss with a threshold $\gamma$ (for example $e^{-1}$): above the threshold the loss pushes in the direction of strengthening the prediction, below it in the direction of suppressing it, so only reliable predictions drive the update.

Experiments use video–audio data with and without corruption. One detail is telling: if attention queries video with audio, then when the video is corrupted the model fails to extract good features even though the audio is clean. The direction of fusion decides whether a broken modality can contaminate a good one.

## MM-TTA: agreement between a fast and a slow model

TTA for 2D/3D semantic segmentation. Two copies of the model are maintained: the fast model $F$ replaces and updates its batch-norm statistics directly from test data; the slow model $S$ is pretrained on source data and then updated from $F$ by momentum. Inference uses $S$ only.

Pseudo-labels are produced in two stages. Intra-modally, a consistency measure between the predictions of $F$ and $S$ identifies reliable online pseudo-labels. Inter-modally, each modality gets a consistency $\zeta_M$, and the two are combined either by HardSelect (take the label from the more consistent modality) or SoftSelect (weighted sum by consistency); in both cases a pseudo-label is dropped whenever $\max(\zeta_{2D},\zeta_{3D})$ falls below a threshold $\theta(k)$.

Ablations show the slow model is necessary. It is the simplest form of self-scoring: no extra network, just a copy of the model that moves more slowly, and therefore disagrees where the fast copy is guessing.

## A learnable consistency loss: why the auxiliary task pulls the model off course

Test-time training uses an auxiliary task on test samples for a few gradient steps, but the auxiliary loss and the classification loss need not agree; the update can hurt. Updating all parameters overfits, and updating only batch-norm parameters sometimes degrades as well.

The paper makes the auxiliary loss itself learnable. "Two augmented views of the same image should have similar features" is written as a parametric function computed by a small weight network $f_w$, and $w$ is trained so that the normalised gradients $\nabla L_{\text{main}}$ and $\nabla L_{w_{\text{cont}}}$ become as close as possible. The encoder parameters and $w$ are updated alternately.

For parameter selection, a small adaptive block is appended after each encoder block; it changes neither dimension nor spatial size, and only its new parameters are updated. This is verified on DomainBed multi-source domain generalisation and on PACS for the single-source setting, with comparisons across auxiliary tasks (entropy minimisation, rotation, learnable consistency) and parameter choices (all, batch-norm only, new parameters only).

The takeaway is worth keeping: update capacity and stability trade against each other, and adding parameters is safer than opening up all of them.

## CTTA-OD: some features should be pruned, not adapted

Continual TTA for object detection, where the test distribution keeps changing and the deployment target is resource constrained.

The observation is that not every source-domain feature helps: channels that are sensitive to the domain can actively hurt on the target. Two sensitivity signals identify them. At image level, the L1 distance between a target feature map and the source mean feature map is averaged over the batch and normalised over space, giving one sensitivity value per channel; large differences suggest domain-specific noise. At instance level, the same is computed over RoIs predicted by the detector, restricted to proposals whose background confidence is below 0.5, to capture object-level shift.

Pruning uses the batch-norm scaling factors: an L1 penalty drives $\gamma_i$ toward zero and channels with $\gamma_i \lt t$ are removed. In parallel, $L_{\text{img}}$ pulls the source and target feature distributions together, and $L_{\text{ins}}$ minimises the per-class KL divergence between them, with the test mean estimated by EMA and class weights tied to class frequency to handle imbalance. Because pruning can fire too early or on the wrong channel, random reactivation puts some channels back.

Results are reported on Cityscapes → Cityscapes-C and UAVDT → UAVDT-C; t-SNE shows the surviving channels mix better across target domains.

## ABPEM: the attention gap, and entropy over the principal classes

Another quantity that can be modelled explicitly: the gap between self-attention (intra-modal) and cross-attention (inter-modal). Distribution shift causes both intra-modal and inter-modal change; the latter weakens alignment and fusion, showing up as a relative drop in cross-attention. Empirically the gap grows with the strength of the shift.

Two countermeasures. Attention bootstrapping treats the concatenated self-attention as a supervision signal for cross-attention, while blocking the gradient of the self-attention scores so the anchor cannot be dragged along. Principal entropy minimisation replaces plain entropy: plain entropy treats all $C$ classes equally, but when predictions are unreliable the entropy gradient is mostly noise. Instead, classes are ranked by $r_i$ (the number whose probability is at least $p_i$), and entropy is minimised only over the reliable principal set $SR(k)$, with $k$ controlling how far to trust.

Experiments use Kinetics50-C (video-dominant) and VGGSound-C (audio-dominant) to test generalisation across different modality importance, and compare a progression from the base model through attention guidance and plain entropy to principal entropy.

A transferable lesson: putting a reliability gate in front of a self-supervised signal matters more than tuning the learning rate.

## RGB-T tracking: fast parameter updates without gradients

RGB-T tracking needs real-time speed (tens of frames per second). Entropy-minimisation methods require backpropagation and updates to batch-norm affine parameters; long online updates drift, forget what was learned, and cost compute. Consistency-regularisation methods need heavy augmentation and a teacher–student pair, which is slower still. The binding constraint is therefore that no gradient may be computed at inference.

The method works with batch-norm statistics. During training, an EMA over each batch gives the expected mean and variance; at inference the EMA continues from the training values as a prior, moving the feature distribution toward the test domain without any gradient.

Long adaptation accumulates error, so a recovery step is added: the change in batch-norm statistics over several frames is treated as a pseudo-gradient, these pseudo-gradients are stacked into a matrix and decomposed by SVD to find the principal update directions, and every $K$ frames the parameters are corrected along those directions. Faithfulness requires mapping the eigenvectors back to the original space, normalising for stability, correcting the magnitude with a reference value, and checking directional correlation by inner product. Momentum is then scaled by how consistent the principal directions are, measured by an exponential moving average of the sum of eigenvalues.

The value of the paper is that it separates "adapt" and "recover" into two independently tunable actions.

## TCR: cross-modal retrieval when the query shifts

Retrieval has its own difficulty: no labels, and no reliable neighbours. Most methods assume queries follow the source distribution, but real query streams can come from scarce or highly personalised domains. The assumption breaks in two ways: consistency within the query modality weakens, and the modality gap widens.

TCR starts with query prediction optimisation. For each query, the most similar gallery samples form query–gallery pairs; a score built from the query–candidate distance (the modality gap) and the distance of each side to its own centre (intra-modal spread) selects the top 30%, which are then used to estimate an adaptive entropy threshold and the source-domain modality gap $\Delta_S$.

Three losses then drive adaptation: intra-modal consistency (making query embeddings more spread out and more discriminative within their own space), cross-modal gap learning (moving the target gap $\Delta_T$ toward the estimated $\Delta_S$ rather than flattening it), and noise-robust adaptation (letting only confident predictions drive the update).

The authors note explicitly that monotonically removing the modality gap does not always improve performance. That sentence generalises: for TTA as a whole, alignment is not a case of the more the better.

## What the seven share

Four judgments recur:

1. What you update matters more than how much you update. Adding a small block, updating only layer norm, or updating only batch-norm statistics differ far more than $10^{-6}$ versus $10^{-5}$ on the learning rate.
2. Reliability has to be estimated, not assumed. READ's fusion weights, MM-TTA's consistency threshold and ABPEM's principal set are the same move: score each prediction, then decide how much to believe it.
3. Supervision must be filtered. Unfiltered entropy minimisation treats noise as signal; with filtering, the same loss behaves differently.
4. Efficiency is a hard constraint. Tracking, detection and edge deployment make "can we backpropagate at all" a first-class design question, which is why batch-norm EMA, zeroth-order gradients and parameter recovery exist.

## Open questions

- Reliability estimates have no labels to validate against. How do we know the estimator is not just overfitting to the test stream?
- The interval and magnitude of parameter recovery are set by hand. Could the spectrum of the parameter trajectory choose them?
- In multimodal settings, "which modality is trustworthy" is often harder than "is the prediction correct", yet most confidence signals are intra-modal and there is little cross-modal verification.