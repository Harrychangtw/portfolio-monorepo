---
title: "PATCH Dataset"
category: "Academic Research"
subcategory: "LLM Safety"
description: "PATCH is the first large-scale adversarial dataset for Traditional Chinese LLM safety evaluation, developed through my co-first author research. Using tailored adversarial methods, it enables effective TC safety classifiers through parameter-efficient fine-tuning."
imageUrl: "images/optimized/projects/2025_05_18_patch_dataset/titlecard.webp"
year: "2025"
date: "2025-05-18"
role: "Co-First Author"
pinned: 3
featured: true
locked: false
technologies: [PyTorch, HF Transformers, LoRA]
tooltip: "Co-first author EACL paper on the first large-scale safety dataset for Traditional Chinese."
---

Large Language Models have transformed how we interact with AI, yet ensuring their safety remains an ongoing challenge. This challenge becomes particularly acute for Traditional Chinese (TC), a language serving millions across Taiwan, Hong Kong, and global diaspora communities. Despite its widespread use, TC remains significantly under-resourced compared to Simplified Chinese, with a pronounced scarcity of dedicated safety evaluation resources. Existing multilingual safety mechanisms often fail to account for TC's unique linguistic characteristics and cultural nuances, leaving a critical gap in our ability to build robust safety systems for this language.

Today, I am excited to share my co-first author research: **PATCH (Prompt Assortment for Traditional Chinese Hazards)**, the first large-scale adversarial dataset specifically designed for Traditional Chinese safety evaluation. This work has been accepted to [EACL 2026 SRW (Non-Archival Track)](https://2026.eacl.org/program/srw-accepted/#:~:text=PATCH%20Dataset:%20Empowering%20Traditional%20Chinese%20Safety%20Classifiers%20for%20Lightweight%20LLM) and represents ongoing research that will be further refined and submitted to future venues. As this is a work in progress, the dataset and codebase are not yet publicly available, but will be released upon final publication.

### What is PATCH?

PATCH is a comprehensive safety evaluation resource containing over 820,000 prompts, including 231,924 unsafe prompts and 593,020 safe prompts. Unlike existing Chinese safety datasets that predominantly focus on Simplified Chinese or use evaluation formats unsuited for input classification, PATCH is purpose-built for training and evaluating Traditional Chinese safety classifiers.

The dataset is aligned with the [MLCommons hazard taxonomy](https://github.com/mlcommons/ailuminate), covering 13 distinct harm categories ranging from violent crimes to election misinformation. This standardized taxonomy ensures compatibility with existing safety frameworks like Llama Guard while enabling systematic evaluation across threat types.

### The PATCH Advantage

PATCH addresses critical limitations in existing TC safety resources through several key innovations:

1. **Scale and Diversity:** With over 230,000 unsafe prompts spanning 13 harm categories, PATCH provides sufficient data volume for robust classifier training. This scale far exceeds existing Chinese safety datasets, which typically contain only thousands of examples.

2. **Adversarial Sophistication:** The dataset incorporates two complementary generation strategies. PATCH-GPT provides baseline harmful prompts, while PATCH-RT employs an adapted [Rainbow Teaming](https://arxiv.org/abs/2402.16822) methodology to generate evasive, complex prompts that test classifier robustness against sophisticated attacks.

3. **Cultural and Linguistic Authenticity:** Rather than simply translating English datasets, PATCH incorporates TC-specific adversarial tactics, including phonetic Zhuyin scripts, regional sociopolitical references, and culturally informed attack vectors that would be missed by translation-based approaches.

4. **Human Validation:** A carefully curated human-annotated subset (PATCH-H) provides gold-standard evaluation data, authored from scratch by native TC speakers with NLP expertise.

---

### Dataset Construction: A Multi-Stage Pipeline

The PATCH dataset was constructed through a systematic pipeline combining automated generation with rigorous quality control.

![Distribution of unsafe samples within the PATCH dataset across 13 MLCommons harm categories and the two generation methods (PATCH-RT and PATCH-GPT).](images/optimized/projects/2025_05_18_patch_dataset/patch_distribution.webp)

#### Direct Harmful Prompt Generation (PATCH-GPT)

The foundational subset of unsafe examples was generated using GPT-3.5 and GPT-4 models, targeting each of the 13 harm categories defined in the MLCommons taxonomy. These prompts represent common, direct harmful requests and were augmented through automated paraphrasing to introduce variation in length and style.

#### Evasive Harmful Prompt Generation (PATCH-RT)

To complement baseline prompts with data testing robustness against sophisticated evasions, we developed a custom adversarial generation framework inspired by Rainbow Teaming's quality-diversity approach. This framework iteratively generates and refines prompts using LLMs in distinct roles: a Mutator generates variations targeting specific attack styles, a Judge evaluates effectiveness, and a Sub-mutator performs targeted refinements incorporating TC-specific elements.

The resulting PATCH-RT prompts often feature longer narratives, embedded instructions, or scenarios invoking fictionalized regional contexts designed to make harmful requests appear legitimate or to confuse safety systems.

#### Safe Content Adaptation

The safe portion originates from the [ChatGPT-Corpus](https://github.com/PlexPt/chatgpt-corpus), converted to Traditional Chinese using the [Fanhuaji](https://zhconvert.org/) tool. This tool performs not only character mapping but also adapts region-specific terminology and phrasing, ensuring linguistic and cultural authenticity relevant to TC-speaking communities.

---

### Validating Real-World Vulnerability

To demonstrate the practical relevance of PATCH, we evaluated a wide range of LLMs against our human-annotated PATCH-H subset. The results reveal significant vulnerabilities across the board.

![Attack Success Rate (ASR) of various LLMs on the 130 unsafe prompts from the human-annotated PATCH-H subset, spanning lightweight open-source models to large-scale proprietary systems.](images/optimized/projects/2025_05_18_patch_dataset/patch_asr.webp)

Attack Success Rates ranged from 13% to as high as 98%, demonstrating that even the most advanced models are susceptible to targeted TC adversarial inputs. This finding underscores the critical need for robust training and evaluation resources like PATCH.

---

### Fine-Tuning Strategies: Finding the Efficient Path

Using PATCH, we systematically evaluated different approaches for developing TC safety classifiers, comparing Llama Guard 3 1B, RoBERTa, and Longformer architectures under full fine-tuning, LoRA, and [Chat-Vector](https://arxiv.org/abs/2310.04799) methods.

#### Key Finding: LoRA Matches Full Fine-Tuning

The results demonstrate that parameter-efficient LoRA achieves classification performance comparable to full fine-tuning while dramatically reducing computational requirements.

![Traditional Chinese safety performance on the PATCH test set, comparing baseline Llama Guard 3 1B with models adapted using Full Fine-tuning, LoRA, and Chat-Vector methods.](images/optimized/projects/2025_05_18_patch_dataset/patch_main_result.webp)

The baseline Llama Guard 3 1B showed limited TC content moderation capability with an F1 score of 0.781 in zero-shot settings. In contrast, both full fine-tuning and LoRA achieved near-perfect classification with F1 scores exceeding 0.99. Notably, LoRA-tuned Llama Guard achieved an F1 of 0.996 with the highest overall recall of 0.999, accomplished with significantly reduced computational cost.

The Chat-Vector approach, which attempts to transfer capabilities through vector arithmetic without training, proved considerably less effective, highlighting the value of data-driven fine-tuning.

#### Robustness on Human-Authored Data

To validate that training on synthetic data translates to real-world robustness, we evaluated all models on the human-annotated PATCH-H subset.

![Performance on the human-annotated PATCH-H subset, showing models adapted on the synthetic PATCH dataset.](images/optimized/projects/2025_05_18_patch_dataset/patch_human_result.webp)

The LoRA-tuned Llama Guard 3 1B emerged as the top performer with an F1 score of 0.869 and remarkable recall of 0.946. This validates our synthetic data approach: training on the adversarial PATCH dataset equips models to handle the subtleties of human-authored inputs.

---

### A Surprising Bonus: Cross-Lingual Benefits

Perhaps the most intriguing finding was the cross-lingual generalization observed when evaluating PATCH-tuned models on an English safety benchmark.

![Cross-lingual English safety performance on models fine-tuned on the PATCH dataset.](images/optimized/projects/2025_05_18_patch_dataset/patch_crosslingual.webp)

The LoRA-tuned Llama Guard 3 1B significantly outperformed both the baseline and its fully fine-tuned counterpart on English data, achieving an F1 score of 0.950. Qualitative analysis reveals this improvement stems from correcting specific error types: LoRA reduced false positives on benign technical prompts and, more importantly, reduced false negatives on subtle harmful inputs using role-playing or obfuscation.

We hypothesize that LoRA's parameter-efficient updates allow the model to retain its broad English knowledge while learning more abstract safety principles from PATCH's nuanced adversarial examples, leading to enhanced cross-lingual robustness.

---

### Conclusion and Future Directions

PATCH represents a significant step toward addressing the safety alignment deficit for Traditional Chinese LLMs. Our experiments confirm that targeted fine-tuning yields substantial gains over baseline models, with parameter-efficient LoRA emerging as a highly practical approach for developing TC safety classifiers.

The dataset and associated code will be made publicly available upon final publication to facilitate further research. Future work will focus on expanding PATCH with real-world data, exploring alternative parameter-efficient techniques, and investigating the mechanisms behind cross-lingual safety transfer.

---

## Acknowledgments

I am deeply grateful to my co-first author, Chiung-Jui Chen, for his collaboration and dedication throughout this project. I also want to thank our advisor, Prof. Tsai, for his invaluable guidance and support. Finally, I appreciate the constructive feedback from our senior, AK, which helped provide writing suggestions and early mentorship that laid the foundation for this research.
