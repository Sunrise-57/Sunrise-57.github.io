---
title: "Traditional Vision Tasks Are Only the Perception Stage"
subtitle: "Starting from one closed-loop diagram: which stage traditional computer vision belongs to, and why that definition does not survive scrutiny"
date: 2026-11-12
topics: ["computer-vision", "machine-learning", "uncertainty"]
summary: "Once the diagram \"perception — prediction/reasoning — action\" is formalised, traditional vision tasks occupy only the first box: a one-way, open-loop, offline observation encoder. From there the five causes of the loose definition of \"vision task\" can be separated one by one, together with a replacement definition centred on what an agent needs."
lang: en
permalink: /notes/vision-task-definition/
alt_url: /zh/notes/vision-task-definition/
math: true
---

A closed-loop diagram draws the agent loop in four segments: **perception → prediction ⇄ reasoning → action**, with action flowing back into perception. The question most often asked of it is: which of these segments do traditional computer vision tasks belong to?

The answer looks simple — perception. But to make that answer stand, one first has to say what "belong to" means, and then why this division keeps producing a series of doubts about how "vision tasks" are defined. This note does both.

## 1. First, read the diagram as a formal structure

The four boxes plus the one return arrow line up closely with the language of a POMDP:

| Box in the diagram | Mathematical role | What it does |
| --- | --- | --- |
| Perception | Observation model $e: \mathcal{I} \to \mathcal{S}$ | Compresses pixels into a legible state description |
| Prediction | Transition model $T: \mathcal{S} \times \mathcal{A} \to \Delta(\mathcal{S})$ | Gives a distribution over "what happens next" |
| Reasoning | Counterfactual reasoning and planning over $T$ | Compares the futures that different actions lead to |
| Action | Policy $\pi: \mathcal{S} \to \mathcal{A}$ | Turns state into an action on the world |
| Return arrow | $a_t \to I_{t+1}$ | A decision changes the next observation |

Two details are worth noting: **the arrow between prediction and reasoning runs both ways**, which indicates an internal loop of conjecture, test, and revision; and **the return arrow at the bottom** indicates that the whole system is fed by its own actions.

## 2. Traditional CV occupies only the first box

In one sentence: a traditional vision task can be characterised as a **one-way, open-loop, offline** observation encoder. The input is an image, the output is a description; in between there is no action $a$, and no next state $s'$.

This is not rhetoric; it can be checked item by item:

| Question | Answer for traditional CV | What it takes to cross this box |
| --- | --- | --- |
| Does the output contain "what happens next"? | No — only properties of the current frame | A transition model, video prediction |
| Does it support "what if …"? | No — it fits correlations only | Causal or dynamical models that admit intervention |
| Does it produce actions on the environment? | No — the output goes to a human or a downstream module | A policy and actuators |
| Does a decision change the next input? | No — open-loop, offline, per-frame evaluation | Active perception, an embodied loop |
| Is the objective task return? | No — it is the likelihood of the annotations (cross-entropy, IoU, AP) | A reward or value function |

All five answers are no, so it belongs strictly to perception. To put it as an analogy: **it is an eye, not a brain, and not a hand.**

More formally: traditional CV optimises the empirical risk of $P(y \mid I)$, whereas a closed-loop system solves $\arg\max_a \mathbb{E}[R \mid s]$. The former is statistical inference; the latter is control.

## 3. Three kinds of work that look as if they cross the boundary

1. **Optical flow, video prediction, trajectory forecasting, early action recognition.** Formally these do implement $s \to s'$, but what they predict is the continuation of an observable; they serve no decision, and have no counterfactual branch. This is the precursor of prediction, not a world model. There is only one test: can it answer "what happens if I do $a$"?
2. **SLAM, multi-view geometry, NeRF and 3D reconstruction.** These output pose, structure, or radiance fields; that is state estimation. They are the *interface* to a closed loop (they supply $s$ downstream), but they do not close it themselves — no action, and no return.
3. **Active vision and embodied intelligence.** Only here is "where to look, and moving in order to look again" decided by a policy, so only here is that return arrow actually used. This is the only substantive connection between traditional CV and action.

## 4. Why this definition of "vision task" does not survive scrutiny

| # | Cause | Example |
| --- | --- | --- |
| 1 | Tasks are defined by **datasets**, not by problems | COCO detection and LVIS detection are not the same task; the IoU thresholds and NMS inside AP substantively participate in defining the task |
| 2 | **Ground truth is a human convention**, and conventions conflict | The same pixel has four different "correct answers" across semantic, part, amodal, and panoptic segmentation |
| 3 | Tasks are assumed to be **functions**, but are conditional distributions | Shape under occlusion and monocular depth are underdetermined in essence; a multi-modal conditional distribution is reduced to a single mode |
| 4 | The task list is a **historical accumulation** with no ontology | MNIST → ImageNet → COCO → VQA: each step is "the previous gap plus a new dataset" |
| 5 | **The direction of definition is inverted**: tasks are derived backwards from what humans can annotate, rather than forwards from what is needed | Affordance, physical properties, and uncertainty have no standard task; and some finely specified tasks have limited use upstream and downstream |

Cause 5 is the root; the first four are its symptoms.

## 5. Construct validity: measuring something other than what is claimed

All these symptoms converge on a problem in measurement. A model can pass a test by exploiting spurious correlations in the data (shortcut learning), and can surpass human accuracy on ImageNet while collapsing under distribution shift. This shows that the mapping being defined and optimised is not the capability the task name claims.

That is a failure of **construct validity**: a benchmark is an operational definition, and the operational definition has been taken for the essential one. Traditional tasks are well defined *internally* — given a data distribution, an annotation protocol, and a metric, each is a precise optimisation problem; all of their looseness is *external*: whether they transfer, whether they correspond to a real capability, and where the boundary lies.

## 6. A more workable replacement definition

Rather than asking "which vision tasks exist", ask "what does an agent need to know". By that criterion there are only four kinds of task:

1. **State estimation**: $I \to \Delta(\mathcal{S})$, and it must supply calibrated uncertainty;
2. **Dynamics**: $(s, a) \to \Delta(\mathcal{S})$;
3. **Affordance**: $s \to 2^{\mathcal{A}}$, i.e. which actions the state permits;
4. **Value**: $s \to \mathbb{R}$, i.e. how good the state is.

Traditional CV covers less than half of the first. This also explains why the "traditional task list" looks diffuse: it projects what an agent needs through annotation cost, and a projection of course distorts.

## 7. Conclusion

> A traditional computer vision task can be characterised as the empirical fit of an observation model $e: I \to s$: the input is a single frame or a short observation window, the output is a description of the current state, the objective is the likelihood of the annotations rather than task return, and the evaluation protocol is offline, open-loop, and per-frame. Within the loop "perception — prediction/reasoning — action" it therefore performs the function of perceptual encoding only: it possesses no state-transition model and produces no action on the environment, and so does not constitute a closed loop. To equate such tasks with "visual capability" is, in essence, to mistake an operational definition anchored in datasets and annotation protocols for a definition of capability — and this is precisely the root of why the task boundary has long been ill-defined.

## Glossary

| 中文 | English | Note |
| --- | --- | --- |
| 感知 | perception | first stage of the loop: the observation model |
| 观测模型 | observation model | $e: I \to s$ |
| 转移模型 | transition model | $T: (s, a) \to \Delta(\mathcal{S})$ |
| 策略 | policy | $\pi: s \to a$ |
| 开环 / 闭环 | open-loop / closed-loop | |
| 标注数据的似然 | label likelihood | the objective of a traditional task |
| 操作定义 | operational definition | |
| 构念效度 | construct validity | |
| 可供性 | affordance | |
| 欠定 | underdetermined | |
| 历史沿革的产物 | historical accumulation | |
| 逐帧评估 | per-frame evaluation | |

## References

- [Zhenhailong Wang's Lab, Westlake University](https://mikewangwzhl.github.io/lab/) — source of the closed-loop diagram.
- Marr, *Vision: A Computational Investigation into the Human Representation and Processing of Visual Information* (1982).
- Bertero, Poggio & Torre, [Ill-posed problems in early vision](https://scholar.google.fr/citations?view_op=view_citation&hl=ja&user=ngaTx78AAAAJ&citation_for_view=ngaTx78AAAAJ:u-x6o8ySG0sC), *Proceedings of the IEEE* (1988).
- Geirhos et al., [Shortcut learning in deep neural networks](https://ei.is.mpg.de/publications/geirhosetal20), *Nature Machine Intelligence* (2020).
- Raji et al., [AI and the Everything in the Whole Wide World Benchmark](https://export.arxiv.org/abs/2111.15366) (2021).
- Jacobs & Wallach, [Measurement and Fairness](https://export.arxiv.org/abs/1912.05511v2), FAccT (2021).
- Zamir et al., [Taskonomy: Disentangling Task Transfer Learning](https://openaccess.thecvf.com/content_cvpr_2018/html/Zamir_Taskonomy_Disentangling_Task_CVPR_2018_paper.html), CVPR (2018).
- Zhai et al., [A Large-scale Study of Representation Learning with the Visual Task Adaptation Benchmark](https://scholar.google.ru/scholar?cluster=2504838252241466889) (2019).
- LeCun, *A Path Towards Autonomous Machine Intelligence* (2022).

---

*In one sentence: traditional vision tasks turned "seeing" into an evaluable problem, and never answered what the seeing is for.*
