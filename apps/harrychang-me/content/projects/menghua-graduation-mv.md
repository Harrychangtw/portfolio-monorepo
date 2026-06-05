---
title: "夢華: Graduation Song MV"
category: "Video Production"
subcategory: "Music Video"
description: "Sole cinematographer and editor for 夢華, the official graduation song MV for Chingshin's Class of 2026, shot and cut in under a month and screened at the graduation ceremony."
imageUrl: "images/optimized/projects/menghua/titlecard.webp"
year: "2026"
date: "2026-06-02"
role: "Cinematographer & Editor"
technologies: ["DaVinci Resolve", "Affinity"]
tooltip: "Shot and cut the Class of 2026 graduation song MV solo, in under a month."
pinned: 7
featured: true
---

![The full 4:43 video, screened at the Class of 2026 graduation ceremony](https://www.youtube.com/watch?v=vpzEcgt6bNY)

## Project Overview

夢華 is the official graduation song for Chingshin's fifth graduating class, sung live at the 2026 ceremony with the music video screened the same day (06/02). I joined at the start of May as the sole cinematographer and editor, responsible for shooting and post-production, and explicitly not for logistics, casting, or props beyond the initial scheduling. The film runs 4:43 across 68 shots. Shooting wrapped on 05/28 against a 05/31 delivery deadline, all of it inside a single month while both leads were juggling collage applications and interviews. There is no director credit. Nicole wrote the script and owned the vision; I made shot-level directorial calls in execution.

## Concept & Why It Was Tractable

The film runs on a memory-and-present structure. Nicole returns to an emptied-out campus to retrace her senior year, leaving a flower in each space she remembers, and the remembered scenes surface as degraded, VHS-era footage against a clean present-day look. The script came to me finished, and I kept it that way, clarifying only what would be hard to shoot rather than rewriting.

What made it feasible in under a month came down to four things. The script was done before I arrived, so there was no writing limbo eating into the schedule. A music video needs almost no sound design beyond the intro dialogue, which removed an entire workstream. A short runtime means short shooting and short post. And both leads had already over-invested before I joined, recording in-studio and tuning the track daily, which made me accountable to them and them genuinely invested in cooperating with the shoot.

## Production Process

**Scheduling around weather.** With shoot days scattered across two weeks and quite a few scenes outdoors, the schedule had to bend to the forecast, not the other way around. I built a shared Google Calendar, mapped each scene's lighting needs against the Wenshan-district forecast, and exported the plan as an .ics for the team with Claude. The only scene I deliberately built around golden hour was the closing classroom; everything else was scheduled to stay usable under shifting light, with indoor scenes held in reserve as rain backups.

**Editing while still shooting.** Post ran concurrently with production, so I needed a scaffold before the footage existed. Using the gear list, the script, lyric .srt and Claude, a rough shot-timing .srt was built as a placeholder timeline, then filled and reshot against it as real shots came in. The cut is restrained by choice: almost entirely hard cuts, with only a handful of cross-dissolves. The film does its work through framing and color, not transitions.

**Two looks, one school.** The memory-and-present split is carried by the grade. Remembered scenes use a VHS treatment with color noise, faint scanlines, and soft defocus; present-day scenes use a clinical look with subtle film effects like halation. This took more iteration than anything else in the grade.

![framed:compare:The VHS-treated memory grade (left) against the clinical present-day grade (right).](images/optimized/projects/menghua/still-past.webp|images/optimized/projects/menghua/still-present.webp)

**The auditorium.** The centerpiece is one continuous move: the camera starts on Nicole alone, pans up to the projection screen, and pans back down to find every seat filled. The screen content had to be composited in. I had planned a manual play and pause that would need no compositing, but the timing made and slight camera shake that unworkable, and with no clean tracking frame a planar track would not hold. So I hand-keyframed 283 frames with corner positioners in Fusion, made harder by the top corners leaving frame on the pan-down, which meant estimating their positions. The match cut feeding that scene (the empty auditorium becoming the populated one) was shot on the Viltrox 75mm f/1.2 on the X-T5, roughly a 138mm equivalent field of view once the 1.5x APS-C and 1.23x video crops stack. Even with the tripod marked, the tight framing made the two takes hard to align, so I matched them using a 24-grid overlay and Resolve's Transform tool in its interactive on-screen pin mode.

![framed:283 hand-keyframed corner positioners. The seats fill while the camera pans, with no clean frame to track against.](images/optimized/projects/menghua/screen-comp-fusion.webp)

![framed:compare:The same framing, empty and full, matched on the marked tripod.](images/optimized/projects/menghua/matchcut-empty.webp|images/optimized/projects/menghua/matchcut-full.webp)

**Audio stems and the closing shot.** The leads mixed the track in BandLab, whose per-stem export will not burn in fader keyframes. To reference instrument timing against my cuts, I used Claude Code to write a small Chrome extension that steps through each stem, exports it as WAV, and stacks them in Resolve. The final film uses a single mixed track; the stems were purely for alignment. The closing shot, panning from the two leads writing on a whiteboard down to a laptop running BandLab, fought me hardest: we kept missing golden hour, and the laptop screen sent Fuji autofocus hunting. The take I thought was ruined got salvaged with Resolve Studio's Smooth Cut, an AI and optical-flow morph that smoothed about two seconds of focus hunting. We shot it at least fifteen times. The closing titles run over lyric slices in Faye's mother's handwriting, drafted on GoodNotes and cut up in Affinity.

![framed:Lyrics in Faye's mother's hand, sliced in Affinity for the closing titles.](images/optimized/projects/menghua/lyrics-affinity-comp.webp)

## Closing

What I did not expect, for something cut this fast, was how little of it I remember as a deadline. I have spent six years aiming a camera at this school as the backdrop to other people's events. 夢華 was the first time the building itself was the subject, and it's only possible because I was already half out the door.

The film is about returning to a place you are leaving and setting a flower down in each room you remember. On screening day it played to a full auditorium, the real one this time, and Nicole and Faye handed me a bouquet that morning. Fitting, for a film about leaving flowers behind, that it ended with one in my hands.

## Acknowledgments

Nicole (施羽真) and Faye (陳柏霏) sang and starred; Nicole also wrote the script and handled most of the actor coordination during shoots, and both recorded in-studio and tuned the track daily, giving fast feedback on every render. Raymond (陳炯睿) and Penny (陳品璇) ran production coordination and logistics, the booking, the actors, the props, the parts that never make it into a frame grab. Amber (韓語倢) co-wrote the lyrics, and Ryan (李禹謙) was the third vocalist. Faye's mother wrote the lyric calligraphy on GoodNotes that became the closing titles.
