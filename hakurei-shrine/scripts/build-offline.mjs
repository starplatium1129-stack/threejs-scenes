import { build } from 'vite';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const image = await readFile(resolve(root, 'public/assets/reimu/reimu-reference-v1.png'));
const motion = await readFile(resolve(root, 'public/assets/reimu/reimu-motion-v2.png'));
const result = await build({
 root,
 configFile: false,
 publicDir: false,
 define: { __REIMU_REFERENCE__: JSON.stringify(`data:image/png;base64,${image.toString('base64')}`), __REIMU_MOTION__: JSON.stringify(`data:image/png;base64,${motion.toString('base64')}`) },
 build: {
  write: false,
  target: 'es2022',
  sourcemap: false,
  rollupOptions: {
   input: resolve(root, 'src/main.js'),
   output: { inlineDynamicImports: true },
  },
 },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
if (outputs.length !== 1 || outputs[0].type !== 'chunk') throw new Error('Offline build must contain one self-contained JavaScript bundle.');
const code = outputs[0].code.replace(/<\/script/gi, '<\\/script');
const favicon = await readFile(resolve(root, 'public/favicon.svg'), 'utf8');
const template = await readFile(resolve(root, 'index.html'), 'utf8');
const html = template
 .replace('href="/favicon.svg"', `href="data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}"`)
 .replace('<script type="module" src="/src/main.js"></script>', () => `<script type="module">${code}</script>`);
const destination = resolve(root, 'offline');
await mkdir(destination, { recursive: true });
await writeFile(resolve(destination, '双击打开博丽神社.html'), html, 'utf8');
await writeFile(resolve(destination, '先读我.txt'), '\uFEFF博丽神社 · 免安装离线版\r\n\r\n1. 先把压缩包完整解压。\r\n2. 双击“ 双击打开博丽神社.html ”，即可在浏览器中观看。\r\n\r\n不需要安装 Node.js，不需要输入命令，也不需要联网。\r\n按住鼠标左键拖动旋转，滚轮缩放。触屏可拖动和双指缩放。\r\n左上角可切换白昼、夜晚或自动昼夜流转。\r\n\r\n建议使用较新的 Microsoft Edge 或 Google Chrome 浏览器。\r\n如果双击后打开的是文本编辑器，请右键 HTML 文件，选择“打开方式”，再选择浏览器。\r\n\r\nHTML 已包含程序和灵梦图片，可以单独转发该 HTML 文件。\r\n', 'utf8');
console.log(`Offline HTML ready: ${resolve(destination, '双击打开博丽神社.html')}`);

