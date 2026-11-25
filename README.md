# makefun-best-cooking-game — Starlight Ramen Stand

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/mokoooo/makefun-best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/mokoooo/makefun-best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Starlight Ramen Stand** is an original cooking game for a desktop browser. You run a tiny night ramen stall: read each ticket on the order board, boil the noodles in the pot (watch the timer), add the right broth and toppings to the bowl on the counter, and serve the finished plate before the customer's patience runs out. Earn coins and combos over a two-minute shift; three walked-out customers end it early.

The game is plain static files under `game/` — no build step, no library, no network request. Play it locally:

```sh
node serve.ts   # then open http://localhost:8080
```

Click ingredient bins or press 1–8, Space serves, C tosses the bowl, P pauses.

`main.ts` (Node 22) is the hand-in program for [make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137): it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-game.ts` library.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of the game taken with its `?shot=play|start|end&seed=1` staging modes (see `shots.json`). The first, the cover, is a live mid-shift moment that shows the whole stall at once: the kitchen, the order board, the ingredient bins on the counter, a bowl mid-assembly, the shift timer and a plate ready to serve.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
