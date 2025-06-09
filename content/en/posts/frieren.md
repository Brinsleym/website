---
_schema: default
date: 2024-12-18
title: "Re-scoring: Sousou no Frieren"
description: >- 
  Re-scoring the soundtrack for the televised anime series, Sousou no Frieren (葬送のフリーレン)
tags:   [film score]
image: /images/frieren-1.jpg
draft: false
---


This project began as a creative exercise to deepen my understanding of scoring music for anime. Without direct industry connections, I chose to rescore an existing anime as a way to practice composing to picture while improving my ability to closely mirror music with the narrative and emotions of the characters. 

## Why "Sousou no Frieren"?

I selected Sousou no Frieren because of its exceptionally beautiful original score by Evan Call. From my first viewing, I was struck by how effectively Call's music accompanied the pensive and warm feeling that the storyline, voice acting and animation crafted.

My goal was never to surpass Call’s work, but rather to engage with it as a learning opportunity. I sought to emulate his approach while crafting an original composition that served the same fundamental purpose: to further immerse the audience in the stunning visuals, storyline and voice acting through a closely linked soundtrack.

## Technical Process

To isolate the dialogue and sound effects, I initially used the stem separation tool [Ultimate Vocal Remover](https://ultimatevocalremover.com), which offers a selection of models trained on separating music. Later on into the process, I discovered the model [Bandit V2](https://github.com/kwatcharasupat/bandit-v2), which is trained on the [Divide and Remaster V3 dataset](https://github.com/kwatcharasupat/divide-and-remaster-v3), a dataset specifically using clips of film, and was multilingual. This model proved significantly better results for my use case, and was able to produce much higher resolution results with significantly less artifacting.  

I used AI to separate the dialogue and music, using the free and opensource project [Ultimate Vocal Remover](https://ultimatevocalremover.com). While this is a tool designed for stem seperation, it also worked extremely well to seperate the speech, sound effects, and music from film.
After seperating all the elements I was ready to watch the episode with only its dialogue and sound effects.
Once I had a clean version of the episode without its original score, I began composing my own music to fit the scenes.

{{< frieren_disclaimer >}}



## View the project files:
To respect copyright, I am not distributing the original audio or video. If you wish to experience Evan Call’s stunning original score (which I highly recommend), please support the official release.

Below, you’ll find a link to my music-only files (no dialogue or video included):

![](/images/frieren-project-1.jpg)

{{< figure src="/images/frieren-project-1.jpg" link="https://github.com/Brinsleym/Frieren/" target="_blank" >}}