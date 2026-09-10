# 分享与还原

## 给不懂命令的人

发送「初音未来-星光演唱会-双击即看.zip」。解压并双击 HTML 即可，程序与人物图集已经内嵌；不需要启动服务器，也不需要联网。伴奏默认关闭，可在页面左上角自行开启。

## 给继续开发的人

分享整个 `miku-starlight/` 目录或 GitHub 仓库。进入目录后运行 `npm ci`、`npm run dev`。构建命令与文件说明见 README。

## 让 AI 从零重新制作

提供这些文件：

1. `RECREATE_PROMPT.md`：最终完整提示词。
2. `previews/live.png` 和 `previews/rehearsal.png`：夜间演出与白昼材质参考。
3. `public/assets/miku/miku-reference.png`：人物身份参考。
4. `public/assets/miku/miku-performance.png`：真实独立姿态动作底稿。
5. `public/assets/miku/PROVENANCE.md`：两次图像生成的完整提示词与导入说明。

复用源码、锁文件和素材能够准确恢复此版本。文字提示词用于重新制作相近效果，生成式结果可能存在差异。
