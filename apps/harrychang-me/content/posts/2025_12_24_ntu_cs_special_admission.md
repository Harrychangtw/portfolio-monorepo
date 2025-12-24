---
title: "An Unconventional Path: Admitted to NTU CSIE via Special Talent Admission"
description: "When online resources are scarce and everyone around you is a CTF or Olympiad prodigy, this is a story about finding your own lane and believing that being different has value. For anyone curious about NTU CSIE's special admission, or lost on their own path."
imageUrl: images/optimized/blogs/2025_12_24_ntu_cs_special_admission/titlecard.webp
date: 2025-12-24
author: Harry Chang
tags: ["Admission", "Experience", "Reflection"]
pinned: -1
locked: false
---

> **Note:** This post was originally written in Traditional Chinese. For the best reading experience, consider the [Chinese version](https://www.harrychang.me/blog/2025_12_24_ntu_cs_special_admission_zh-tw).

## Finding the Signal in the Noise

The results are out. The outcome is good.

Final score: 91.25 for review, 95 for interview. I share these numbers not to boast, but as concrete proof that a non-traditional path can indeed be recognized.

Throughout my preparation for NTU CSIE's Special Talent Admission, I discovered that online experience shares were extraordinarily rare. The reference materials I could find amounted to maybe two or three posts. This scarcity of information made the path feel even more mysterious and unsettling than it needed to be. Facing this information desert, I felt suffocated. Writing this down is perhaps just a way to confirm that the path did, in fact, exist.

This isn't a strategic analysis teaching you how to get admitted. It's more of a process log. I hope my experience can provide some reference for future applicants, and more importantly, inspire the courage to dare to be different.

## Finding Gaps at the Feet of Giants

In the security community, prodigies are never in short supply. They might have started playing CTF in middle school, dominated major competitions in high school, and breezed through APCS with 5/5. I recognized a fact early on: **I am not that kind of person, and I cannot beat them.**

Rather than competing for minute odds within rules others had set, I chose another path: **Large Language Model Security.**

This choice was half born from curiosity about security issues that emerged while developing a campus RAG system, and half from an honest assessment of my own limitations. My math isn't strong enough to brute-force RL theory, and I don't have infinite H200s lying around to do scaling experiments. In a card game with limited resources, rather than challenging others on their home turf, I'd rather open a new table.

This path is narrow, new, and somewhat lonely. But precisely because of this, I could focus and dig deep in a relatively uncharted field.

## 480 Seconds in DerTien Hall

December 12th. DerTien Hall. I was the sixth to enter.

The room was smaller than I'd imagined, tables arranged in a U-shape. Directly across sat Professors Shih-Wei Li and Shang-Tse Chen. On the left sat Director Chu-Song Chen, his expression stern. There was none of the traditional security grilling I'd expected. The atmosphere felt closer to an AI research discussion.

To maximize this article's practical value, I've reconstructed those hundreds of seconds from memory. No embellishment, no filters.

---

### Two Minutes of Self-Definition

Good afternoon, professors. I'm Chi-Wei Chang from Chingshin High School. My core expertise lies in software engineering and addressing novel security threats in the AI era.

On the academic research front, I completed two papers on language model security as first author during high school.

I first identified the gap in Traditional Chinese within AI safety, building the first large-scale Traditional Chinese safety dataset, PATCH, and discovered cross-lingual generalization capabilities when combined with LoRA. This paper just received a recommendation for acceptance from ARR Meta Review yesterday and is expected to appear in EACL Findings.

Next, to address the high iteration costs of existing defense mechanisms, I proposed a tuning-free retrieval-based defense framework called FORTRESS, using a single instruction-tuned model to drive semantic retrieval and dynamic perplexity analysis. This paper has been published in TMLR.

Beyond research, I led the development of a fully customized campus RAG system without relying on monolithic frameworks like LangChain, which won the first prize at the National Science Council's GenAI Stars competition. It was precisely this development experience that made me aware of AI application security risks. Later, I shared this development journey at SITCON 2025. This talk caught the attention of CyCraft, who reached out and recruited me through a research scholarship. Currently, as their youngest research intern, I'm conducting automated attack taxonomy classification based on LLM attention heads.

Academically, I maintain a rank of fourth in my grade. For international communication and critical thinking, I achieved IELTS 8.5 and won championships in national English debate competitions including FHDO. I've also served as Student Council Vice President and development lead for the robotics team, demonstrating cross-disciplinary integration capabilities.

These are my accumulations through high school so far. I sincerely hope to enter NTU CSIE to cultivate a more comprehensive foundation and advance AI security from heuristics to theoretical validation. Thank you, professors.

### Architectural Debate on FORTRESS

**Professor Center-Right:** Can you explain what the TMLR paper does?

**Me:** The problem FORTRESS aims to solve is that attacks constantly evolve, but existing defense mechanisms rely on expensive fine-tuning. So I combined ideas from retrieval that I developed during RAG development, to see if a database could handle known attacks. And use token-level perplexity to handle newer attacks, possibly those using gradient optimization like GCG. The system also uses the attack category inferred from the database to set an optimal threshold for improved accuracy.

**Professor Center-Right:** What do you think could still be improved in FORTRESS?

**Me:** First would be multimodality, how to combine image semantics with text. Second, I'd want to enable the model to also do streaming moderation, like the recent Qwen3 Guard Stream that does moderation while outputting.

### The AAAI Video and a Stumble

**Professor Center-Left:** I saw you have an AAAI educational video. AAAI is quite a good conference. Could you share what the submission was about?

**Me:** (rushing to explain motivation) Because I normally enjoy video editing and sharing, when I saw AAAI was holding an educational video event, I thought I could combine my expertise with my current research content, using accessible methods or motion graphics to introduce language model security.

**Professor Center-Left:** What about the submission content itself?

**Me:** (course-correcting) The video content mainly starts by covering existing attacks, including roleplay and other jailbreak methods, then also covers existing defense mechanisms like SmoothLLM and Llama Guard, all integrated into a 3-minute video.

### On Independence and Guidance

**Professor Left:** I'm more curious about your interaction style with Professor Richard Tzong-Han Tsai at National Central University.

**Me:** During initial learning, I would self-study weekly, produce research on a topic, and report to the professor. The professor would then give feedback or ask questions.

**Professor Left:** Were these topics chosen by yourselves?

**Me:** The professor proposed a general direction, like model attention mechanisms. For paper writing, during PATCH research I would report progress to the professor weekly, and the professor would also give grammatical suggestions during our peer review. FORTRESS, however, I completed independently from topic conception to paper writing. The professor gave me considerable freedom on this paper, to which I'm very grateful. The professor's main involvement was guidance on my peer review responses and discussions when choosing to submit to TMLR.

### Examining PATCH and Data Generation

**Professor Center-Right:** Your PATCH dataset should be LLM-generated. Can you explain your generation architecture in detail?

**Me:** I was mainly responsible for the adversarial data generation architecture, based on Meta's Rainbow-Teaming. It primarily uses an iterative approach, with a Mutator doing variations in attack category and attack style, testing on Target, then having a Judge determine effectiveness. Before completing the iteration, BLEU Filtering and Semantic Filtering ensure diversity.

**Professor Center-Left:** You mentioned a 21% improvement above (referring to PATCH). Can you explain what this improvement means?

**Me:** Our baseline is Llama Guard 3 1B, a commonly used classifier in industry, responsible for determining whether an input is safe or unsafe. We mainly used FFT and LoRA training, achieving 21% improvement on the PATCH test set. But what's more surprising is that LoRA also improved 18% on English compared to the baseline that was already English-capable. (pausing, seeing no immediate questions) This generalization capability is mainly hypothesized to be because our dataset is quite broad, so the model may have developed a deeper understanding of safety.

**Professor Left:** LoRA has had subsequent developments. Have you followed up or used them?

**Me:** (this answer was rather ordinary, too passive) Yes, mainly I'm familiar with QLoRA. Also due to this paper's scope, we didn't use it. We mainly used full fine-tuning, LoRA, and Chat-Vector as our three methods, without using other more experimental approaches.

### The Blueprint for Next Steps

**Professor Center-Right:** Since you mentioned below wanting to join my lab, what directions do you think are still worth pursuing in security?

**Me:** I think security classification is the direction I want to head toward, and it's also what I'm currently doing in my CyCraft internship. I feel current attack classification tends to classify a prompt as either Prompt Injection or Jailbreak, but I think it's more of a superposition state. So I want to first find the "safety" heads within the model, and possibly through matrix decomposition calculate that a prompt is zero-point-something of this category, zero-point-something of another category, achieving more granular classification.

**Professor Center-Right:** (silent for a moment) Any questions you'd like to ask in the remaining time?

**Me:** Professor, let’s say this interview goes well. What categories of courses would you recommend I take? (bell rings right then)

**Professor Center-Right:** I teach some AI security courses.

**Me:** Great, thank you, professors! (walking out)

---

## Your Lane, Your Definition

This journey, rather than being about how to get admitted, is about how to find yourself.

Looking back, this path was full of uncertainty. When peers around me were dominating in CTF battlefields, I was far behind. Yet I threw myself into a relatively obscure field. This choice, initially a defense mechanism of my own limitations, later became my most distinctive mark.

Special Talent Admission has never had a standard answer. What it seeks is perhaps not the fastest runner on established tracks, but someone who carves out a new path and proves that path has value. Your projects, your research, any of your "distractions from proper work," so long as you genuinely invest passion and go deep enough, it can become your weapon.

This reflection is full of my personal biases, and an enormous amount of fortune. If your path differs from mine, please believe in your own version. Because ultimately, what convinces the professors isn't who you imitated, but the irreplaceable self you presented.

## Acknowledgments

This path felt solitary, but I never truly walked it alone. If this admission result holds any weight, it is only because I stood on the shoulders of these individuals:

* Thanks to **Professor Richard Tzong-Han Tsai** for nearly three years of patient guidance, lighting the first lamp on my long academic research journey.
* Thanks to **AK (senior)** for guidance during early development, countless paper reviews, and interview simulations. You were my most reliable support.
* Thanks to **CK** and **frozenkp** at CyCraft, and the entire team for giving me this precious opportunity, letting me see what research looks like when it lands in industry.
* Thanks to **Chingshin High School's Director Yi-Ping** and **Homeroom Teacher Wen-Ting**, who always provided maximum assistance and support when I needed it.
* Thanks to **my parents** for unconditionally trusting every seemingly crazy decision I made, letting me venture forth without worry.
* Thanks to **my friends**, especially for enduring my countless self-introduction bombardments before the interview.
* Finally, and most importantly, thanks to [**EM**](https://emtech.cc/p/srecruit-ntu/) and [**Grasping631**](https://hackmd.io/@Grasping631/Hy_PmOzPT) for sharing their experiences.

I hope this rough record of mine can also become a glimmer of light for some future explorer.

---

Title image: *Wanderer above the Sea of Fog* by [Caspar David Friedrich](https://en.wikipedia.org/wiki/en:Caspar_David_Friedrich), Public Domain, [Link](https://commons.wikimedia.org/w/index.php?curid=127245432)
