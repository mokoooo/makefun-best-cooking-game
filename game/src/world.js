// Starlight Ramen Stand — game rules and state, with no drawing in it.
// Customers arrive with an order ticket that lists a broth and a sequence
// of toppings. The player builds the bowl on the counter: noodles must sit
// in the pot for a few seconds, then broth and toppings go in in any order.
// Serving a bowl that matches the ticket earns coins and a tip that shrinks
// as the ticket's patience timer runs down. Three walked-out customers end
// the shift; the shift itself lasts SHIFT_SECONDS.

export const INGREDIENTS = [
  { id: 'noodles', name: 'Noodles', key: '1', color: '#f2d38a' },
  { id: 'shoyu', name: 'Shoyu broth', key: '2', color: '#7a4a21' },
  { id: 'miso', name: 'Miso broth', key: '3', color: '#b06a28' },
  { id: 'egg', name: 'Ajitama egg', key: '4', color: '#fff3c4' },
  { id: 'pork', name: 'Chashu pork', key: '5', color: '#d98a94' },
  { id: 'scallion', name: 'Scallions', key: '6', color: '#58b368' },
  { id: 'nori', name: 'Nori', key: '7', color: '#22382e' },
  { id: 'chili', name: 'Chili oil', key: '8', color: '#d43d2a' },
];

export const SHIFT_SECONDS = 120;
export const MAX_STRIKES = 3;
export const NOODLE_COOK_SECONDS = 3;

const MENU = [
  { name: 'Classic Shoyu', broth: 'shoyu', toppings: ['egg', 'scallion'] },
  { name: 'Chashu Deluxe', broth: 'shoyu', toppings: ['pork', 'pork', 'nori'] },
  { name: 'Spicy Miso', broth: 'miso', toppings: ['chili', 'scallion', 'pork'] },
  { name: 'Garden Miso', broth: 'miso', toppings: ['scallion', 'nori', 'egg'] },
  { name: 'Midnight Fire', broth: 'miso', toppings: ['chili', 'chili', 'egg'] },
  { name: 'Norimaki Special', broth: 'shoyu', toppings: ['nori', 'nori', 'egg', 'scallion'] },
];

const NAMES = ['Aki', 'Ren', 'Yui', 'Sora', 'Mei', 'Ken', 'Hana', 'Riku', 'Nao', 'Tomo'];

export function createWorld(random) {
  const state = {
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    coins: 0,
    served: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    bowl: [],
    noodleTimer: 0,
    noodleReady: false,
    message: 'Click an ingredient, or press its number key!',
    messageTimer: 0,
    nextOrderIn: 0,
    over: false,
    lastServe: null,
  };
  let orderSeq = 0;

  function spawnOrder() {
    if (state.orders.length >= 3) return;
    const dish = MENU[Math.floor(random() * MENU.length)];
    orderSeq += 1;
    state.orders.push({
      id: orderSeq,
      customer: NAMES[Math.floor(random() * NAMES.length)],
      dish: dish.name,
      broth: dish.broth,
      toppings: [...dish.toppings],
      patience: 45,
      patienceMax: 45,
    });
  }

  function reset() {
    state.timeLeft = SHIFT_SECONDS;
    state.elapsed = 0;
    state.coins = 0;
    state.served = 0;
    state.strikes = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.orders = [];
    state.bowl = [];
    state.noodleTimer = 0;
    state.noodleReady = false;
    state.message = 'Click an ingredient, or press its number key!';
    state.messageTimer = 0;
    state.nextOrderIn = 0;
    state.over = false;
    state.lastServe = null;
    spawnOrder();
    spawnOrder();
  }

  function say(text) {
    state.message = text;
    state.messageTimer = 3.5;
  }

  // Add one ingredient to the bowl on the counter. Noodles go to the pot
  // first and must finish cooking before anything else can be added.
  function addIngredient(id) {
    if (state.over) return;
    if (id === 'noodles') {
      if (state.bowl.includes('noodles')) { say('Noodles are already in!'); return; }
      if (state.noodleTimer > 0) { say('Noodles are still boiling...'); return; }
      state.noodleTimer = NOODLE_COOK_SECONDS;
      say('Noodles in the pot! Wait for them to cook.');
      return;
    }
    if (!state.bowl.includes('noodles')) { say('Start with the noodles (1)!'); return; }
    if (!state.noodleReady) { say('Let the noodles finish cooking first.'); return; }
    const broths = state.bowl.filter((x) => x === 'shoyu' || x === 'miso');
    if ((id === 'shoyu' || id === 'miso') && broths.length > 0) { say('The bowl already has a broth.'); return; }
    state.bowl.push(id);
    const ing = INGREDIENTS.find((x) => x.id === id);
    say(`${ing ? ing.name : id} added.`);
  }

  function clearBowl() {
    state.bowl = [];
    state.noodleReady = false;
    say('Bowl tossed. Fresh start!');
  }

  function bowlMatches(order) {
    if (!state.bowl.includes('noodles')) return false;
    const broth = state.bowl.find((x) => x === 'shoyu' || x === 'miso');
    if (broth !== order.broth) return false;
    const got = state.bowl.filter((x) => x !== 'noodles' && x !== order.broth).sort();
    const want = [...order.toppings].sort();
    return got.length === want.length && got.every((v, i) => v === want[i]);
  }

  // Serve the bowl to the longest-waiting matching customer, if any.
  function serve() {
    if (state.over) return;
    if (!state.bowl.includes('noodles') || !state.noodleReady) { say('The bowl is not ready yet.'); return; }
    const index = state.orders.findIndex((o) => bowlMatches(o));
    if (index === -1) { say('No ticket matches this bowl. Check the board!'); return; }
    const [order] = state.orders.splice(index, 1);
    const patienceBonus = Math.round((order.patience / order.patienceMax) * 10);
    const earned = 12 + patienceBonus + Math.min(state.combo, 5) * 2;
    state.coins += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.lastServe = { dish: order.dish, earned, x: 0 };
    say(`Served ${order.dish}! +${earned} coins. Combo x${state.combo}`);
    state.bowl = [];
    state.noodleReady = false;
    if (state.orders.length < 2) spawnOrder();
  }

  function step(dt) {
    if (state.over) return;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
    if (state.messageTimer > 0) state.messageTimer -= dt;
    if (state.noodleTimer > 0) {
      state.noodleTimer -= dt;
      if (state.noodleTimer <= 0) {
        state.noodleTimer = 0;
        state.noodleReady = true;
        state.bowl.push('noodles');
        say('Noodles are ready! Add broth and toppings.');
      }
    }
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0) {
      spawnOrder();
      state.nextOrderIn = 9 + random() * 6;
    }
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.strikes += 1;
        state.combo = 0;
        say(`${order.customer} walked out! Strike ${state.strikes}/${MAX_STRIKES}.`);
        spawnOrder();
      }
    }
    if (state.timeLeft <= 0 || state.strikes >= MAX_STRIKES) state.over = true;
  }

  reset();
  return { state, reset, step, addIngredient, clearBowl, serve };
}
