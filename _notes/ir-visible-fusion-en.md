---
title: "Infrared and Visible: Fusion, Restoration, Pretraining"
subtitle: "Five papers on how infrared and visible images work together"
date: 2026-11-10
topics: ["computer-vision", "multimodal-learning"]
summary: "The question keeps changing: first make two images into one that looks good, then make that result actually help a detector, then learn from unlabelled pairs before any task exists."
lang: en
permalink: /notes/ir-visible-fusion/
alt_url: /zh/notes/ir-visible-fusion/
---

The complementarity of infrared and visible images is the shared premise of this line of work: visible light carries texture and colour, infrared carries thermal radiation that does not depend on illumination. But "complementary" turns into three different problems in practice — how to compose one image, how to make that composition serve a task, and how to learn a representation without labels. The five papers below map onto those three layers.

| Paper | Venue | Which layer |
| --- | --- | --- |
| UMCFuse | TIP 2025 | Fusion under compound degradation |
| Image fusion + detection | CVPR 2025 | Joint optimisation of fusion and a downstream task |
| CWNet | ICCV 2025 | Semantic consistency in low-light enhancement |
| M-SpecGene | ICCV 2025 | Multispectral self-supervised pretraining |
| Retina-inspired contrastive pretraining | — | Cross-modal alignment during pretraining |

## One image hit by fog, low light and noise at once (UMCFuse)

Real acquisition rarely satisfies the implicit "high-quality imaging" assumption. Low light, fog, rain and snow, overexposure, noise, flames and sensor blur frequently co-occur; the visible domain loses detail and contrast, and infrared texture suffers from weak signal and atmospheric disturbance.

The usual restore-then-fuse pipeline struggles to set a uniform weight for several degradations at once and is expensive to compute, while methods specialised for a single degradation generalise poorly. UMCFuse models degradation and fusion inside one framework, using the atmospheric scattering model as a physical prior.

The decomposition has three steps: estimate and refine a transmission map; use it to split the visible image into a structure layer and a contrast layer; then decompose those and the preprocessed infrared image into low and high frequency parts, separating noise from detail with a scale-aware denoising filter and a frequency-domain decomposition.

Fusion then treats high frequencies with adaptive denoising, detail-preserving discrimination and salient-detail weighting, and low frequencies with energy-guided Gabor multi-orientation features, before reconstruction. The significance is architectural: instead of one module per degradation, every degradation is explained as a difference in the transmission map.

## The fused image has to be usable by the detector (IVIF + detection)

A fused image that looks good to a human is not necessarily useful for detection. Most methods keep fusion and high-level tasks separate, so the fused result brings limited accuracy gain and the task output gives little signal back to fusion.

Two specific difficulties: different objects rely on different feature dimensions and information types, which makes cross-dimensional collaboration hard; and the weighted joint loss depends heavily on hand-tuned coefficients, easily producing "improve one, sacrifice the other".

The method encodes infrared and visible images into two low-dimensional fused feature maps. The detection network processes the visible image and outputs high-dimensional semantic features, from which a feature patch is cropped to match the spatial position of the fused map. The three are adapted by light CNN blocks into $Q$, $K$ and $V$ for cross-attention, injecting object location and category semantics into the fused features. A discriminative enhancement module splits the feature map into object and background regions, maps pixels into $(0,1)$ and modulates by the mean, increasing contrast between object and background.

The weights of the two task losses are searched by an evolutionary algorithm rather than set by hand. Comparing three coefficient strategies (empirical, uniform, searched) and two training schemes (separate, joint), the searched combination gives the best mAP/mIoU.

## Separate the semantics to keep from the anomalies to remove (CWNet)

Low-light enhancement has to brighten an image while keeping colour and semantics consistent, and high-frequency detail is entangled with noise, so treating them together yields results that are bright but unnatural.

CWNet describes low-light formation with a structural causal model: the semantic factor $S$ is causal, while brightness and colour anomalies $U$ are non-causal perturbations; enhancement should preserve $S$ and remove $U$. The distinction is supported empirically by two counterfactual interventions on normal-light images (brightness degradation, colour anomaly) with ATE computed — different semantic regions react very differently to the two, which motivates both global and instance-level consistency.

Architecturally the backbone is wavelet based. A discrete wavelet transform gives four subbands $\{L,H,V,D\}$; the low-frequency band uses WTConv to enlarge the receptive field, while the high-frequency bands use depthwise separable convolutions with directional kernels and then interact with the low-frequency branch. The high-frequency block borrows from state-space models and sends each directional band through a matched 2D-SSM scan, aligning the scan direction with edge orientation. The low-frequency block synthesises an intermediate image by inverse wavelet transform and passes it through two fast Fourier convolution stages for large-receptive-field global restoration.

The authors state the relationship between the two components plainly: causal reasoning decides the principle of enhancement, the wavelet network executes it. The limitation is equally clear — under compound degradation (low light plus blur or haze) only colour and brightness are partly preserved, and detail recovery falls short.

## Learning how infrared and visible correspond, without labels (M-SpecGene)

Most infrared–visible tasks still use task-specific two-branch networks with hand-designed fusion modules, which brings three problems: inductive bias that only works for one task; modality bias, since thermal branches are often initialised from ImageNet weights that encode priors inconsistent with thermal imaging; and a data bottleneck, since aligned RGBT data is hard to collect and expensive to annotate.

M-SpecGene learns modality-invariant representations from large-scale unlabelled multispectral data under a self-supervised objective. The core idea is an information-aware masking strategy. Infrared–visible data is markedly imbalanced: object scale and spatial distribution vary, and the two modalities carry asymmetric information density. ImageNet objects are usually centred and large, whereas RGBT datasets are not object-centric and contain smaller, weaker, unevenly distributed objects, so random masking spends too much of its budget on sparse regions.

The paper defines cross-modality structural sparsity (CMSS). In low-information regions such as sky, patches have high similarity and low structural variance, so CMSS is high; in semantically rich regions such as pedestrians, patches differ more, so CMSS is low. A Gaussian mixture model fits the CMSS distribution and is re-estimated every epoch alongside pretraining; masking samples around the distribution and covers the nearest set of patches, with a bias term on top of the base masking ratio that adapts to the difference between the two modalities' reconstruction losses.

Validation spans detection, segmentation, matching and salient object detection across 11 datasets, with ablations on the pretrained model, architecture, masking strategy, decoder depth and base masking ratio.

## Borrowing from the retina to line up thermal and visible semantics

Visible and infrared pretrained models are each strong in their own domain but often fail when used across modalities: an infrared model's sensitivity to brightness transfers badly to RGB and breaks localisation, while an RGB model cannot adapt to the absence of hue and texture in thermal images.

The approach uses two pathways with low-rank adaptation: the visible backbone's weights are frozen and a low-rank increment is trained as the infrared correction, capturing the infrared-specific distribution with very few parameters. Alignment happens at patch level — since thermal images often contain several object classes and are non-iconic, a whole-image feature mixes semantics, so the infrared feature is split into a patch set and each patch is aligned to the RGB semantic space as an independent unit.

Two further designs borrow from retinal circuitry. First, pseudo-labels come from a lateral-inhibition-like rule: keep only the patches with the highest attention until a cumulative threshold, zero the rest, which denoises and sharpens contrast. Second, dual knowledge preservation pairs the adapter with synchronous distillation, so adapting to the new modality does not cause catastrophic forgetting.

## Three judgments on this line

1. The evaluation of fusion is shifting from "does it look good" to "does the downstream task use it". Injecting detection features into the fusion network and balancing the losses with an evolutionary search is the clearest instance.
2. Degradation should not be handled case by case. UMCFuse explains many disturbances through one transmission map; CWNet separates the semantics to keep from the anomalies to remove through a causal model. Both are looking for one coordinate system.
3. Modality imbalance during pretraining is structural. M-SpecGene adjusts masking by information density; the retina-inspired work uses low-rank increments and patch-level alignment. Both accept that the two modalities should not be treated equally.

## Open questions

- Fusion quality is still judged by visual metrics plus downstream metrics; there is no single measure reflecting both structural fidelity and task usability.
- Can causal decomposition under compound degradation extend to more degradation types without redesigning the interventions?
- Information-density estimation relies on patch-level statistics. Does it remain stable for very small objects?