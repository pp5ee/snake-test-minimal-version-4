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
  let snake, direction, nextDirection, apple, score, loopId, running;

  // ── Initialise / reset ─────────────────────────────────────
  function initGame() {
    const startCol = Math.floor(COLS / 2);
    const startRow = Math.floor(ROWS / 2);

    snake         = [{ x: startCol, y: startRow }];
    direction     = DIR.RIGHT;
    nextDirection = DIR.RIGHT;
    score         = 0;
    running       = false;

    spawnApple();
    updateScoreDisplay();
    draw();
  }

  // ── Apple placement ────────────────────────────────────────
  function spawnApple() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    apple = pos;
  }

  // ── Game loop ──────────────────────────────────────────────
  function startLoop() {
    if (loopId) clearInterval(loopId);
    running = true;
    loopId  = setInterval(tick, TICK_MS);
  }

  function tick() {
    direction = nextDirection;

    const head    = snake[0];
    const newHead = { x: head.x, y: head.y };

    if (direction === DIR.UP)    newHead.y -= 1;
    if (direction === DIR.DOWN)  newHead.y += 1;
    if (direction === DIR.LEFT)  newHead.x -= 1;
    if (direction === DIR.RIGHT) newHead.x += 1;

    // Wall collision
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      endGame();
      return;
    }

    // Self collision
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    // Apple eaten
    if (newHead.x === apple.x && newHead.y === apple.y) {
      score += 1;
      updateScoreDisplay();
      spawnApple();
    } else {
      snake.pop();
    }

    draw();
  }

  // ── End game ───────────────────────────────────────────────
  function endGame() {
    clearInterval(loopId);
    running = false;

    saveScore(score);
    renderHistory();
    updateBestScore();

    finalScoreText.textContent = "Score: " + score;
    showOverlay(gameoverOverlay);
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
      apple.x * CELL_SIZE + CELL_SIZE / 2,
      apple.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    snake.forEach((seg, idx) => {
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
    currentScoreEl.textContent = score;
  }

  function updateBestScore() {
    const history  = loadHistory();
    const best     = history.reduce((max, e) => Math.max(max, e.score), 0);
    bestScoreEl.textContent = best;
  }

  // ── Overlay helpers ────────────────────────────────────────
  function showOverlay(el) {
    startOverlay.classList.add("hidden");
    gameoverOverlay.classList.add("hidden");
    el.classList.remove("hidden");
  }

  function hideOverlays() {
    startOverlay.classList.add("hidden");
    gameoverOverlay.classList.add("hidden");
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
    if ((key === "ArrowUp"    || key === "w" || key === "W") && direction !== DIR.DOWN)  nextDirection = DIR.UP;
    if ((key === "ArrowDown"  || key === "s" || key === "S") && direction !== DIR.UP)    nextDirection = DIR.DOWN;
    if ((key === "ArrowLeft"  || key === "a" || key === "A") && direction !== DIR.RIGHT) nextDirection = DIR.LEFT;
    if ((key === "ArrowRight" || key === "d" || key === "D") && direction !== DIR.LEFT)  nextDirection = DIR.RIGHT;

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
