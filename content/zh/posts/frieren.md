---
_schema: default
date: 2024-12-18
title: "重配乐项目：《葬送的芙莉莲》"
description: >- 
  为电视动画系列《葬送的芙莉莲》重新创作配乐
tags:   [原声带, 影视配乐, 交响乐]
image: '/static/images/frieren-1.jpg'
draft: false
---
{{< disclaimer-zh "葬送的芙莉莲" >}}

这个项目最初是为了加深我对动漫配乐理解而进行的创作练习，同时也是我本科毕业作曲作品集的一部分。由于没有行业内的直接资源，我选择通过为现有作品重新配乐来练习画面配乐创作，同时提升音乐与角色情感、故事情节紧密契合的能力。

## 为什么选择《葬送的芙莉莲》？

我选择《葬送的芙莉莲》是因为Evan Call创作的原创配乐实在太出色了。第一次观看时，我就被音乐如何完美地衬托出故事、配音和动画所营造的那种沉思而温暖的氛围所震撼。

我的目标从来不是超越Call的作品，而是将其作为学习的机会。我尝试模仿他的创作手法，同时创作出具有相同核心目的的原创作品：通过紧密关联的配乐，让观众更深入地沉浸在精美的画面、故事情节和配音表演中。

## 技术实现过程

为了分离对白和音效，我最初使用了音轨分离工具[Ultimate Vocal Remover](https://ultimatevocalremover.com)，该工具提供了多个专门用于音乐分离的训练模型。在制作过程中，我发现了[Bandit V2](https://github.com/kwatcharasupat/bandit-v2)模型，它基于[Divide and Remaster V3数据集](https://github.com/kwatcharasupat/divide-and-remaster-v3)训练，这是一个专门使用电影片段的多语言数据集。这个模型在我的使用场景中表现显著更好，能够生成更高分辨率的音频，同时大幅减少了伪影。

## 试听配乐：
{{< soundcloud-playlist playlist="2034380025" background="/static/images/frieren-1.jpg" >}}

## 查看项目文件：
出于版权考虑，我不会分发原始音频或视频。如果你想体验Evan Call令人惊叹的原创配乐（我强烈推荐），请支持官方发行版本。

以下是仅包含音乐的文件链接（不含对白或视频）：
{{< figure src="/static/images/frieren-project-1.jpg" link="https://github.com/Brinsleym/Frieren/" target="_blank" >}}