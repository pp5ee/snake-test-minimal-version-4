**CORE_RISKS**
- Ambiguous “RLCR 模式” definition; process constraint unclear and easy to misapply.
- Browser-only assumption; if non-browser context, `localStorage` unavailable or restricted.
- Input handling pitfalls (instant 180° turn into self in same tick, multi-key buffering).
- Timing variance across displays; inconsistent speed with naive `requestAnimationFrame`.
- Data loss in private/incognito mode or when `localStorage` is disabled/cleared.
- Unbounded score history growth; performance and UX degrade over time.
- Collision logic edge cases (apple on snake, boundary rules, diagonal double-step on lag).

**MISSING_REQUIREMENTS**
- Target platform scope (desktop only vs. mobile; swipe/touch support).
- Game rules: wall collision vs. wrap-around, grid size, speed curve, pause/restart.
- Score definition (length, apples eaten, time survived) and history retention cap.
- History metadata (timestamp, duration, max length, version); clear/reset control.
- UI expectations (canvas vs DOM, minimalist vs. themed, sound, accessibility).
- Multiple tab behavior (merge scores, de-dup, locking) and data schema versioning.
- Offline expectations (pure static file vs. PWA caching) and browser support matrix.

**TECHNICAL_GAPS**
- RLCR process integration details (what artifacts, cadence, and checkpoints it requires).
- Storage schema design: structure, validation, migration, corruption recovery.
- Deterministic game loop: fixed-timestep accumulator vs. `setInterval` simplification.
- Direction-change queueing per tick to avoid mid-tick self-collisions.
- Data hygiene: prefixing keys, size limits, max history length/eviction policy.
- Basic state machine (menu → playing → paused → game-over) not specified.
- Testing approach (unit tests for storage/util, manual gameplay checks) not defined.

**ALTERNATIVE_DIRECTIONS**
- Vanilla JS + Canvas, no build step: simplest, open `index.html` and play.
- DOM grid (CSS/JS) instead of Canvas: easier to style, heavier DOM updates at speed.
- TypeScript + Vite: stronger types and structure; adds setup overhead for a test.
- IndexedDB for history: scalable and structured; overkill for small histories.
- PWA with Offline cache: better resilience and installability; scope creep for a test.
- React/Svelte UI shell: faster UI iteration; adds dependency and bundling complexity.

**QUESTIONS_FOR_USER**
- What exactly is “RLCR 模式”？Please define required workflow, artifacts, and constraints.
- Desktop only or also mobile? If mobile, should we add touch/swipe controls?
- Wall rule: collide-to-lose or wrap-around? Any speed increase over time?
- How is score defined and displayed? Should we cap and sort history (e.g., top 20)?
- Do you want a “Clear History” button and confirm prompt?
- Visuals: minimalist monochrome or basic styling/colors/sounds?
- Acceptance for “no build” approach (open `index.html`) vs. using a dev server/bundler?

**CANDIDATE_CRITERIA**
- Loads locally by opening `index.html`; no external dependencies required.
- Gameplay: arrow/WASD control, no instant 180° reversal within a tick, consistent speed.
- Rules: apple spawns off-snake, growth works, clear game-over with restart.
- Score: increments per apple; on game-over, entry with {score, timestamp} appended.
- Persistence: history stored in `localStorage` under a namespaced key (e.g., `snake:scores`), survives reloads and new sessions.
- History UI: visible list on page load, sorted (newest first), capped to N (e.g., 20), with a “Clear History” action.
- Data safety: guards for missing/invalid storage, handles quota/deny gracefully with user-facing message.
- RLCR: repository contains a brief `README` describing RLCR mode usage and how it shaped code structure; steps or notes traceable to RLCR phases.
- Code quality: single-file or small-file structure, clear state machine, fixed-timestep loop or reasoned `setInterval`, direction-change debouncing.
- Browser support: works in latest Chrome/Firefox/Edge desktop; no errors in console.
