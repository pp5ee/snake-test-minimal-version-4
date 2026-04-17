/**
 * Snake Game – entry point
 *
 * This file wires up the canvas and DOM elements.
 * Full game logic is implemented below.
 */

(function () {
  "use strict";

  // ── Constants ──────────────────────────────────────────────
  const CELL_SIZE   = 20;           // pixels per grid cell
  const COLS        = 20;           // grid columns  (400 / 20)
  const ROWS        = 20;           // grid rows     (400 / 20)
  const TICK_MS     = 150;          // ms between game updates
  const STORAGE_KEY = "snake_history";

  const DIR = { UP: "UP", DOWN: "DOWN", LEFT: "LEFT", RIGHT: "RIGHT" };

  // ── DOM refs ───────────────────────────────────────────────
  const canvas          = document.getElementById("game-canvas");
  const ctx             = canvas.getContext("2d");
  const currentScoreEl  = document.getElementById("current-score");
  const bestScoreEl     = document.getElementById("best-score");
  const finalScoreText  = document.getElementById("final-score-text");
  const startOverlay    = document.getElementById("start-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");
  const restartBtn      = document.getElementById("restart-btn");
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const historyList     = document.getElementById("history-list");
  const historyEmpty    = document.getElementById("history-empty");

  // ── Game state ─────────────────────────────────────────────
  const state = {
    snake: [],
    direction: DIR.RIGHT,
    nextDirection: DIR.RIGHT,
    apple: null,
    score: 0,
    loopId: null,
    running: false
  };

  // ── Initialise / reset ─────────────────────────────────────
  function initGame() {
    const startCol = Math.floor(COLS / 2);
    const startRow = Math.floor(ROWS / 2);

    state.snake         = [{ x: startCol, y: startRow }];
    state.direction     = DIR.RIGHT;
    state.nextDirection = DIR.RIGHT;
    state.score         = 0;
    state.running       = false;

    spawnApple();
    updateScoreDisplay();
    draw();
  }

  // ── Apple placement ────────────────────────────────────────
  function spawnApple() {
    do {
      state.apple = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (state.snake.some(seg => seg.x === state.apple.x && seg.y === state.apple.y));
  }

  // ── Game loop ──────────────────────────────────────────────
  function startLoop() {
    if (state.loopId) clearInterval(state.loopId);
    state.running = true;
    state.loopId  = setInterval(tick, TICK_MS);
  }

  function isCollision(head) {
    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      return true;
    }
    // Self collision
    if (state.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      return true;
    }
    return false;
  }

  function tick() {
    state.direction = state.nextDirection;

    const head    = state.snake[0];
    const newHead = { x: head.x, y: head.y };

    const directionMap = {
      [DIR.UP]:    { x: 0, y: -1 },
      [DIR.DOWN]:  { x: 0, y: 1 },
      [DIR.LEFT]:  { x: -1, y: 0 },
      [DIR.RIGHT]: { x: 1, y: 0 }
    };
    const move = directionMap[state.direction];
    newHead.x += move.x;
    newHead.y += move.y;

    if (isCollision(newHead)) {
      endGame();
      return;
    }

    state.snake.unshift(newHead);

    // Apple eaten
    if (newHead.x === state.apple.x && newHead.y === state.apple.y) {
      state.score += 1;
      updateScoreDisplay();
      spawnApple();
    } else {
      state.snake.pop();
    }

    draw();
  }

  // ── End game ───────────────────────────────────────────────
  function endGame() {
    clearInterval(state.loopId);
    state.running = false;

    saveScore(state.score);
    renderHistory();
    updateBestScore();

    finalScoreText.textContent = "Score: " + state.score;
    showOverlay("gameover");
  }

  // ── Drawing ────────────────────────────────────────────────
  function draw() {
    // Background
    ctx.fillStyle = "#16213e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    ctx.strokeStyle = "#1e2d50";
    ctx.lineWidth   = 0.5;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(canvas.width, r * CELL_SIZE);
      ctx.stroke();
    }

    // Apple
    ctx.fillStyle = "#e05c5c";
    ctx.beginPath();
    ctx.arc(
      state.apple.x * CELL_SIZE + CELL_SIZE / 2,
      state.apple.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    state.snake.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? "#4ecca3" : "#2ea882";
      const padding = 1;
      ctx.fillRect(
        seg.x * CELL_SIZE + padding,
        seg.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2
      );
    });
  }

  // ── Score display ──────────────────────────────────────────
  function updateScoreDisplay() {
    currentScoreEl.textContent = state.score;
  }

  function updateBestScore() {
    const history  = loadHistory();
    const best     = history.reduce((max, e) => Math.max(max, e.score), 0);
    bestScoreEl.textContent = best;
  }

  // ── Overlay helpers ────────────────────────────────────────
  const overlays = { start: startOverlay, gameover: gameoverOverlay };

  function showOverlay(name) {
    Object.values(overlays).forEach(el => el.classList.add("hidden"));
    overlays[name].classList.remove("hidden");
  }

  function hideOverlays() {
    Object.values(overlays).forEach(el => el.classList.add("hidden"));
  }

  // ── localStorage helpers ───────────────────────────────────
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveScore(value) {
    const history = loadHistory();
    history.unshift({ score: value, time: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    bestScoreEl.textContent = 0;
  }

  // ── History rendering ──────────────────────────────────────
  function renderHistory() {
    const history = loadHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyEmpty.style.display = "block";
      return;
    }

    historyEmpty.style.display = "none";
    history.forEach(entry => {
      const li        = document.createElement("li");
      const scoreSpan = document.createElement("span");
      const timeSpan  = document.createElement("span");

      scoreSpan.className   = "entry-score";
      scoreSpan.textContent = entry.score;

      timeSpan.className    = "entry-time";
      timeSpan.textContent  = formatTime(entry.time);

      li.appendChild(scoreSpan);
      li.appendChild(timeSpan);
      historyList.appendChild(li);
    });
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (_) {
      return iso;
    }
  }

  // ── Keyboard input ─────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    const key = e.key;

    // Start / restart on Enter
    if (key === "Enter") {
      if (!running) {
        hideOverlays();
        initGame();
        startLoop();
      }
      return;
    }

    if (!running) return;

    // Direction keys (prevent reverse)
    const keyMap = {
      'ArrowUp':    { dir: DIR.UP,    opposite: DIR.DOWN },
      'w':          { dir: DIR.UP,    opposite: DIR.DOWN },
      'ArrowDown':  { dir: DIR.DOWN,  opposite: DIR.UP },
      's':          { dir: DIR.DOWN,  opposite: DIR.UP },
      'ArrowLeft':  { dir: DIR.LEFT,  opposite: DIR.RIGHT },
      'a':          { dir: DIR.LEFT,  opposite: DIR.RIGHT },
      'ArrowRight': { dir: DIR.RIGHT, opposite: DIR.LEFT },
      'd':          { dir: DIR.RIGHT, opposite: DIR.LEFT }
    };

    const mapping = keyMap[key];
    if (mapping && state.direction !== mapping.opposite) {
      state.nextDirection = mapping.dir;
    }

    // Prevent page scroll on arrow keys
    if (key.startsWith("Arrow")) e.preventDefault();
  });

  // ── Button listeners ───────────────────────────────────────
  restartBtn.addEventListener("click", function () {
    hideOverlays();
    initGame();
    startLoop();
  });

  clearHistoryBtn.addEventListener("click", clearHistory);

  // ── Boot ───────────────────────────────────────────────────
  initGame();
  renderHistory();
  updateBestScore();
  showOverlay(startOverlay);
})();
