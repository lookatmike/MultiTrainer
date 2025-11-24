# CLAUDE.md - Project Context for AI Sessions

## Project Overview

**MultiTrainer** is a browser-based multiplication practice app built with SvelteKit 5. It runs entirely client-side (no server component) and uses browser localStorage for persistence.

### Core Purpose

Help users practice multiplication facts with:

- Customizable practice sessions
- Real-time feedback with visual timer
- Scoring system with speed bonuses
- Historical score tracking per player

### Tech Stack

- **SvelteKit 5** (latest stable) with TypeScript
- **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$bindable`)
- **adapter-static** for SPA mode (client-side only)
- **Vite 7** as build tool
- **Browser localStorage** for data persistence
- **No external UI libraries** - custom CSS with animations

## Architecture

### SPA Configuration

**Key Files:**

- `svelte.config.js` - Uses `@sveltejs/adapter-static` with `fallback: '200.html'`
- `src/routes/+layout.js` - Sets `export const ssr = false` and `export const prerender = true`
- `vite.config.ts` - Configures `allowedHosts: true` for network access

This setup ensures the app runs entirely in the browser without SSR.

### State Management

**Centralized Store:** `src/lib/stores/gameStore.ts`

Uses Svelte's writable stores with a factory pattern (`createGameStore()`).

**Key stores:**

- `gameState` - 'SETUP' | 'PLAYING' | 'RESULTS'
- `config` - Current game configuration
- `session` - Active game session with questions and score
- `currentAnswer` - User's current input
- `timeRemaining` - Countdown timer

**Derived stores:**

- `currentQuestion` - Automatically derived from session

**Key methods:**

- `startGame(config)` - Generates questions and transitions to PLAYING
- `submitAnswer(answer, timeUsed)` - Scores answer and updates session
- `nextQuestion()` - Advances to next question or RESULTS
- `reset(keepConfig)` - Returns to SETUP with optional config preservation

### Component Architecture

**Main App Flow:** `src/routes/+page.svelte`

Uses a state machine pattern with conditional rendering based on `$gameState`. Shows one of three screens at a time: SetupScreen, GameScreen, or ResultsScreen.

**Component Hierarchy:**

```
+page.svelte (main router)
├── SetupScreen.svelte
│   └── Form inputs for game configuration
├── GameScreen.svelte
│   ├── ProgressBar.svelte (timer with color transitions)
│   └── NumPad.svelte (touch-friendly input)
└── ResultsScreen.svelte
    └── Expandable question detail list
```

### Data Models

**GameConfig:**

```typescript
{
  playerName: string
  firstFactors: number[]        // e.g., [3,4,5] or [7]
  secondFactorRange: [min, max] // e.g., [1, 12]
  timePerQuestion: number        // seconds, default 5
  totalQuestions: number         // default 10
}
```

**Question:**

```typescript
{
  factor1: number;
  factor2: number;
  correctAnswer: number;
  playerAnswer: number | null;
  timeUsed: number; // seconds taken
  bonus: number; // 0 or 5 (flexible for future changes)
}
```

**Important:** `bonus` is a number, not boolean, for flexibility in future bonus structures.

### Game Flow

1. **SETUP Phase:**

   - User enters configuration
   - Previous config is auto-loaded if returning from results
   - Input parsing handles: "7", "3-7", "3,4,5" formats
   - Validates all inputs before starting

2. **PLAYING Phase:**

   - Questions generated using "deck of cards" algorithm (see below)
   - Timer starts at `timePerQuestion` and counts down
   - Color transitions: green (60%+) → yellow (30-60%) → red (<30%)
   - Bonus zone active during first 60% of time (last 40% elapsed)
   - User can input via NumPad (touch) or keyboard
   - Submit answer or timeout triggers scoring

3. **Scoring Logic:**

   - **Base:** 10 points for correct answer
   - **Bonus:** 5 points if answered correctly within first 60% of time
   - **Example:** With 5s timer, answering at 3.1s (or more remaining) = bonus
   - Score calculation in `submitAnswer()` method

4. **RESULTS Phase:**
   - Display total score with encouraging message
   - Show statistics (correct count, bonus count)
   - Expandable question-by-question review
   - Save to localStorage
   - "Play Again" returns to SETUP with config preserved

## Key Implementation Details

### Timer Implementation (GameScreen.svelte)

The timer uses `setInterval` to update every 100ms for smooth progress bar animation. Key details:

- Updates every 100ms for smooth progress bar
- Bonus threshold: `timeRemaining >= totalTime * 0.6`
- Always clean up interval in `onDestroy()`

### First Factor Input Parsing (SetupScreen.svelte)

Three formats supported:

1. **Single number:** "7" → `[7]`
2. **Range:** "3-7" → `[3,4,5,6,7]`
3. **List:** "3,4,5" → `[3,4,5]`

**Deduplication:** Duplicate values are automatically removed while preserving input order. For example, "3,5,3,7" becomes `[3,5,7]`.

When returning to setup, factors are formatted back intelligently:

- Continuous ranges display as "3-7"
- Non-continuous display as "3,5,7"

### Question Generation - "Deck of Cards" Algorithm (gameStore.ts)

Questions are generated to avoid repeats, similar to dealing from a deck of cards:

**Algorithm:**

1. Generate all possible questions (every firstFactor × every secondFactor in range)
2. Shuffle the complete deck using Fisher-Yates algorithm
3. Deal questions from the shuffled deck
4. If more questions needed than available, reshuffle and continue dealing

**Key behaviors:**

- `x×y` and `y×x` are treated as different questions (both exist in the deck)
- No repeats within a single "pass" through the deck
- If `totalQuestions > possible questions`, the deck reshuffles after exhaustion
- Example: 12 possible questions, requesting 25 → shows all 12, reshuffles, shows 13 more

This is implemented in the `generateQuestions()` function in `gameStore.ts`.

### LocalStorage Persistence (src/lib/utils/storage.ts)

**Storage key:** `'multitrainer-history'`

**Structure:**

```typescript
PlayerHistory[] = [
  {
    playerName: "John",
    scores: [
      {
        date: timestamp,
        totalScore: number,
        questions: Question[],
        config: GameConfig
      }
    ]
  }
]
```

- Stores up to 50 scores per player
- New scores added to front (most recent first)
- Handles localStorage errors gracefully
- Used for displaying best score and game count

### Styling & Accessibility

**Global Background:** `src/app.css`

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**WCAG AAA Compliance:**

- All text on gradient background is white (#ffffff)
- Text shadows for depth: `text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3)`
- Factor numbers in questions: bright yellow (#fde047) for visibility
- Answer input: bright green (#4ade80)
- Minimum 7:1 contrast ratio throughout

**Typography:**

- Google Font: Nunito (playful, readable)
- Loaded in `+layout.svelte`

**Animations:**

- Question transitions: slide-in from top
- Correct/incorrect feedback: full-screen overlay with bounce-in
- Bonus achievement: sparkle effect with rotation
- Button interactions: translateY on hover, scale on active
- Progress bar: smooth width transitions, pulse effect in bonus zone

**Mobile Optimization:**

- Touch targets minimum 48px (60-90px on NumPad)
- Font size 16px on inputs (prevents iOS zoom)
- Responsive breakpoint at 640px
- `-webkit-tap-highlight-color: transparent` on buttons

## Common Modifications

### Adding New Bonus Tiers

**File:** `src/lib/stores/gameStore.ts` - `submitAnswer()` method

Currently uses a single threshold at 60% time remaining for 5-point bonus. To add multiple tiers, modify the bonus calculation logic to check multiple percentage thresholds (e.g., 80%+ = 10pts, 60%+ = 5pts).

### Changing Color Scheme

**Main gradient:** `src/app.css` - body background
**Primary buttons:** Look for `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`
**Text colors:** Search for `#ffffff` (white text on gradient)

Remember to maintain WCAG AAA contrast (7:1 minimum) when changing colors.

### Adding Question Types (Beyond Multiplication)

1. Add an `operation` field to the data model in `gameStore.ts`
2. Create an operations lookup to calculate correct answers in `generateQuestions()`
3. Update the question display in `GameScreen.svelte` to show different operator symbols

### Adding Sound Effects

Use Web Audio API or install an audio package. Create a `playSound()` function in `GameScreen.svelte` that plays different sounds for correct/incorrect/bonus events. Add sound files to `static/sounds/` directory.

### Exporting Score History

Add an export function in `ResultsScreen.svelte` that retrieves player history, converts to JSON, creates a Blob, and triggers a download via a temporary anchor element.

## Testing Strategy

### Manual Testing Checklist

**Setup Screen:**

- [ ] First factor parsing: "7", "3-7", "3,4,5"
- [ ] Range validation (min < max)
- [ ] Previous config restoration after "Play Again"
- [ ] Player stats display (best score, game count)

**Game Screen:**

- [ ] Timer countdown (visual and numeric)
- [ ] Bonus zone indicator appearance/disappearance
- [ ] NumPad button interactions
- [ ] Keyboard input (0-9, Backspace, Enter)
- [ ] Correct/incorrect feedback overlays
- [ ] Bonus sparkle animation
- [ ] Question transitions
- [ ] Timeout handling (when timer reaches 0)

**Results Screen:**

- [ ] Score calculation accuracy
- [ ] Question detail expansion
- [ ] Bonus badge display
- [ ] Score persistence in localStorage
- [ ] "Play Again" with config restoration

**Mobile Testing:**

- [ ] Touch targets (easy to tap)
- [ ] NumPad usability
- [ ] Text readability (no zoom on input focus)
- [ ] Landscape/portrait orientations

**Accessibility:**

- [ ] Keyboard navigation
- [ ] Color contrast (use browser DevTools)
- [ ] Text shadows for readability

### Building for Production

```bash
npm run build
```

Creates static site in `build/` directory.

**Important:** After build, test the production build locally:

```bash
npm run preview
```

This serves the built files to ensure everything works without the dev server.

### Deployment

The app is a static site and can be deployed to:

- **Netlify:** Drag/drop `build/` folder
- **Vercel:** Connect GitHub repo
- **GitHub Pages:** Push `build/` to `gh-pages` branch
- **Any static host:** Upload `build/` contents

**Configuration note:** The `fallback: '200.html'` in svelte.config.js ensures client-side routing works. Some hosts may need configuration to serve this for 404s.

## Development Server

**Standard:**

```bash
npm run dev
```

**Network access (for mobile testing):**

```bash
npm run dev -- --host
```

or its alias:

```bash
npm run dev:host
```

Access via local IP (e.g., http://192.168.1.54:5173) or hostname (e.g., http://medfielder:5173).

The `allowedHosts: true` in vite.config.ts allows any hostname.

**Note:** The `dev:host` script is a convenience alias for `vite dev --host`. The `npm run dev -- --host` syntax works in bash/sh shells but requires quoting in PowerShell: `npm run dev '--' '--host'`.

## Known Limitations & Future Enhancements

### Current Limitations

- No account system (localStorage only)
- No data sync across devices
- No difficulty progression
- Single operation type (multiplication only)
- Fixed bonus structure (5 points)

### Enhancement Ideas

1. **Progressive Difficulty:** Adapt factor ranges based on performance
2. **Achievements:** Badges for streaks, perfect scores, speed milestones
3. **Multiplayer:** Challenge mode with shared room codes
4. **Practice Modes:** Focus on missed questions, time trial mode
5. **Statistics Dashboard:** Charts showing improvement over time
6. **Custom Themes:** Let users choose color schemes
7. **Sound Effects:** Audio feedback (configurable on/off)
8. **Division/Addition:** Extend to other operations

## Debugging Tips

### Common Issues

**Timer doesn't stop after answer:**

- Check that `stopTimer()` is called in `handleSubmit()` and `handleTimeout()`
- Verify `timerInterval` is being set and cleared properly
- Look for multiple timer intervals running (use browser DevTools)

**Config not preserved on "Play Again":**

- Check `game.reset(true)` is called (not `false`)
- Verify `onMount()` in SetupScreen reads from `$config`
- Console.log the config to see if it's populated

**NumPad not responding on mobile:**

- Check for JavaScript errors in mobile browser console
- Verify `-webkit-tap-highlight-color: transparent` is set
- Test that event handlers are attached (add console.logs)

**Scores not saving:**

- Check browser console for localStorage errors
- Verify `saveScore()` is called in ResultsScreen's `onMount()`
- Check that localStorage is enabled (some browsers block in private mode)

**Animations not smooth:**

- Check that CSS `transition` properties are set
- Verify browser supports CSS animations (should be universal)
- Look for performance issues (too many elements animating)

### Browser DevTools

**Check state:**
Temporarily add a dev-only block that displays store values as JSON in a `<pre>` tag for debugging.

**localStorage inspection:**

1. Open DevTools → Application tab
2. Storage → Local Storage → your domain
3. Look for `multitrainer-history` key

## File Reference

### Critical Files (Don't Break These)

- `src/lib/stores/gameStore.ts` - Core state management
- `src/routes/+layout.js` - SPA configuration
- `svelte.config.js` - Build adapter setup
- `src/app.css` - Global styles and gradient

### Component Files

- `src/lib/components/SetupScreen.svelte` - 236 lines
- `src/lib/components/GameScreen.svelte` - 358 lines
- `src/lib/components/ResultsScreen.svelte` - 337 lines
- `src/lib/components/NumPad.svelte` - 108 lines
- `src/lib/components/ProgressBar.svelte` - 104 lines

### Utility Files

- `src/lib/utils/storage.ts` - localStorage operations
- `src/lib/utils/scoring.ts` - Score calculation and messages

### Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration (allowedHosts)

## Summary for Future Sessions

**Quick start for modifications:**

1. Run `npm install` if first time
2. Start dev server: `npm run dev` (or `npm run dev:host` for network access)
3. Find the relevant component in `src/lib/components/`
4. Understand state flow via `src/lib/stores/gameStore.ts`
5. Test changes in browser (remember mobile testing!)
6. Check color contrast with DevTools if changing colors

**Architecture mental model:**

- Single store (`gameStore`) manages all state
- Three screens, one at a time (state machine pattern)
- Questions generated once at game start
- Timer updates in 100ms intervals
- localStorage saves on results screen mount
- All styling is custom CSS (no library)

**When in doubt:**

- Read the gameStore.ts first - it's the source of truth
- Check WCAG contrast if changing colors
- Test mobile interactions carefully
- Preserve the `bonus: number` flexibility
- Keep animations subtle and performant

This app is designed to be simple, performant, and maintainable. Don't over-engineer additions - keep the same spirit of straightforward, focused functionality.
