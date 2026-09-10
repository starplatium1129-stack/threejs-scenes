# 博丽神社 · 幻想乡庭院

一个半写实三渲二的 Three.js 神社微缩场景。拖动旋转，滚轮或双指缩放；左上角可切换「昼夜流转 / 白昼 / 夜晚」。

最终项目已独立收纳在 `hakurei-shrine/`。完整复刻任务见 [RECREATE_PROMPT.md](RECREATE_PROMPT.md)，运行与分享步骤见 [SHARING.md](SHARING.md)。

![最终效果](previews/final-scene.png)

![最终夜景](previews/final-night.png)

主建筑采用高挑曲面瓦顶与独立入口门廊，粉色樱花、黄绿树冠和成片草地形成分组绿化。昼夜系统包含渐变远山背景、星月、冷月光、纸窗暖光和庭院灯光，双击离线版同样可用。

角色动作预览：`previews/reimu-motion.webm`。该视频录自实际运行场景。

## 本地运行

**免命令观看：** 双击 `offline/双击打开博丽神社.html`。无需安装依赖，支持离线。下面的命令仅供继续开发时使用。

```sh
npm install
npm run dev
```

打开终端显示的本地网址。`npm run build` 生成可部署的 `dist/`，`npm run preview` 预览构建结果。

## 场景

包含带圆角的石砌与木夹层方形底座、朱红神社与曲线瓦顶、门窗格栅、回廊、赛钱箱、铃绳、注连绳与纸垂、鸟居、石灯笼、参道、手水舍、绘马和御神签架、告示牌、社务所、木桶与清扫工具、樱花树、灌木和散落花瓣。采用分阶卡通光照和实时柔和阴影。

灵梦使用 image_gen 生成的人物身份底稿和独立姿态动作图，整理为 272×208 像素单帧、12 帧透明图集。扫地有伸出、落帚、拉扫、收势与回收的非均匀节奏，仅贴地拉扫推动花瓣。四轮后收帚、短转身、下蹲，再腾空、落地吸收、起身换位；地面阴影随高度缩放与淡出。

## 文件

- `src/main.js`：场景构建、光照、相机、庭院动态。
- `src/reimu.js`：像素图集、角色状态机、花瓣交互和地面阴影。
- `src/reimu-pose-atlas.js`：当前独立姿态图集导入、透明背景整理和脚底对齐；旧版立绘变形保留在 `src/reimu-reference-atlas.js`，不再用于当前角色。
- `src/surface-detail.js`：本地生成的木纹、石纹与细微材质起伏。
- `src/garden-detail.js`：碎石、苔痕、柱脚金属件、雨链、柴堆和水面涟漪。
- `src/anime-material.js`：半写实 PBR 材质与柔和分段漫反射，保留动漫明暗层次。
- `src/botanical.js`：细枝、独立叶片、五瓣花簇与自然灌木。
- `src/architectural-finish.js`：檐下支撑、踏步收边、排水槽、矿物层理岩石与草簇。
- `src/ground-vegetation.js`：密植草地、蕨类和野花，保留参道、设施及灵梦活动路线的空隙；草叶带有轻微风动。
- `src/sky-cycle.js`：昼夜切换 UI、自动流转、远山星月、环境光和窗灯照明。
- `tests/scene.spec.js`：渲染、旋转缩放、完整动作周期、脚底高度和移动端尺寸检查。

运行 `npx playwright test` 验证场景（默认使用 Microsoft Edge，可在配置中改为已安装的浏览器）。所有场景几何在本地生成；角色生成底稿及提示词保存在 `public/assets/reimu/`，运行时不依赖外部素材服务。


