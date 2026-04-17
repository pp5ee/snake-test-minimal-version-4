# Simple Snake Game with Local Score Storage

## Goal Description
Create a simple, self-contained Snake game that runs in a web browser with keyboard controls, supports score tracking using localStorage, and preserves score history between browser sessions. The implementation should follow RLCR (Read-Learn-Code-Review) mode and include a comprehensive README.md file.

## Acceptance Criteria

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: Game loads and runs successfully as a standalone HTML file
  - Positive Tests (expected to PASS):
    - Opening index.html in a modern browser displays the game interface
    - Game starts with snake in initial position and apple spawned
    - Arrow keys and WASD controls respond immediately
  - Negative Tests (expected to FAIL):
    - Game fails to load with console errors
    - Controls are unresponsive or delayed
    - Game elements fail to render properly

- AC-2: Core gameplay mechanics work correctly
  - Positive Tests (expected to PASS):
    - Snake moves continuously in the current direction
    - Snake grows by one segment when eating an apple
    - New apple spawns in a valid location (not on snake)
    - Score increments by 1 for each apple eaten
  - Negative Tests (expected to FAIL):
    - Snake moves through itself or walls without collision detection
    - Apple spawns on top of snake segments
    - Score fails to increment when apple is eaten

- AC-3: Collision detection and game state management
  - Positive Tests (expected to PASS):
    - Game ends when snake collides with itself
    - Game ends when snake collides with wall boundaries
    - Game over screen displays final score and restart option
    - Restart button resets game to initial state
  - Negative Tests (expected to FAIL):
    - Snake passes through itself without game over
    - Snake exits boundaries without game over
    - Game continues after collision should be detected

- AC-4: Score persistence and history functionality
  - Positive Tests (expected to PASS):
    - Score history is saved to localStorage after each game
    - Previous scores are loaded and displayed on page load
    - Score history is preserved between browser sessions
    - History entries include timestamp and score value
  - Negative Tests (expected to FAIL):
    - Scores are lost after page refresh
    - History fails to load on new browser session
    - Timestamps are missing or incorrect

- AC-5: User interface and controls
  - Positive Tests (expected to PASS):
    - Score display updates in real-time during gameplay
    - History list shows most recent scores at the top
    - Clear History button removes all stored scores
    - Game state is clearly visible (playing/paused/game over)
  - Negative Tests (expected to FAIL):
    - Score display lags behind actual gameplay
    - History list becomes unreadable with many entries
    - Controls are unresponsive during gameplay

- AC-6: RLCR mode compliance and documentation
  - Positive Tests (expected to PASS):
    - README.md exists with project description and usage instructions
    - Code follows simple, readable structure as specified
    - All commits use conventional `feat:` prefix
    - Code demonstrates RLCR workflow principles
  - Negative Tests (expected to FAIL):
    - Missing or incomplete README.md
    - Code structure is overly complex for a simple game
    - Commits use incorrect or missing prefixes

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
<Affirmative description of the most comprehensive acceptable implementation>
<This represents completing the goal without over-engineering>
Example: "The implementation includes X, Y, and Z features with full test coverage"

### Lower Bound (Minimum Acceptable Scope)
<Affirmative description of the minimum viable implementation>
<This represents the least effort that still satisfies all acceptance criteria>
Example: "The implementation includes core feature X with basic validation"

### Allowed Choices
<Options that are acceptable for implementation decisions>
- Can use: <technologies, approaches, patterns that are allowed>
- Cannot use: <technologies, approaches, patterns that are prohibited>

> **Note on Deterministic Designs**: If the draft specifies a highly deterministic design with no choices (e.g., "must use JSON format", "must use algorithm X"), then the path boundaries should reflect this narrow constraint. In such cases, upper and lower bounds may converge to the same point, and "Allowed Choices" should explicitly state that the choice is fixed per the draft specification.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
<Text description, pseudocode, or diagrams showing ONE possible implementation path>

### Relevant References
<Code paths and concepts that might be useful>
- <path/to/relevant/component> - <brief description>

## Dependencies and Sequence

### Milestones
1. <Milestone 1>: <Description>
   - Phase A: <...>
   - Phase B: <...>
2. <Milestone 2>: <Description>
   - Step 1: <...>
   - Step 2: <...>

<Describe relative dependencies between components, not time estimates>

## Task Breakdown

Each task must include exactly one routing tag:
- `coding`: implemented by Claude
- `analyze`: executed via Codex (`/humanize:ask-codex`)

| Task ID | Description | Target AC | Tag (`coding`/`analyze`) | Depends On |
|---------|-------------|-----------|----------------------------|------------|
| task1 | <...> | AC-1 | coding | - |
| task2 | <...> | AC-2 | analyze | task1 |

## Claude-Codex Deliberation

### Agreements
- <Point both sides agree on>

### Resolved Disagreements
- <Topic>: Claude vs Codex summary, chosen resolution, and rationale

### Convergence Status
- Final Status: `converged` or `partially_converged`

## Pending User Decisions

- DEC-1: <Decision topic>
  - Claude Position: <...>
  - Codex Position: <...>
  - Tradeoff Summary: <...>
  - Decision Status: `PENDING` or `<User's final decision>`

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific terminology such as "AC-", "Milestone", "Step", "Phase", or similar workflow markers
- These terms are for plan documentation only, not for the resulting codebase
- Use descriptive, domain-appropriate naming in code instead

## Output File Convention

This template is used to produce the main output file (e.g., `plan.md`).

### Translated Language Variant

When `alternative_plan_language` resolves to a supported language name through merged config loading, a translated variant of the output file is also written after the main file. Humanize loads config from merged layers in this order: default config, optional user config, then optional project config; `alternative_plan_language` may be set at any of those layers. The variant filename is constructed by inserting `_<code>` (the ISO 639-1 code from the built-in mapping table) immediately before the file extension:

- `plan.md` becomes `plan_<code>.md` (e.g. `plan_zh.md` for Chinese, `plan_ko.md` for Korean)
- `docs/my-plan.md` becomes `docs/my-plan_<code>.md`
- `output` (no extension) becomes `output_<code>`

The translated variant file contains a full translation of the main plan file's current content in the configured language. All identifiers (`AC-*`, task IDs, file paths, API names, command flags) remain unchanged, as they are language-neutral.

When `alternative_plan_language` is empty, absent, set to `"English"`, or set to an unsupported language, no translated variant is written. Humanize does not auto-create `.humanize/config.json` when no project config file is present.

--- Original Design Draft Start ---

# Requirement

现在我想写一个贪吃蛇的游戏，代码尽量简单，支持分数记录（页面本地），下一次打开还能看到自己的分数记录历史记录 就没了，本次为测试性代码，强制使用rlcr模式

---

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.

--- Original Design Draft End ---
