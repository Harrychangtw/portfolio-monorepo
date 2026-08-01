---
title: "SITCON Camp 2026 ML Course"
category: "Teaching"
subcategory: "Curriculum & Courseware"
description: "A three-hour course tracing MLP → RNN → Transformer for high-schoolers, taught entirely through interactive web stations I designed and built, backed by a GPU inference server running real Qwen models."
imageUrl: "images/optimized/projects/sitcon-camp-2026/titlecard.webp"
year: "2026"
date: "2026-07-10"
role: "Instructor, Designer & Developer"
technologies: ["React", "TypeScript", "PyTorch", "FastAPI"]
tooltip: "Designed, built and taught the ML course at SITCON Camp 2026."
featured: true
pinned: 2
---

## Project Overview

SITCON is Taiwan's largest student developer conference, and I had spoken at its annual event twice, on [RAG in 2025](./2025_03_08_sitcon_keynote) and on [prompt injection in 2026](./sitcon-2026). SITCON Camp is its summer camp arm, and this time I was on the other side of the room. I designed, built, and taught the afternoon machine learning track: a three-hour course titled _How does a machine read a sentence? The evolution from MLP to Transformer_, delivered on July 10, 2026.

The unusual part is that the course has almost no slides-and-listen segments. The lesson lives inside six interactive **stations**, browser canvases the students poke at, and the [entire thing](https://github.com/Harrychangtw/sitcon-camp-2026-ml) went from empty repo to camp day in seventeen days.

---

## Teaching Design: Make Them Hit the Wall First

I built the whole course on one loop: **give a problem → let them fumble → let them get a decent result → make the problem harder → the new concept shows up as the thing that saves them.** Nothing is introduced as a definition. Every architecture arrives because the previous one visibly broke.

Two constraints followed. First, **no Colab**: in a notebook, students hand the exercise straight to an AI agent and the pacing collapses. Second, **the environment is the guidance**, so the interface itself should push a student toward the insight rather than me narrating it from the front. Students walk the stations in order, and I gate them from a control terminal so nobody runs ahead.

**Tokenizer.** Type a sentence, watch it shatter. Character, word, and BPE splitting side by side make the point that the model never sees characters, only tokens.

![The Tokenizer station: a sentence split into 46 colored tokens with their vocabulary IDs, and a control dock for switching between character, word, and BPE segmentation.](images/optimized/projects/sitcon-camp-2026/station-tokenizer.webp)

**Embedding.** A shared Chinese-English semantic space, free to roam in 2D or 3D. Type any word and it flies to its neighbors. The station closes on the `man:king :: woman:?` bias example, which lands harder after ten minutes of the space feeling neutral and mathematical.

![Searching a word in the embedding space and watching its nearest neighbors resolve.](images/optimized/projects/sitcon-camp-2026/clip-embedding-search.mp4)

**Pixel Shuffle.** The wall that motivates everything after it. I ask the class to bet: if every pixel of every CIFAR-10 image moves by one fixed permutation π, can the MLP they trained that morning, in the session taught by my longtime mentor Andrew Kuo, still learn? Most say no. Two identical MLPs then train side by side in the browser, one on real pixels and one on shuffled, and the loss curves lie exactly on top of each other. To an MLP a pixel's position is only a wire number, and the same is true of word order. The architecture has no assumption that order means anything.

![The Pixel Shuffle station: two identical MLPs training in lockstep on original and permuted CIFAR-10 images, their loss curves overlapping exactly and their class probabilities identical.](images/optimized/projects/sitcon-camp-2026/station-pixel-shuffle.webp)

**Next Token.** Students play the model at its own game, guessing the next word before the distribution is revealed and widening the visible context until "seeing more means guessing better" is obvious.

![The next-token station: the model's top-8 candidate tokens with probabilities, alongside a guess-before-you-reveal game and controls for context window, sampling strategy, temperature, and top-k.](images/optimized/projects/sitcon-camp-2026/station-next-token.webp)

**RNN.** A hidden state animated flowing down a sequence, carrying memory forward one token at a time. The station then exposes the two walls that motivate the last step: long contexts get diluted, and training goes unstable.

**Transformer.** The station the rest of the course exists to earn. One sentence flows left to right across the whole screen, from tokenizer to embedding to a live self-attention matrix to the output distribution, and every stage is the real `Qwen3-0.6B`, not an illustration. Students type their own sentence, then drag across a 28 × 16 grid of layers and heads and watch the attention pattern reorganize under their cursor. Attention stops being a diagram from a paper and becomes something with a texture you can hunt through.

![Typing a custom sentence into the Transformer station and dragging across the layer × head grid to watch real attention recompute on the GPU.](images/optimized/projects/sitcon-camp-2026/clip-transformer-attention.mp4)

Outside the gated line sits a **panorama** section of ungated side quests, there to show that ML is larger than the one thread we spent three hours pulling: LoRA persona adapters, diffusion image generation, feature steering, text-to-3D, a self-play RL arena, and Skyfall-GS growing a flyable city out of satellite imagery.

---

## The Deck

The slides carry the arc between stations, and for once they aren't Affinity plus Keynote. The deck is **Marp**, plain markdown compiled to HTML, because a course deck gets rewritten hourly in the last week and re-exporting 4K slices by hand would have killed it. To keep it from looking generic I reverse-engineered the visual language of my own [SITCON 2026 talk](./sitcon-2026) into a written design system and reimplemented it as a Marp theme. Every figure comes out of one of nineteen Python scripts, so a changed number is a re-run rather than a redraw.

[Read the deck](https://harrychang.me/slides/sitcon-camp-26-ml-course2)

---

## How It's Built

The governing rule is that **the browser never trains.** A Python pipeline does the heavy compute ahead of time and exports small JSON and ONNX artifacts; the stations replay them or run light inference. Pixel Shuffle is the single deliberate exception, training its two toy networks live in a Web Worker, because replaying a baked curve would gut the lesson. The frontend is a pnpm/Turborepo monorepo: a Next.js shell, a Vite SPA holding the stations, and three shared packages for layout, visualization primitives, and artifact loading.

The interesting problem was **custom input**. A student who can only run my five preset sentences isn't exploring, so a FastAPI service runs the same models the pipeline uses (`Qwen3-0.6B` for next-token distributions and real attention, `Qwen3-Embedding-0.6B` for the semantic space) and answers whatever anyone types. Both sides call the same helper code under a documented determinism contract of float32, eager attention, no sampling, and rounded exports, so a preset prompt typed live reproduces its shipped values exactly.

Two failure modes mattered more than single-request latency. **Nothing may trap the class:** if the server is down, unreachable, or rate-limiting, every station falls back to its precomputed artifacts and the lesson continues. And **it has to survive fifty people pressing the same button.** A single process serializes GPU work behind a lock, so a synchronized burst on the attention route sat at a 2.45s median, long enough to lose the room; four unmodified copies of the app, one pinned per V100 card, behind a Caddy proxy balancing on in-flight request count brought that to 0.46s. Around all of it sits the classroom machinery: per-student accounts, a control terminal that can lock every screen or jump the room to one station, server-verified quests, and a team leaderboard that ranks squads publicly while keeping individual scores private.

---

## How It Went

The infrastructure was the least interesting part of camp day, which is the best thing I can say about it. Grafana never spiked once and GPU utilization sat surprisingly low all afternoon, so the scale-out turned out to be insurance I never had to cash.

Pixel Shuffle is the one I would redo. We were running slightly behind by the time we reached it, so the station collapsed into me demoing rather than the class betting first and watching itself be wrong. The content survived; the mechanism that makes it stick did not. "Make them hit the wall first" is a schedule commitment as much as a design one, because the moment you are short on time, the part you cut is the part that was doing the teaching.

The Transformer station is where it paid off. Students went hunting through the layer-by-head grid for previous-token heads and found them, and a few arrived at confident wrong readings of what a head was doing, which were worth more to the room than the correct answers because they were concrete enough to take apart in front of everyone. That was the whole bet of the course: give a fifteen-year-old a real model with the lid off, and they will chase a question they arrived at themselves much further than one I handed them.

---

## Acknowledgments

Thank you to Andrew Kuo, who taught the morning session my afternoon was built to continue, and to the SITCON Camp 2026 organizing team for the trust to build the track from scratch. Thanks also to the team who stress-tested the stations before camp day and caught failure modes I couldn't have found alone, and to Jie-Ying Lee, a fellow speaker at the camp, whose Skyfall-GS work the satellite station is built on.
