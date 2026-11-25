// Starlight Ramen Stand — boot, input and the one game loop.
// Mouse: click an ingredient bin to add it, SERVE to serve, TOSS to clear.
// Keyboard: 1-8 add ingredients, Space serves / starts, C tosses, P pauses.
// The world advances in fixed 1/60 s steps so timers behave the same on
// every machine. ?shot=start|play|end&seed=N stages a still scene instead
// of running the loop, paints it twice and sets window.__shotReady — that
// is how the screenshots in screenshots/ were taken.

import { createWorld, INGREDIENTS } from './world.js';
import {
  BIN_RECTS, CLEAR_RECT, SERVE_RECT, createRenderer,
  SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE,
} from './render.js';

const BEST_KEY = 'starlight-ramen-best-coins';
const STEP = 1 / 60;
const MAX_FRAME = 0.25;

function createRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261125;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveBest(value) {
  try { window.localStorage.setItem(BEST_KEY, String(value)); } catch { /* private window */ }
}

// Stage the three screenshot scenes from real world state: the title over
// a live kitchen, a mid-shift moment (one bowl mid-assembly with noodles
// ready, tickets on the board, timers running), and the end of a shift.
function stageShot(name) {
  const { state } = world;
  if (name === 'start') return SCREEN_TITLE;
  if (name === 'end') {
    for (let i = 0; i < 60 * 12; i += 1) world.step(STEP);
    state.timeLeft = 0; state.elapsed = 120; state.over = true;
    state.served = 9; state.coins = 168; state.bestCombo = 4;
    return SCREEN_OVER;
  }
  // play: fast-forward so orders, patience and the shift timer are mid-run,
  // then build a bowl by hand — noodles cooked, broth in, one topping in,
  // so the plate is visibly mid-assembly next to a ready-to-serve dish.
  for (let i = 0; i < 60 * 7; i += 1) world.step(STEP);
  world.addIngredient('noodles');
  for (let i = 0; i < 60 * 4; i += 1) world.step(STEP);
  const first = state.orders[0];
  if (first) {
    world.addIngredient(first.broth);
    if (first.toppings[0]) world.addIngredient(first.toppings[0]);
  }
  state.message = 'Noodles ready! One topping in — keep building the bowl.';
  state.messageTimer = 99;
  return SCREEN_PLAY;
}

function runShot(name) {
  const screen = stageShot(name);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, screen, readBest());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) { status.textContent = message; }
  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('The stall is open. First orders are on the board.');
  }
  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.coins > best) { best = world.state.coins; saveBest(best); }
    announce(`Shift over. Served ${world.state.served} bowls, earned ${world.state.coins} coins.`);
  }
  function pointIn(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

  function activate(x, y) {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) { startGame(); return; }
    if (screen === SCREEN_PAUSED) { screen = SCREEN_PLAY; return; }
    const bin = BIN_RECTS.find((r) => pointIn(x, y, r));
    if (bin) { world.addIngredient(bin.id); return; }
    if (pointIn(x, y, SERVE_RECT)) world.serve();
    else if (pointIn(x, y, CLEAR_RECT)) world.clearBowl();
  }

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    activate(x, y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key;
    if (key === ' ') {
      event.preventDefault();
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      else world.serve();
      return;
    }
    if (screen !== SCREEN_PLAY) {
      if ((key === 'p' || key === 'P') && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      return;
    }
    if (key === 'p' || key === 'P') { screen = SCREEN_PAUSED; announce('Paused.'); return; }
    if (key === 'c' || key === 'C') { world.clearBowl(); return; }
    const ing = INGREDIENTS.find((x) => x.key === key);
    if (ing) world.addIngredient(ing.id);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
  });

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        world.step(STEP);
        accumulator -= STEP;
        if (world.state.over) endGame();
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  announce('Starlight Ramen Stand. Click or press Space to open the stall.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
