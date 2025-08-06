---
_schema: default
date: 2024-12-18
title: "为《铃芽之旅》场景重新配乐"
description: >- 
  为电影《铃芽之旅》精选场景重新配乐
tags: [原声带, 电影配乐, 管弦乐]
image: '/static/images/suzume_cover_1.webp'
---
{{< disclaimer-zh "铃芽之旅" >}}

作为大学最后一年作曲项目的一部分，在[为《葬送的芙莉莲》一集重新配乐](/zh/compositions/重配乐项目葬送的芙莉莲/)之后，我想挑战自己为高强度的场景配乐，而不是我更擅长的慢节奏、平和的场景。

由于没有直接的行业人脉，我选择为现有作品重新配乐，以此练习画面作曲，同时提高我使音乐与叙事和角色情感紧密契合的能力。

选择《铃芽之旅》的场景是因为我在影院首映后离场时感受到的强烈震撼。阵内一真和Robert Hoffman为这部电影创作的原创配乐结构精巧而优美。他们紧凑而不张扬的配乐方式让我深受启发，梦想有一天也能达到他们的技术水平。

我的目标从来不是超越原作曲家的作品，而是将其作为一个学习机会。为快节奏画面配乐是我之前练习不多的领域，因此这既是一次宝贵的学习，也是有趣的尝试。在创作自己的配乐时，我试图在模仿原作曲家方法的同时，创作出能达到相同根本目的的原创作品：通过紧密关联的配乐，让观众更深入地沉浸在震撼的视觉效果、故事情节和配音表演中。

# 技术流程
与[本项目的其他材料](/zh/blog/毕业设计项目/)一样，我使用AI音频分离工具来隔离对话和音效，使用的是[Bandit V2](https://github.com/kwatcharasupat/bandit-v2)模型，该模型基于专门使用电影片段的多语言[Divide and Remaster V3数据集](https://github.com/kwatcharasupat/divide-and-remaster-v3)训练。这个模型在我的用例中表现明显更好，能够生成分辨率更高、伪影少得多的结果。

## 收听配乐:
{{< soundcloud-playlist playlist="2057796114" background="/static/images/suzume_cover_1.webp" >}}

## 查看项目文件:
出于版权考虑，我不分发原始音频或视频。如果您想体验阵内和Hoffmann令人惊叹的原创配乐(我强烈推荐)，请支持官方发布。

以下是仅包含音乐的项目文件链接(不含对话或视频):

{{< jsdelivr-figure src="/static/images/suzume-project-1.webp" link="https://github.com/Brinsleym/Suzume/" target="_blank" />}}