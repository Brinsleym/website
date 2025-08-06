---
_schema: default
date: 2024-12-18
title: "Re-scoring: Sousou no Frieren"
description: >- 
  Re-scoring the soundtrack to the second episode of the series Sousou no Frieren (葬送のフリーレン)
tags:   [soundtrack, film score, orchestral]
image: '/static/images/frieren-1.webp'
---
{{< disclaimer-en "Sousou no Frieren" >}}

This project began as a creative exercise to deepen my understanding of scoring music for anime, and was written as a part of my final-year undergraduate Composition Portfolio. Without any direct industry connections, I chose to re-score existing material as a way to practice composing to picture, while improving my ability to closely mirror music with the narrative and emotions of the characters. 

## Why Sousou no Frieren?

I selected Sousou no Frieren because of its exceptionally beautiful original score by Evan Call. From my first viewing, I was struck by how effectively Call's music accompanied the pensive and warm feeling that the storyline, voice acting and animation crafted.

My goal was never to surpass Call’s work, but rather to engage with it as a learning opportunity. I sought to emulate his approach while crafting an original composition that served the same fundamental purpose: to further immerse the audience in the stunning visuals, storyline and voice acting through a closely linked soundtrack.

## Technical Process

To isolate the dialogue and sound effects, I initially used the stem separation tool [Ultimate Vocal Remover](https://ultimatevocalremover.com), which offers a selection of models trained on separating music. Later on into the process, I discovered the model [Bandit V2](https://github.com/kwatcharasupat/bandit-v2), which is trained on the [Divide and Remaster V3 dataset](https://github.com/kwatcharasupat/divide-and-remaster-v3), a dataset specifically using clips of film, and was multilingual. This model proved significantly better results for my use case, and was able to produce much higher resolution results with significantly less artifacting.  

## Listen to the soundtrack:
{{< soundcloud-playlist playlist="2034380025" background="/static/images/frieren-1.webp" >}}

## View the project files:
To respect copyright, I am not distributing the original audio or video. If you wish to experience Evan Call’s stunning original score (which I highly recommend), please support the official release.

Below, you’ll find a link to my music-only project files (no dialogue or video included):

{{< jsdelivr-figure src="/static/images/frieren-project-1.webp" link="https://github.com/Brinsleym/Frieren/" target="_blank" />}}