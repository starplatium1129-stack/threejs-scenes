# 分享与恢复

## 不懂命令：双击即可观看

使用 `博丽神社-双击即看.zip`，完整解压后双击 **双击打开博丽神社.html**。

不需要安装 Node.js，不需要命令行或联网。程序和角色图片已全部嵌入 HTML，也可以只分享该 HTML 文件。建议使用较新的 Edge 或 Chrome；若默认打开为文本编辑器，右键文件选择浏览器打开。

完整源码分享包中同样带有 `offline/` 文件夹，打开其中的 HTML 即可。

开发者修改源码后运行 `npm run build:offline`，即可重新生成双击版。

## 直接运行这份最终版

解压分享包，在 `hakurei-shrine` 目录打开终端：

```sh
npm ci
npm run dev
```

打开终端显示的网址。请使用 Node.js 20.19+ 或 22.12+ 的现代版本。`npm ci` 根据锁文件安装与本项目一致的依赖。

构建静态网页：

```sh
npm run build
npm run preview
```

生成的 `dist` 可以部署到静态托管服务。项目中的角色原图位于 `public/assets/reimu/`，运行时不需要图像生成账号。

## 让 AI 从零制作相近效果

把以下五个文件一起提供给 AI：

1. `RECREATE_PROMPT.md`：复制其中「完整提示词」。
2. `previews/final-scene.png`：最终整体视觉参考。
3. `public/assets/reimu/reimu-reference-v1.png`：灵梦角色底稿，建议复用以避免人物漂移。
4. `previews/final-night.png`：夜景、窗内暖光与月色的最终参考。
5. `public/assets/reimu/reimu-motion-v2.png`：独立姿态动作底稿，导入说明和提示词见 `MOTION_PROVENANCE.md`。

角色的原始图像生成提示词保存在 `public/assets/reimu/PROVENANCE.md`。

如果目标是准确还原当前效果，直接分享源代码与素材；完整提示词用于重新制作，不能保证随机生成结果完全相同。

## 分享包内容

包含源码、测试、配置、锁文件、说明、完整提示词、角色原图、最终白昼/夜景预览与离线 HTML。不包含依赖目录、普通构建产物、缓存或历史截图。

自动验证命令为 `npx playwright test`，默认使用已安装的 Microsoft Edge。使用其他操作系统时可在 `playwright.config.js` 中调整浏览器配置。
