---
title: "FORTRESS System"
category: "Academic Research"
subcategory: "LLM Safety"
description: "A technical overview of FORTRESS, a training-free LLM input safety classification system that leverages semantic querying and perplexity filtering, a solo first-author paper published in TMLR."
imageUrl: "images/optimized/projects/2025_07_04_fortress_system/titlecard.webp"
year: "2025"
date: "2025-07-04"
role: "First Author"
pinned: 1
featured: true
locked: true
tooltip: "Paper under review at TMLR"
---

The world of Large Language Models (LLMs) is in a constant state of flux. As models become more powerful, so do the methods used to attack them. For developers and researchers, ensuring LLM safety is a perpetual cat-and-mouse game. Existing safety classifiers often require resource-intensive fine-tuning, a computationally expensive approach that proves brittle against the constant stream of new attack methods and demands costly, time-consuming retraining cycles.

Today, I'm excited to introduce a new paradigm in LLM safety and my latest solo-author research paper published in TMLR: **FORTRESS**.

### What is FORTRESS?

FORTRESS (Fast, Orchestrated Tuning-free Retrieval Ensemble for Scalable Safety) is a state-of-the-art, **training-free** LLM input safety classification system. It overcomes the limitations of prior work by unifying semantic retrieval and dynamic perplexity analysis within a single, efficient pipeline. At its core, FORTRESS utilizes a single, lightweight instruction-tuned language model (like Gemma or Qwen) for both embedding generation and perplexity analysis, ensuring robust performance with minimal computational overhead.

This data-centric design means FORTRESS adapts to emerging threats through simple data ingestion rather than expensive model retraining, offering a practical, scalable, and robust approach to LLM safety.

### The FORTRESS Advantage

Compared to existing classifiers, FORTRESS offers a unique combination of scalability, efficiency, and leading performance.

1.  **Training-Free & Scalable:** LLM safety is a constantly evolving field. Existing methods struggle with novel attack techniques, and addressing such defense gaps requires compute-intensive retraining. In stark contrast, scaling FORTRESS is as simple as ingesting new data into its vector database with no other modifications needed. This approach not only results in robust defense against new attacks but also ensures minimal degradation in previous benchmarks.

2.  **Computationally Efficient:** The rise of lightweight language models has prompted the development of external safety guards that impose minimal overhead. FORTRESS uses models as small as 0.6B parameters and achieves competitive results with models way above its league. This makes it a fraction of the size of many competitors while delivering superior performance.

3.  **Leading Performance:** FORTRESS consistently outperforms existing models. Our top-performing configuration achieves an average **F1 unsafe score of 91.6%** across nine distinct safety benchmarks spanning languages and attack vectors, all while operating over **five times faster** than the previous leading fine-tuned classifier.

---

### How FORTRESS Works: An Architectural Deep Dive

FORTRESS employs a two-stage detection pipeline that combines complementary analysis techniques. A dynamic ensemble strategy then intelligently weighs these signals to produce a final classification.

![The FORTRESS system architecture, illustrating the Data Curation, Data Expansion, and Detection Pipeline stages. User input is processed by an LLM Engine to generate embeddings for a primary semantic search and log-probabilities for a secondary perplexity analysis. A dynamic ensemble strategy combines the outputs to produce a final verdict.](images/optimized/projects/2025_07_04_fortress_system/fortress_system_diagram.webp)

#### 1. Primary Detector: Semantic Retrieval

The first stage assesses the semantic similarity of a user's prompt against a curated vector database.

*   **Embedding Generation:** We use a single instruction-tuned LLM (e.g., Qwen, Gemma) to extract a dense vector embedding from the model's hidden states.

*   **Similarity Search:** A ChromaDB vector store performs a k-Nearest Neighbors search to retrieve the most semantically similar prompts from the database, forming an initial hypothesis about the query's safety.

#### 2. Secondary Analyzer: Dynamic Perplexity Analysis

The second stage evaluates the linguistic typicality of the query, a method that is particularly potent for detecting novel or zero-day attacks that may not exist in the vector database.

While perplexity-based detection isn't new, a core innovation of FORTRESS is its use of **dynamic, per-category perplexity thresholds**. Instead of a single global threshold, the analyzer's parameters are pre-calibrated for each of the 20 safe and unsafe categories (e.g., `s1_violent_crimes`, `content_creation`). This allows the system to tune its sensitivity to the distinct linguistic characteristics of each topic, resolving the classic dilemma where a single static threshold is too strict for creative content but too lenient for sophisticated attacks.

#### 3. Dynamic Ensemble Strategy

The final classification is determined by a weighted majority vote that intelligently combines the signals from the primary and secondary detectors. The strategy's key strength is its dynamic adjustment of weights based on the coherence of the retrieval results.

*   If the retrieved prompts are homogenous (e.g., all labeled `unsafe`), the system prioritizes the strong semantic signal.
*   If the retrieved prompts are conflicting, the system rebalances its weights to rely more heavily on the perplexity analysis.

This allows FORTRESS to be decisive when context is clear, while exercising greater caution when confronted with ambiguous or novel prompts.

---

### Putting it to the Test: Performance Breakdown

We conducted a series of comprehensive experiments, evaluating FORTRESS against state-of-the-art baselines across nine diverse public safety benchmarks.

#### Head-to-Head Comparison

FORTRESS demonstrates highly effective and efficient performance. Our top configuration, `FORTRESS Qwen 4B (Expanded)`, achieves an average F1 score of **91.6%**, outperforming the previous leading baseline, GuardReasoner 8B (86.3% Avg. F1), by over 5 percentage points while being over **5x faster**.


![Performance (F1) and latency comparison across nine benchmarks. FORTRESS achieves SOTA performance with significantly lower latency.](images/optimized/projects/2025_07_04_fortress_system/fortress_main_result.webp)

#### Scalability Through Data Ingestion

A core claim is that FORTRESS adapts via data, not retraining. We tested this by ingesting additional datasets into our vector database. As shown below, this simple data ingestion yields a significant and consistent performance uplift across all model families, boosting the average F1 score by up to 8 percentage points.


![Impact of data ingestion on F1 Unsafe score across key benchmarks. The Exp. (Expanded) configuration shows significant improvement over the Def. (Default) version.](images/optimized/projects/2025_07_04_fortress_system/fortress_expansion.webp)

This improvement is rooted in the improved structural coherence of the knowledge base. The visualization below shows how expanding the database transforms a sparse semantic space into one with dense, clearly delineated clusters, allowing for more accurate retrieval.

![A t-SNE visualization of the knowledge base before (Default Database, left) and after (Expanded Database, right) data ingestion. Each point is a prompt embedding, colored by its category.](images/optimized/projects/2025_07_04_fortress_system/fortress_kb_projection.webp)

Critically, this scalability comes with no performance penalty. Our analysis shows that performance steadily increases with knowledge base size, while latency remains stable or even slightly decreases.

![System latency (left) and F1 score (right) as a function of knowledge base size for the FORTRESS Gemma 1B (Expanded) model.](images/optimized/projects/2025_07_04_fortress_system/fortress_scalability.webp)

#### The Importance of Every Component: Ablation Study

To dissect the contribution of each component, we conducted a series of ablation studies. The results highlight the critical role of our novel design choices.

![Ablation study on the FORTRESS Gemma 1B (Expanded) model, showing the performance impact of removing key components.](images/optimized/projects/2025_07_04_fortress_system/fortress_ablation.webp)

The most compelling finding is the importance of **dynamic, per-category perplexity thresholds**. Removing this feature and using a single global threshold caused a catastrophic performance drop of **14.7 points** in the average F1 score. This proves that context-aware analysis is a cornerstone of FORTRESS's high accuracy. Furthermore, the results validate our use of an integrated instruction-tuned LLM, which outperforms pipelines using conventional, retrieval-only embedding models.

### Conclusion and Future Work

FORTRESS establishes a new paradigm for LLM security that is simultaneously robust, efficient, and perpetually adaptable. By integrating semantic retrieval with dynamic perplexity analysis in a training-free framework, it achieves state-of-the-art performance while remaining scalable and computationally lean.

Future work will focus on enhancing system autonomy by automating the discovery of new threat categories and exploring more sophisticated ensemble techniques. While the codebase is a proof of concept for now, we plan for its open-source release in the future to encourage further research and development in scalable LLM safety.
