# 灵梦动作第二版

使用内置 image_gen，以 reimu-reference-v1.png 为人物身份参考生成 reimu-motion-v2.png。这是一张 4 列 × 3 行、包含真实姿态变化的 12 帧动作底稿，不是对原立绘做横向扭曲。

运行时 src/reimu-pose-atlas.js 清理与外边界相连的中性棋盘底，按测量后的分格裁切、统一缩放和鞋底对齐，输出 272×208 像素单帧的透明图集。内部白色衣料保留，源底稿保留生成器原样。

动作采用非均匀节奏：准备、伸出、落帚、拉扫、收势、抬帚、回收、复位；仅贴地拉扫推动花瓣。另有放松、下蹲、腾空、落地姿态和短转身。

## 动作生成完整提示词

Use case: identity-preserve. The attached image is the CHARACTER IDENTITY AND PIXEL ART STYLE REFERENCE. Create a production-ready animation sprite sheet of this exact chibi Reimu Hakurei, preserving her face, hair, costume, red-white bow, shoes, broom, high quality pixel-art rendering and colours. Output one landscape transparent PNG, exactly 4 equally spaced columns and 3 equally spaced rows (12 cells total), no labels or grid lines. Each cell contains exactly ONE full-body character, centered at the SAME SCALE with her shoe soles aligned to the SAME relative baseline. Use generous empty padding on all sides of every cell, the entire broom must remain inside each cell. Camera front three-quarter view facing screen right consistently throughout every frame. NO backgrounds, cast shadows, dust clouds or repeated ghost limbs.
Row 1 cells left-to-right: (1) ready to sweep: broom angled slightly right, hands near torso; (2) reach: both arms extend, broom head farther to screen right just above floor, torso starts leaning; (3) plant: bristles contact the floor far right, knees softly bent, gaze down; (4) power sweep: pull bristles leftwards toward feet, shoulders follow, sleeves visibly change shape.
Row 2 cells left-to-right: (5) follow-through: broom head swept past the feet to screen left, torso subtly leans left and long hair lags right; (6) lift: lift broom head slightly, arms begin bringing broom back; (7) recovery: broom returns toward screen right, torso straightens and hair settles; (8) settle: near starting pose with small natural shoulder recovery. These 8 poses are a coherent sweeping loop. DIFFERENT actual arm poses and broom angles are essential; do not just copy the same pose eight times.
Row 3 cells left-to-right: (9) idle with broom held nearly upright at her right side, relaxed arms and eyes; (10) anticipation crouch, knees clearly bent and body lowered, holds broom closer to chest; (11) airborne hop pose, knees tucked slightly and toes point down, hair, bow and skirt lag upward, broom tucked diagonally beside body; (12) landing absorption, knees bent, torso compressed a little and skirt settling, broom held safely to side.
The exact same young chibi character appears twelve times, not twelve redesigns. Detailed 16-bit-inspired pixel art with sharp pixel clusters and warm dark outlines. Full shoes and complete bow visible in all 12 cells. Keep the sprite scale and character center consistent, let pose height genuinely change in crouch and jump without enlarging the sprite. Flat neutral lighting compatible with runtime 3D scene lighting. Truly transparent background.

