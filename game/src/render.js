// Starlight Ramen Stand — all drawing. One fixed 1280x720 kitchen scene:
// a night-sky window and hanging lanterns at the back, the order board on
// the left wall, a steaming pot and the assembly counter across the middle,
// ingredient bins along the counter front, and the pass on the right where
// a finished plate waits to be served. Everything is flat canvas shapes
// drawn from the world state, so a screenshot is a real render of play.

import { INGREDIENTS, MAX_STRIKES, SHIFT_SECONDS } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export const W = 1280;
export const H = 720;

// Click targets, shared with main.js: ingredient bins and the two buttons.
export const BIN_RECTS = INGREDIENTS.map((ing, i) => ({
  id: ing.id, x: 36 + i * 118, y: 596, w: 108, h: 96,
}));
export const SERVE_RECT = { x: 1036, y: 596, w: 208, h: 96 };
export const CLEAR_RECT = { x: 1036, y: 500, w: 208, h: 72 };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, value, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700 ' : ''}${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function drawIngredientIcon(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'noodles') {
    ctx.strokeStyle = '#f2d38a'; ctx.lineWidth = s * 0.16;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * s * 0.4, -s * 0.5);
      ctx.quadraticCurveTo(i * s * 0.7, 0, i * s * 0.4, s * 0.5); ctx.stroke();
    }
  } else if (id === 'shoyu' || id === 'miso') {
    ctx.fillStyle = id === 'shoyu' ? '#7a4a21' : '#b06a28';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(-s * 0.15, -s * 0.1, s * 0.25, s * 0.12, -0.4, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5a623'; ctx.beginPath(); ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'pork') {
    ctx.fillStyle = '#d98a94'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.6, s * 0.4, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b95f6e'; ctx.lineWidth = s * 0.1;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.38, s * 0.22, 0.2, 0, Math.PI * 2); ctx.stroke();
  } else if (id === 'scallion') {
    ctx.strokeStyle = '#58b368'; ctx.lineWidth = s * 0.14;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * s * 0.22, s * 0.45); ctx.lineTo(i * s * 0.3, -s * 0.45); ctx.stroke();
    }
  } else if (id === 'nori') {
    ctx.fillStyle = '#22382e'; ctx.fillRect(-s * 0.45, -s * 0.55, s * 0.9, s * 1.1);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-s * 0.45, -s * 0.55, s * 0.3, s * 1.1);
  } else if (id === 'chili') {
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.3);
    ctx.quadraticCurveTo(0, -s * 0.6, s * 0.55, s * 0.25);
    ctx.quadraticCurveTo(0, s * 0.05, -s * 0.5, s * 0.3); ctx.fill();
    ctx.strokeStyle = '#3f7d2c'; ctx.lineWidth = s * 0.12;
    ctx.beginPath(); ctx.moveTo(s * 0.5, s * 0.22); ctx.lineTo(s * 0.68, -s * 0.05); ctx.stroke();
  }
  ctx.restore();
}

function drawBowl(ctx, state, cx, cy, scale) {
  // The bowl on the counter: broth colour once broth is in, toppings piled
  // as little icons, steam while the noodles are hot.
  const hasBroth = state.bowl.includes('shoyu') || state.bowl.includes('miso');
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(scale, scale);
  if (state.bowl.includes('noodles')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 4;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * 34, -64);
      ctx.quadraticCurveTo(i * 34 + 12, -92, i * 34, -116); ctx.stroke();
    }
  }
  ctx.fillStyle = '#274b73';
  ctx.beginPath(); ctx.moveTo(-110, -38); ctx.quadraticCurveTo(0, 66, 110, -38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hasBroth ? (state.bowl.includes('miso') ? '#c07c33' : '#8a5426') : '#e8e2d2';
  ctx.beginPath(); ctx.ellipse(0, -38, 110, 24, 0, 0, Math.PI * 2); ctx.fill();
  if (state.bowl.includes('noodles')) {
    ctx.strokeStyle = '#f2d38a'; ctx.lineWidth = 6;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath(); ctx.ellipse(-52 + i * 26, -40, 15, 6, 0.3, 0, Math.PI * 2); ctx.stroke();
    }
  }
  const toppings = state.bowl.filter((x) => !['noodles', 'shoyu', 'miso'].includes(x));
  toppings.forEach((id, i) => {
    const angle = (i / Math.max(toppings.length, 1)) * Math.PI * 1.6 - 0.6;
    drawIngredientIcon(ctx, id, Math.cos(angle) * 52, -44 + Math.sin(angle) * 10, 21);
  });
  ctx.restore();
}

function drawOrderBoard(ctx, state) {
  roundRect(ctx, 28, 92, 330, 372, 12);
  ctx.fillStyle = '#2d1f16'; ctx.fill();
  ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 6; ctx.stroke();
  text(ctx, 'ORDER BOARD', 193, 126, 24, '#ffd98a', 'center', true);
  if (state.orders.length === 0) text(ctx, 'No orders yet...', 193, 220, 19, '#cbb590', 'center');
  state.orders.forEach((order, i) => {
    const y = 142 + i * 106;
    roundRect(ctx, 44, y, 298, 98, 8);
    ctx.fillStyle = '#fdf6df'; ctx.fill();
    text(ctx, `#${order.id} ${order.customer}: ${order.dish}`, 58, y + 26, 17, '#33241a', 'left', true);
    const needs = [`broth: ${order.broth}`, ...order.toppings];
    text(ctx, needs.join('  +  '), 58, y + 50, 15, '#5a4632');
    const frac = Math.max(0, order.patience / order.patienceMax);
    ctx.fillStyle = '#d8cdb2'; ctx.fillRect(58, y + 62, 270, 12);
    ctx.fillStyle = frac > 0.45 ? '#58b368' : frac > 0.2 ? '#f5a623' : '#d43d2a';
    ctx.fillRect(58, y + 62, 270 * frac, 12);
    text(ctx, `${Math.ceil(order.patience)}s`, 328, y + 74, 13, '#5a4632', 'right');
  });
}

function drawKitchen(ctx, state) {
  // Back wall, window with the night sky, lanterns.
  ctx.fillStyle = '#3a2b3f'; ctx.fillRect(0, 0, W, 486);
  ctx.fillStyle = '#1d2a4a'; ctx.fillRect(420, 60, 440, 220);
  ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 10; ctx.strokeRect(420, 60, 440, 220);
  ctx.fillStyle = '#f7ead0';
  for (let i = 0; i < 26; i += 1) {
    const sx = 440 + ((i * 167) % 400); const sy = 78 + ((i * 89) % 180);
    ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.fillStyle = '#f5eeda'; ctx.beginPath(); ctx.arc(806, 104, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d2a4a'; ctx.beginPath(); ctx.arc(818, 96, 22, 0, Math.PI * 2); ctx.fill();
  for (const lx of [120, 640, 1160]) {
    ctx.strokeStyle = '#201612'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 34); ctx.stroke();
    ctx.fillStyle = '#ff9d45'; ctx.beginPath(); ctx.ellipse(lx, 58, 26, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffc987'; ctx.beginPath(); ctx.ellipse(lx, 58, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
  }
  text(ctx, 'STARLIGHT RAMEN STAND', 640, 330, 30, '#ffd98a', 'center', true);
  // Shelves with jars.
  ctx.fillStyle = '#54382a'; ctx.fillRect(920, 120, 320, 14); ctx.fillRect(920, 216, 320, 14);
  const jarColors = ['#d43d2a', '#58b368', '#f2d38a', '#d98a94', '#7ab5d6', '#b06a28'];
  jarColors.forEach((c, i) => {
    const jx = 946 + (i % 3) * 104; const jy = i < 3 ? 66 : 162;
    ctx.fillStyle = c; roundRect(ctx, jx, jy, 54, 54, 8); ctx.fill();
    ctx.fillStyle = '#2d1f16'; ctx.fillRect(jx + 8, jy - 8, 38, 10);
  });
  // Counter.
  ctx.fillStyle = '#6e4630'; ctx.fillRect(0, 486, W, 234);
  ctx.fillStyle = '#8a5a3a'; ctx.fillRect(0, 486, W, 26);
  // Pot with the noodle timer.
  ctx.fillStyle = '#3c4148'; roundRect(ctx, 420, 372, 170, 104, 12); ctx.fill();
  ctx.fillStyle = '#565d66'; ctx.beginPath(); ctx.ellipse(505, 374, 85, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9e6ee'; ctx.beginPath(); ctx.ellipse(505, 370, 70, 13, 0, 0, Math.PI * 2); ctx.fill();
  if (state.noodleTimer > 0 || state.noodleReady) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.moveTo(505 + i * 30, 344);
      ctx.quadraticCurveTo(505 + i * 30 + 10, 318, 505 + i * 30, 296); ctx.stroke();
    }
  }
  text(ctx, 'NOODLE POT', 505, 500, 16, '#ffd98a', 'center', true);
  if (state.noodleTimer > 0) text(ctx, `boiling... ${state.noodleTimer.toFixed(1)}s`, 505, 524, 16, '#ffffff', 'center');
  else if (state.noodleReady) text(ctx, 'noodles ready!', 505, 524, 16, '#9fe870', 'center', true);
  // The pass on the right: a finished plate ready to serve.
  ctx.fillStyle = '#54382a'; ctx.fillRect(930, 420, 314, 16);
  ctx.fillStyle = '#fdf6df'; ctx.beginPath(); ctx.ellipse(1087, 414, 74, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c07c33'; ctx.beginPath(); ctx.ellipse(1087, 410, 56, 12, 0, 0, Math.PI * 2); ctx.fill();
  drawIngredientIcon(ctx, 'egg', 1068, 402, 17);
  drawIngredientIcon(ctx, 'scallion', 1106, 402, 15);
  text(ctx, 'READY TO SERVE', 1087, 462, 16, '#ffd98a', 'center', true);
  drawBowl(ctx, state, 720, 448, 1);
  text(ctx, 'YOUR BOWL — mid-assembly', 720, 524, 16, '#ffd98a', 'center', true);
  if (state.bowl.length) text(ctx, state.bowl.join(' + '), 720, 548, 15, '#ffffff', 'center');
}

function drawHud(ctx, state, screen) {
  ctx.fillStyle = 'rgba(16,12,20,0.92)'; ctx.fillRect(0, 0, W, 76);
  text(ctx, 'Starlight Ramen Stand', 28, 48, 27, '#ffd98a', 'left', true);
  const mins = Math.floor(state.timeLeft / 60); const secs = Math.floor(state.timeLeft % 60);
  text(ctx, `SHIFT TIMER  ${mins}:${String(secs).padStart(2, '0')}`, 470, 48, 24, state.timeLeft < 20 ? '#ff7a6b' : '#ffffff', 'left', true);
  text(ctx, `Coins ${state.coins}`, 760, 48, 24, '#ffffff', 'left', true);
  text(ctx, `Served ${state.served}`, 920, 48, 24, '#ffffff', 'left', true);
  text(ctx, `Strikes ${'X'.repeat(state.strikes)}${'-'.repeat(Math.max(0, MAX_STRIKES - state.strikes))}`, 1090, 48, 20, '#ff9d8a', 'left', true);
  if (state.combo >= 2) text(ctx, `Combo x${state.combo}`, 470, 70, 14, '#9fe870', 'left', true);
}

function drawCounterFront(ctx, state) {
  BIN_RECTS.forEach((rect, i) => {
    const ing = INGREDIENTS[i];
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = '#2d1f16'; ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 3; ctx.stroke();
    drawIngredientIcon(ctx, ing.id, rect.x + rect.w / 2, rect.y + 34, 24);
    text(ctx, ing.name.split(' ')[0], rect.x + rect.w / 2, rect.y + 74, 14, '#ffffff', 'center', true);
    text(ctx, ing.key, rect.x + rect.w / 2, rect.y + 90, 12, '#ffd98a', 'center');
  });
  roundRect(ctx, CLEAR_RECT.x, CLEAR_RECT.y, CLEAR_RECT.w, CLEAR_RECT.h, 10);
  ctx.fillStyle = '#5a4632'; ctx.fill();
  text(ctx, 'TOSS BOWL (C)', CLEAR_RECT.x + CLEAR_RECT.w / 2, CLEAR_RECT.y + 44, 18, '#ffffff', 'center', true);
  roundRect(ctx, SERVE_RECT.x, SERVE_RECT.y, SERVE_RECT.w, SERVE_RECT.h, 12);
  ctx.fillStyle = '#2e7d46'; ctx.fill();
  ctx.strokeStyle = '#9fe870'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'SERVE! (Space)', SERVE_RECT.x + SERVE_RECT.w / 2, SERVE_RECT.y + 58, 23, '#ffffff', 'center', true);
  if (state.messageTimer > 0) {
    roundRect(ctx, 330, 552, 620, 36, 18);
    ctx.fillStyle = 'rgba(16,12,20,0.88)'; ctx.fill();
    text(ctx, state.message, 640, 577, 17, '#ffe9b0', 'center', true);
  }
}

function drawOverlay(ctx, title, lines) {
  ctx.fillStyle = 'rgba(10,8,16,0.72)'; ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 340, 170, 600, 380, 18);
  ctx.fillStyle = '#fdf6df'; ctx.fill();
  text(ctx, title, 640, 250, 40, '#33241a', 'center', true);
  lines.forEach((line, i) => text(ctx, line, 640, 310 + i * 38, 21, '#5a4632', 'center'));
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  function draw(state, screen, best) {
    ctx.clearRect(0, 0, W, H);
    drawKitchen(ctx, state);
    drawOrderBoard(ctx, state);
    drawHud(ctx, state, screen);
    drawCounterFront(ctx, state);
    if (screen === SCREEN_TITLE) {
      drawOverlay(ctx, 'STARLIGHT RAMEN STAND', [
        'A tiny night-stall cooking game.',
        'Read a ticket on the order board, boil the noodles,',
        'add the broth and toppings, then SERVE before',
        'the customer patience bar runs out!',
        '',
        'Click ingredients or press 1-8. Space serves.',
        'Click or press Space to open the stall',
      ]);
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay(ctx, 'PAUSED', ['The broth is holding. Click or press P to resume.']);
    } else if (screen === SCREEN_OVER) {
      drawOverlay(ctx, 'SHIFT OVER!', [
        `Bowls served: ${state.served}`,
        `Coins earned: ${state.coins}`,
        `Best combo: x${state.bestCombo}`,
        `Best coins ever: ${best}`,
        '',
        'Click or press Space to play again',
      ]);
    }
  }
  return { draw };
}
