---
title: "17 Studs Wide: A LEGO Fan Mount and the Case Against Outgrowing"
description: "A homeserver thermal problem solved with childhood tools. On the strange precision of LEGO, iterative design, and why growing up doesn't mean growing out of things."
imageUrl: "images/optimized/blogs/10-lego-mount/titlecard.webp"
date: "2026-03-12"
author: "Harry Chang"
tags: ["Hardware", "Homelab", "DIY"]
pinned: -1
locked: false
---

## The Coincidence

The FormD T1 is 135mm wide. Seventeen LEGO studs measure approximately 136mm. The difference is about one millimeter.

I didn't calculate this beforehand. I just grabbed a baseplate, held it against the case, and hoped for the best. The fit was so close to perfect that I stood there for a moment, slightly stunned, holding a children's toy against a machine I'd built to run ML experiments.

First: why did I need a fan mount at all?

### The Machine That Taught Me

I built the homeserver between late 2023 and early 2024. The immediate reason was practical: I'm part of my school's AI club, and we were trying to finish a full academic paper before graduation. Our school's 3080 Ti had 12GB of VRAM, which made running anything substantial an exercise in frustration. Even Q4 quantization wasn't enough for the multi-model adversarial framework I was building.
The RTX 3090 I bought secondhand had 24GB. The fins had a bit of rust. It worked perfectly.

Initially, I doubted whether the server would stay useful once the ML experiments wound down. I figured the cumulative cost of cloud compute would eventually justify the hardware, but I wasn't sure. Then something shifted. 

Having low-stakes access to real hardware changed how I learned. CLI fluency came from necessity, not tutorials. Grafana became a rabbit hole I fell into on a whim—I'd always wanted a task-manager-type dashboard, and suddenly I could just build one. Kernel panics stopped being terrifying and became puzzles. When I eventually needed to spin something up on runpod.io, the learning curve was already behind me.

There's a strange pressure that comes from owning hardware. You've already committed. The money is spent. So you use it, not because you have to, but because it's there, waiting. A captcha-solving bot I never would have attempted on cloud credits. Experiments with fan sensors that taught me more about Linux than any course. The server stopped being a tool for ML and became a playground. And playgrounds, it turns out, need proper cooling.

### Where Heat Goes to Stay

The FormD T1 is beautiful. Compact. Minimal. RGB-free. Everything I wanted in a case.

It is also, by design, a thermal challenge.

The sandwich layout splits the case into two halves. Motherboard and PSU on one side, GPU on the other. The GPU fans pull air in, but exhaust options are limited. A small CPU cooler. Some top ventilation. That's mostly it. The three 8-pin power cables running to my EVGA card basically block what little bottom exhaust exists.

I started with two entry-level Noctua fans on top. They were, to put it mildly, incredibly noisy. I switched to two Phanteks T30s. Better performance, much quieter. But the fundamental problem remained: heat accumulates at the bottom with nowhere to go.

GPU temps were hitting 80°C under load. The 8-pin connectors were getting warm in a way that felt dangerous, crammed against the bottom panel with no ventilation, slowly cooking. The bottom panel itself was uncomfortably hot to touch.

Something had to change.

### The Rubber Band Delusion

I have always been obsessed with flexible things. Rubber bands, springs, anything that bends and returns. In 2013, when everyone was making those little loom bracelets, I hoarded the leftover bands—not for bracelets, but because I was convinced they'd be useful for _something_.

13 years later, I found my something.

The first LEGO mount used rubber band tension to hold the original Noctua fans in place. The bands stretched between Technic beams, gripping the fan frames with what I assumed was elegant damping. I'd solved the problem with childhood materials and childhood leftovers. I felt like an engineer.

Then I turned the server on.

The oscillations were unbearable. Something about the rubber band tension interacted with the fan vibration to create a rhythmic hum that seemed designed to drive a person slowly insane. My "damping" theory was completely wrong; the bands were amplifying resonance, not absorbing it. I tried repositioning. I tried doubling up. I even tried straight-up double-sided tape, which worked briefly before failing spectacularly.

The frame went back into the parts bin. The problem remained unsolved. The bracelet rubber bands went back to being useless.

### What Actually Worked

The solution came from the parts bin, not from planning.

I was digging through old Technic sets looking for longer beams when I found a bag of rubber tires—the chunky ones from some vehicle set I’d forgotten about. I held one up to the T30 fan frame. The diameter was close. Too close to ignore. The current version uses those LEGO tires wedged between the T30 fan frames.

That's it. That's the entire mechanism.

The tires compress just enough to grip the plastic frames without over-tightening. The weight of the case itself keeps everything stable. No adhesives. No permanent modifications. The fans exhaust air from the bottom of the T1, creating circulation where none existed before.

![framed:](images/optimized/blogs/10-lego-mount/L1001290.webp)

GPU temperatures dropped from 80°C to an average of 61°C under load, maxing at 65°C. The aggressive fan curve I'd been running became unnecessary. The 8-pin connectors no longer felt like they were slowly cooking themselves.

Sometimes the elegant solution is the obvious one you couldn't see until you'd failed enough times to deserve it.

### The Accidental Platform

The mount started as just a fan holder. It didn't stay that way.

Behind my IKEA Alex drawers, there's a narrow gap. The LEGO frame, it turned out, fit perfectly. So I added an outer section that lets my router slide in, tucked away where it occupies almost no visible space. The router actually gets better airflow now. The bottom exhaust from the fans keeps the entire drawer area surprisingly cool.

![framed:](images/optimized/blogs/10-lego-mount/L1001286.webp)

After getting an Apple Watch, I added a charger mount to the front. The cable routes through the bottom of the LEGO structure and plugs directly into the motherboard for power. Now I drop the watch there before showering and pick it up charged afterward. Effortless.

![framed:](images/optimized/blogs/10-lego-mount/L1001285.webp)

None of this was planned. The fan mount became a router holder became a charging station. I stopped designing and started responding. The watch goes on before I shower. The router has better coverage than it did on the floor. The drawer stays cool.

### Other Bricks, Other Problems

This isn't my only functional LEGO build. Speaker stands with rubber band feet. A diffuser tray. Nothing elaborate.

![framed:](images/optimized/blogs/10-lego-mount/L1001288.webp)

![framed:](images/optimized/blogs/10-lego-mount/L1001284.webp)

People ask why I don't 3D print. The results would look cleaner. More "finished." But I like the visible studs. The obvious construction. Maybe that's rationalization. Maybe I just like building with bricks and everything else is justification I assembled afterward, stud by stud.

I've stopped trying to figure out the difference.

### One Millimeter

There's a pressure, somewhere between adolescence and adulthood, to put away childish things. To demonstrate maturity by abandoning the tools and toys that once mattered. LEGO becomes decoration or nostalgia at best, acceptable only in specific contexts: Teenage Engineering products, display shelves, gifts for hypothetical future children who may or may not care.

I never understood this. The same brain that enjoyed building as a child is the brain I use now. The problems changed. The curiosity didn't.

The fan mount is functional. It solves a real thermal problem with a real solution. The fact that the solution involves colorful plastic bricks from Denmark doesn't make it less valid. The narrative says I should have 3D printed this, or bought something purpose-built, or at minimum grown out of reaching for the parts bin I've had since I was eight.

The narrative can say whatever it wants.

My server runs cool. My watch charges while I shower. My router has better coverage than it did on the floor.

And none of it would exist if the case had been one millimeter wider.

I think about that gap sometimes. How many things almost fit but don't. How many childhood tools get put away because the adult problem seems one millimeter too far from what they were designed for.

The studs still show. The tires still grip. The server still hums.

One millimeter. That's all it took.

---

## Acknowledgments
- Title image: *Boy Building a House of Cards* by [Jean-Baptiste-Siméon Chardin](https://en.wikipedia.org/wiki/en:Jean_Sim%C3%A9on_Chardin), Public Domain, [Link](https://commons.wikimedia.org/w/index.php?curid=57787211). Like the boy carefully balancing his cards, this build is a reminder that the simple tools of childhood can still be used to construct elegant solutions for adult problems.
- Case: FormD T1, which I still think is one of the most beautiful SFF cases ever made
- Fans: Phanteks T30, worth every millimeter of thickness
- LEGO: Various Technic pieces and one surprisingly load-bearing set of tires
- Full [Setup](/uses), where the LEGO mount now has a permanent entry