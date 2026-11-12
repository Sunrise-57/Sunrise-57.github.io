---
title: "Traditional Vision Tasks Are Only the Perception Box"
subtitle: "Starting from a closed-loop diagram: which stage traditional computer vision occupies, and why that definition does not survive scrutiny"
date: 2026-11-12
topics: ["computer-vision", "machine-learning", "uncertainty"]
summary: "Formalised, the loop 'perception — prediction/reasoning — action' leaves traditional vision tasks in the first box alone: a one-way, open-loop, offline observation encoder. From there, five causes of the persistent vagueness in 'vision task' can be separated, and a replacement definition organised around what an agent needs becomes available."
lang: en
permalink: /notes/vision-task-definition/
alt_url: /zh/notes/vision-task-definition/
math: true
---

A frequently reproduced diagram draws the agent loop in four segments: **perception → prediction ⇄ reasoning → action**, with an arrow feeding action back into perception. The question usually asked of it is: which segment do traditional computer vision tasks belong to?

The answer looks simple — perception. Making it hold up requires saying what "belong to" means, and then why this division keeps generating doubts about how "vision tasks" are defined. This note does both.

## 1. Read the diagram as a formal structure

The four boxes plus the return arrow map cleanly onto a POMDP:

| Box in the diagram | Mathematical role | What it does |
| --- | --- | --- |
| Perception | Observation model $e: \mathcal{I} \to \mathcal{S}$ | Compresses pixels into a readable state description |
| Prediction | Transition model $T: \mathcal{S} \times \mathcal{A} \to \Delta(\mathcal{S})$ | Gives a distribution over "what happens next" |
| Reasoning | Counterfactuals and planning over $T$ | Compares futures induced by different actions |
| Action | Policy $\pi: \mathcal{S} \to \mathcal{A}$ | Turns state into an action on the world |
| Return arrow | $a_t \to I_{t+1}$ | Decisions change the next observation |

Two details matter. **Prediction and reasoning are joined by a two-way arrow**, so there is an internal loop of conjecture, test, and revision. And **the bottom return arrow** means the whole system is fed by its own actions.

## 2. Traditional computer vision occupies only the first box

Definition: a traditional vision task is a **one-way, open-loop, offline** observation encoder. It maps an image to a description. There is no action $a$ in the middle, and no next state $s'$.

This is checkable, not rhetorical:

| Question | Traditional CV | What crossing the boundary requires |
| --- | --- | --- |
| Does the output contain "what happens next"? | No, only properties of the current frame | Transition models, video prediction |
| Does it support "what if"? | No, it fits correlations | Intervenable causal or dynamical models |
| Does it produce actions on the environment? | No, output goes to a human or a downstream module | Policy and actuators |
| Does a decision change the next input? | No: open-loop, offline, per-frame evaluation | Active perception, embodied loops |
| Is the objective task return? | No, it is label likelihood (cross-entropy, IoU, AP) | Reward and value functions |

All five answers are no. It sits squarely in perception: **an eye, not a brain, and not a hand.**

A sharper way to put it: traditional CV minimises the empirical risk of $P(y \mid I)$, while a closed-loop system solves $\arg\max_a \mathbb{E}[R \mid s]$. The first is statistical inference; the second is control.

## 3. Three bodies of work that look like they cross the boundary

1. **Optical flow, video prediction, trajectory forecasting, early action recognition.** These do implement $s \to s'$, but they predict the continuation of an observable, serve no decision, and have no counterfactual branch. They are a precursor to prediction, not a world model. The test is single: can it answer "what happens if I do $a$"?
2. **SLAM, multi-view geometry, NeRF and 3D reconstruction.** They output pose, structure, radiance — state estimation. That is the *interface* to a loop (it supplies $s$), but the loop is not closed: no action, no return.
3. **Active vision and embodied agents.** Only here is "where to look, and moving to look again" decided by a policy, so only here is the return arrow actually used. This is the one real bridge between traditional CV and action.

## 4. Why the definition of "a vision task" does not survive scrutiny

| # | Cause | Example |
| --- | --- | --- |
| 1 | Tasks are defined by **datasets**, not by problems | COCO detection and LVIS detection are not the same task; the IoU thresholds and NMS inside AP are part of the definition |
| 2 | **Ground truth is convention**, and conventions conflict | The same pixel has four different "correct" answers across semantic, part, amodal, and panoptic segmentation |
| 3 | Tasks are assumed to be **functions** but are conditional distributions | Shape under occlusion and monocular depth are genuinely underdetermined; one-to-many is collapsed to the mode |
| 4 | The task list is **historical accretion** without an ontology | MNIST → ImageNet → COCO → VQA: each step is "the previous gap plus a new dataset" |
| 5 | **The defining principle is misplaced**: tasks are derived backwards from what humans can annotate, not forwards from what is needed | Affordance, physical properties, and uncertainty have no standard task; some finely specified tasks have thin downstream use |

Cause 5 is the root; the first four are symptoms.

## 5. Construct validity: measuring something other than what is claimed

Every symptom converges on a measurement problem. Models can pass a test by exploiting spurious correlations (shortcut learning), and can exceed human accuracy on ImageNet while collapsing under distribution shift. The mapping being optimised is therefore not the capability the task name claims to measure.

This is a failure of **construct validity**: a benchmark is an operational definition, and the operational definition has been mistaken for the essential one. Traditional tasks are well defined *internally* — given a data distribution, an annotation protocol, and a metric, they are precise optimisation problems. Their vagueness is entirely *external*: whether they transfer, whether they correspond to a real capability, and where their boundaries lie.

## 6. A more workable replacement definition

Instead of asking "which vision tasks exist", ask "what does an agent need to know". Under that criterion there are only four kinds of task:

1. **State estimation**: $I \to \Delta(\mathcal{S})$, with calibrated uncertainty;
2. **Dynamics**: $(s, a) \to \Delta(\mathcal{S})$;
3. **Affordance**: $s \to 2^{\mathcal{A}}$, the set of actions the state permits;
4. **Value**: $s \to \mathbb{R}$, how good the state is.

Traditional CV covers less than half of the first. This also explains why the traditional task list looks diffuse: it projects a four-dimensional space through the lens of annotation cost, and projections distort.

## 7. Conclusion

> A traditional computer vision task can be characterised as the empirical fit of an observation model $e: I \to s$: the input is a frame or a short window, the output is a description of the current state, the objective is label likelihood rather than task return, and the protocol is offline, open-loop, and per-frame. It therefore performs perceptual encoding only within the loop "perception — prediction/reasoning — action": it carries no transition model and produces no action on the environment, so it does not close the loop. Identifying such tasks with "visual capability" mistakes an operational definition anchored in datasets and annotation protocols for a capability definition — which is precisely why the boundary of the field has stayed vague.

## References

- Marr, *Vision: A Computational Investigation into the Human Representation and Processing of Visual Information* (1982).
- Bertero, Poggio & Torre, [Ill-posed problems in early vision](https://scholar.google.fr/citations?view_op=view_citation&hl=ja&user=ngaTx78AAAAJ&citation_for_view=ngaTx78AAAAJ:u-x6o8ySG0sC), *Proceedings of the IEEE* (1988).
- Geirhos et al., [Shortcut learning in deep neural networks](https://ei.is.mpg.de/publications/geirhosetal20), *Nature Machine Intelligence* (2020).
- Raji et al., [AI and the Everything in the Whole Wide World Benchmark](https://export.arxiv.org/abs/2111.15366) (2021).
- Jacobs & Wallach, [Measurement and Fairness](https://export.arxiv.org/abs/1912.05511v2), FAccT (2021).
- Zamir et al., [Taskonomy: Disentangling Task Transfer Learning](https://openaccess.thecvf.com/content_cvpr_2018/html/Zamir_Taskonomy_Disentangling_Task_CVPR_2018_paper.html), CVPR (2018).
- Zhai et al., [A Large-scale Study of Representation Learning with the Visual Task Adaptation Benchmark](https://scholar.google.ru/scholar?cluster=2504838252241466889) (2019).
- LeCun, *A Path Towards Autonomous Machine Intelligence* (2022).

---

*In one sentence: traditional vision made "seeing" a measurable problem, and never asked what the seeing is for.*
