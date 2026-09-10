// Hand-pixelled silhouettes on a 96×128 grid. Scanline rasterization deliberately
// avoids canvas antialiasing: every source pixel has a single colour and alpha.
export function createReimuAtlas() {
 const width = 96, height = 128, frames = 12;
 const canvas = document.createElement('canvas'); canvas.width = width * frames; canvas.height = height;
 const ctx = canvas.getContext('2d');
 const P = {
  outline: '#49302e', hairDeep: '#4f302b', hair: '#603a30', hairMid: '#724638', hairLight: '#885642', hairGlint: '#98664d',
  redDeep: '#822b32', red: '#bc3d40', redMid: '#d74c49', redLight: '#e96657',
  white: '#fff0d9', whiteLight: '#fff8e9', whiteShadow: '#d9c6b1', whiteDeep: '#b4a095',
  skin: '#f6d9b9', skinLight: '#ffe8cc', skinShade: '#e6b591', cheek: '#e7a799',
  eye: '#7c292e', iris: '#b5463d', gold: '#d9b667', wood: '#977046', woodDark: '#654a32', straw: '#c5a564', strawLight: '#e0c385',
 };
 for (let frame = 0; frame < frames; frame++) {
  const sweep = frame < 8 ? Math.round(Math.sin(frame * Math.PI / 4) * 5) : 0;
  const crouch = frame === 8 ? 4 : frame === 10 ? 2 : 0;
  const sway = frame === 2 || frame === 3 ? 1 : frame === 6 || frame === 7 ? -1 : 0;
  const fly = frame === 9;
  const rect = (x, y, w, h, color) => { ctx.fillStyle = P[color] || color; ctx.fillRect(frame * width + x, y + crouch, w, h); };
  const poly = (points, color) => {
   const min = Math.min(...points.map(p => p[1])), max = Math.max(...points.map(p => p[1]));
   for (let y = min; y < max; y++) {
    const intersections = [];
    for (let i = 0; i < points.length; i++) {
     const a = points[i], b = points[(i + 1) % points.length], scan = y + .5;
     if ((a[1] <= scan && b[1] > scan) || (b[1] <= scan && a[1] > scan)) intersections.push(a[0] + (scan - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) { const l = Math.ceil(intersections[i] - .5), r = Math.ceil(intersections[i + 1] - .5); rect(l, y, r - l, 1, color); }
   }
  };
  // Long hair behind the detached sleeves; individual pointed locks stay legible.
  poly([[25, 41], [65, 39], [72, 54], [70, 65], [76, 76], [74, 81], [79, 94], [76, 99], [73, 95], [73, 105], [64, 102], [60, 97], [32, 100], [24, 105], [19, 103], [22, 95], [16, 99], [16, 91], [21, 77], [20, 65]], 'outline');
  poly([[26, 44], [64, 43], [68, 63], [66, 76], [73, 88], [75, 97], [69, 93], [70, 100], [61, 96], [32, 96], [24, 101], [27, 89], [20, 94], [25, 78], [23, 64]], 'hair');
  poly([[26, 59], [31, 66], [28, 80], [24, 91], [24, 96], [21, 94], [24, 82]], 'hairMid');
  poly([[63, 64], [66, 64], [65, 76], [72, 91], [71, 96], [67, 86], [61, 76]], 'hairMid');
  poly([[29, 72], [33, 77], [29, 94], [27, 96]], 'hairLight');
  // Oversized bow, cream ruffled border, inset embroidery and folded scarlet cloth.
  const bow = (points, c) => poly(points.map(([x, y]) => [x, y + sway]), c);
  bow([[18, 8], [23, 6], [37, 12], [44, 20], [51, 20], [60, 12], [73, 6], [77, 8], [79, 14], [78, 19], [80, 23], [77, 30], [77, 35], [70, 38], [52, 29], [44, 29], [25, 38], [18, 34], [19, 29], [16, 25], [18, 20], [16, 15]], 'outline');
  bow([[20, 9], [24, 9], [27, 15], [25, 34], [21, 35], [20, 29], [19, 25], [21, 20], [19, 16]], 'white');
  bow([[73, 9], [76, 11], [75, 18], [77, 23], [75, 28], [75, 33], [71, 35], [69, 16]], 'white');
  bow([[25, 10], [36, 15], [45, 23], [44, 27], [27, 35]], 'red');
  bow([[70, 10], [60, 15], [51, 23], [52, 27], [70, 35]], 'redMid');
  bow([[28, 12], [37, 17], [41, 22], [29, 20]], 'redMid');
  bow([[29, 29], [43, 24], [44, 27], [28, 34]], 'redDeep');
  bow([[55, 25], [67, 26], [70, 33]], 'red');
  for (let y = 13; y < 31; y += 4) { rect(26 + (y % 8 ? 0 : 1), y + sway, 2, 2, 'white'); rect(69 - (y % 8 ? 0 : 1), y + sway, 2, 2, 'white'); }
  rect(43, 20 + sway, 10, 9, 'outline'); rect(45, 21 + sway, 6, 6, 'red'); rect(46, 21 + sway, 4, 2, 'redLight');
  // Small side ribbon tails peek out behind the head.
  poly([[21, 39], [15, 48], [12, 53], [20, 58], [29, 52], [69, 40], [76, 47], [82, 53], [74, 59], [66, 52]], 'outline');
  poly([[22, 40], [16, 48], [14, 52], [20, 55], [27, 51]], 'red');
  poly([[70, 42], [76, 49], [79, 53], [73, 56], [67, 51]], 'red');
  poly([[14, 51], [21, 54], [26, 50], [27, 52], [20, 57], [13, 53]], 'white');
  poly([[70, 53], [74, 55], [78, 51], [80, 53], [74, 58], [68, 54]], 'white');
  // Head silhouette and shaded face, with plenty of clear space around both eyes.
  poly([[34, 24], [56, 24], [67, 29], [73, 38], [74, 49], [71, 60], [63, 66], [54, 69], [36, 69], [26, 64], [20, 56], [19, 42], [24, 31]], 'outline');
  poly([[33, 27], [56, 26], [66, 31], [70, 39], [71, 50], [66, 60], [58, 63], [33, 63], [24, 56], [22, 43], [27, 33]], 'hair');
  poly([[30, 42], [61, 41], [66, 48], [64, 60], [58, 66], [51, 69], [41, 69], [32, 65], [27, 58], [27, 49]], 'skinShade');
  poly([[31, 43], [60, 43], [63, 50], [61, 60], [57, 65], [50, 67], [41, 67], [33, 63], [29, 57], [29, 48]], 'skinLight');
  // Irregular, tapered bangs instead of a straight rectangular fringe.
  poly([[28, 34], [39, 29], [56, 29], [65, 35], [68, 47], [64, 55], [61, 51], [57, 43], [56, 51], [50, 48], [45, 40], [43, 47], [38, 50], [35, 44], [31, 50], [28, 57], [24, 53], [24, 42]], 'hairDeep');
  poly([[29, 34], [39, 30], [54, 30], [63, 35], [65, 44], [63, 49], [60, 43], [57, 37], [55, 46], [51, 44], [45, 35], [42, 44], [38, 47], [36, 39], [31, 44], [27, 51], [26, 43]], 'hair');
  poly([[29, 35], [38, 31], [40, 32], [34, 37], [30, 43], [28, 44]], 'hairMid');
  poly([[42, 30], [46, 29], [51, 32], [56, 39], [54, 40], [48, 34]], 'hairMid');
  poly([[59, 32], [64, 36], [67, 43], [65, 45], [63, 39]], 'hairMid');
  rect(31, 35, 3, 2, 'hairLight'); rect(47, 32, 3, 1, 'hairLight'); rect(61, 36, 2, 2, 'hairLight');
  // Red-brown eyes with upper lashes, cream catchlights and blush.
  rect(31, 51, 10, 2, 'outline'); rect(51, 51, 10, 2, 'outline');
  rect(32, 53, 8, 7, 'white'); rect(52, 53, 8, 7, 'white');
  rect(34, 53, 5, 7, 'eye'); rect(53, 53, 5, 7, 'eye');
  rect(35, 57, 3, 3, 'iris'); rect(54, 57, 3, 3, 'iris');
  rect(34, 53, 2, 2, 'whiteLight'); rect(53, 53, 2, 2, 'whiteLight');
  rect(30, 60, 4, 2, 'cheek'); rect(59, 60, 4, 2, 'cheek'); rect(45, 63, 3, 1, 'skinShade'); rect(44, 65, 4, 1, 'hairMid');
  // Side hair ties, with scalloped white cuffs.
  for (const x of [24, 63]) {
   poly([[x, 59], [x + 6, 60], [x + 7, 70], [x + 9, 73], [x - 3, 73], [x - 1, 68]], 'outline');
   poly([[x + 1, 60], [x + 5, 61], [x + 6, 70], [x - 1, 70]], 'red');
   rect(x, 64, 6, 2, 'white'); rect(x - 1, 69, 8, 2, 'white'); rect(x - 2, 72, 10, 2, 'white');
  }
  // Bare shoulders, sleeveless red bodice and white crossed collar.
  rect(41, 69, 11, 5, 'skinShade'); rect(43, 69, 7, 5, 'skin');
  poly([[34, 71], [41, 70], [46, 74], [52, 70], [59, 72], [62, 82], [57, 94], [34, 94], [29, 81]], 'outline');
  poly([[34, 72], [39, 73], [36, 81], [31, 81]], 'skin');
  poly([[54, 73], [59, 74], [60, 81], [55, 82]], 'skin');
  poly([[39, 75], [46, 76], [53, 74], [55, 89], [52, 95], [37, 94]], 'red');
  poly([[39, 71], [46, 76], [52, 71], [55, 74], [47, 82], [37, 74]], 'white');
  poly([[43, 77], [46, 79], [48, 77], [49, 82], [47, 87], [44, 85]], 'gold');
  rect(44, 79, 2, 6, 'whiteLight');
  // Wide pleated skirt with a continuous frilled hem and embroidered inner border.
  const flare = fly ? 3 : sway;
  poly([[36, 91], [55, 91], [60, 99], [65 + flare, 111], [69 + flare, 115], [65, 119], [56, 122], [34, 121], [23 - flare, 117], [26 - flare, 112], [31, 100]], 'outline');
  poly([[36, 93], [54, 93], [59, 100], [63 + flare, 111], [66 + flare, 115], [56, 119], [35, 118], [26 - flare, 115], [30, 107]], 'red');
  poly([[37, 95], [41, 95], [37, 113], [31, 114]], 'redMid');
  poly([[45, 96], [48, 96], [50, 115], [44, 115]], 'redMid');
  poly([[53, 96], [56, 98], [62, 113], [56, 115]], 'redDeep');
  poly([[27 - flare, 114], [35, 117], [46, 118], [57, 118], [66 + flare, 114], [66 + flare, 117], [57, 121], [45, 121], [34, 120], [25 - flare, 117]], 'whiteShadow');
  for (let i = 0; i < 9; i++) { const x = 28 + i * 4, y = 115 + (i > 1 && i < 7 ? 3 : 1); rect(x, y, 3, 2, 'white'); rect(x + 1, y - 5, 2, 2, 'white'); }
  // Socks compress during anticipation while the soles remain at pixel row 126.
  const sole = (fly ? 123 : 126) - crouch;
  rect(35, 121, 7, Math.max(1, sole - 121), 'white'); rect(53, 121, 7, Math.max(1, sole - 121), 'white');
  rect(32, sole - 2, 10, 2, 'outline'); rect(53, sole - 2, 10, 2, 'outline');
  rect(33, sole - 3, 8, 2, 'red'); rect(54, sole - 3, 7, 2, 'red'); rect(34, sole - 3, 3, 1, 'redLight');
  // Detached, flared sleeves hold the same broom at two distinct hand positions.
  const hand = 53 + Math.round(sweep * .5);
  poly([[30, 80], [36, 81], [40, 87], [hand, 87], [hand + 2, 93], [39, 99], [29, 92], [25, 85]], 'outline');
  poly([[30, 81], [34, 82], [39, 89], [hand - 1, 89], [hand, 92], [39, 97], [30, 91], [27, 85]], 'white');
  poly([[29, 87], [39, 94], [48, 91], [49, 94], [39, 97], [30, 91]], 'whiteShadow');
  poly([[27, 84], [30, 82], [36, 89], [34, 91]], 'red');
  poly([[57, 81], [62, 82], [66, 94], [62, 98], [55, 91], [hand + 1, 82]], 'outline');
  poly([[57, 82], [60, 83], [64, 93], [62, 95], [57, 90], [hand + 2, 83]], 'white');
  poly([[60, 87], [63, 92], [61, 94], [58, 91]], 'whiteShadow');
  rect(57, 81, 5, 2, 'red');
  // Broom sweeps through an arc at ground level. Its head never changes length.
  const bx = 64 + sweep;
  poly([[hand, 72], [hand + 3, 72], [bx + 1, 111], [bx - 2, 112]], 'woodDark');
  poly([[hand + 1, 73], [hand + 2, 73], [bx, 111], [bx - 1, 111]], 'wood');
  poly([[bx - 3, 108], [bx + 3, 108], [bx + 10, 124 - crouch], [bx + 8, 126 - crouch], [bx - 10, 125 - crouch]], 'woodDark');
  poly([[bx - 2, 109], [bx + 2, 109], [bx + 8, 124 - crouch], [bx - 8, 124 - crouch]], 'straw');
  for (let i = -2; i <= 2; i++) poly([[bx + i, 112], [bx + i + 1, 112], [bx + i * 3 + 1, 124 - crouch], [bx + i * 3, 124 - crouch]], i % 2 ? 'wood' : 'strawLight');
  rect(bx - 3, 110, 7, 2, 'redDeep'); rect(bx - 4, 113, 9, 1, 'woodDark');
  rect(hand - 1, 80, 5, 4, 'skinShade'); rect(hand - 1, 80, 4, 3, 'skin');
  rect(hand - 2, 89, 5, 4, 'skinShade'); rect(hand - 2, 89, 4, 3, 'skinLight');
 }
 return { canvas, width, height, frames };
}
