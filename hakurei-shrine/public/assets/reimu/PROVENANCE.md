# 灵梦像素立绘底稿

此文件记录最初的人物身份底稿与旧版动作方法。当前版本采用独立姿态动作图，见 `MOTION_PROVENANCE.md` 与 `reimu-motion-v2.png`。

- 生成方式：内置 image_gen 图像生成功能。
- 原始生成图：`reimu-reference-v1.png`，保留透明通道。
- 游戏图集：`src/reimu-reference-atlas.js` 将底稿采样到 160×208 像素网格，整理透明边缘与颜色，并生成 12 帧小幅扫地、准备和落地动作。不是逐点手工临摹。
- 之前的程序手绘版本保留在 `src/reimu-art.js`，不再作为当前角色素材。

## 最终生成提示词

Use case: stylized-concept. Asset type: pixel-art character design reference for a Three.js miniature shrine game. Create ONE beautiful, polished, clearly readable full-body chibi Reimu Hakurei from Touhou, front view, standing with a traditional straw broom held diagonally at her right side, both hands gripping the wooden shaft. Genuine carefully crafted 16-bit Japanese pixel art with visible clean square pixels, approximately 96x128 logical pixels scaled up using nearest neighbor, no smoothing. Large expressive dark red eyes, cream skin, very long dark chestnut brown hair with elegantly layered bangs and two side locks tied with red-white hair tubes. Her signature very large vermilion red bow with detailed ivory zigzag frilled outer edges. Red sleeveless shrine maiden bodice with white crossed collar and small gold tie, detached wide white sleeves with red edging, flared red pleated skirt with white scalloped frills and restrained embroidered trim, white socks and red shoes. Cute 2.5-head-tall proportions, large beautiful head but fully visible body, calm focused expression. Rich but restrained brown-red shadow clusters, dark warm-brown single-pixel outlines rather than harsh black, 24-32 color palette. Two or three discrete shade steps per material. The hair silhouette, hands, broom, face, and costume must be unmistakably distinct. Entire bow, all hair, broom bristles and both feet fully within the image with generous padding. Single isolated character on a truly transparent background, no floor, no cast shadow, no scenery, no UI, no labels, no text, no watermark. This should look like a professional indie-game sprite, not a blocky geometric diagram or a smooth vector illustration.
