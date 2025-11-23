# Multiplication Trainer

A fun, interactive browser-based app for practicing multiplication facts (times tables). Built with SvelteKit 5 and runs entirely client-side.

## Features

- **Customizable Practice Sessions**
  - Choose player name
  - Select first factors (single number, range like "3-7", or list like "3,4,5")
  - Set second factor range (e.g., 1-12)
  - Adjust time per question (default: 5 seconds)
  - Set number of questions (default: 10)

- **Interactive Game Play**
  - Large, colorful question display
  - Touch-friendly numpad for mobile devices
  - Keyboard support for desktop
  - Visual countdown timer with color transitions (green → yellow → red)
  - Bonus points for fast answers (first 40% of time limit)

- **Scoring System**
  - 10 points per correct answer
  - 5 bonus points for answers within the bonus zone
  - Encouraging feedback messages
  - Sparkle animations for bonus achievements

- **Results & History**
  - Final score display with statistics
  - Expandable question-by-question review
  - Player score history saved in browser localStorage
  - Best score and games played tracking per player
  - "Play Again" option with pre-filled settings

## Getting Started

### Development

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

This creates a static site in the `build` directory that can be deployed to any static hosting service.

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **SvelteKit 5** - Latest stable version
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **adapter-static** - Client-side only SPA configuration
- **Browser localStorage** - Score history persistence

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── SetupScreen.svelte      # Configuration screen
│   │   ├── GameScreen.svelte       # Game play screen
│   │   ├── NumPad.svelte          # Touch-friendly number input
│   │   ├── ProgressBar.svelte     # Timer with color transitions
│   │   └── ResultsScreen.svelte   # Score display & review
│   ├── stores/
│   │   └── gameStore.ts           # Game state management
│   └── utils/
│       ├── scoring.ts             # Scoring utilities
│       └── storage.ts             # localStorage helpers
├── routes/
│   ├── +layout.js                 # SPA configuration
│   ├── +layout.svelte             # Global layout & styles
│   └── +page.svelte               # Main app component
└── app.css                        # Global styles
```

## Game Mechanics

### Bonus Calculation

- Players earn a 5-point bonus for answering correctly within the first 60% of the time limit
- For example, with a 5-second timer, answering by the 3-second mark earns the bonus
- Bonuses trigger special sparkle animations

### Score History

- Scores are saved per player in browser localStorage
- Each player can have up to 50 saved scores
- History includes: date, total score, all questions/answers, and game configuration

## Design Philosophy

- **Fun & Encouraging** - Bright colors, playful fonts, positive feedback
- **Mobile-First** - Touch-optimized with large buttons (48px+ touch targets)
- **Accessible** - Keyboard support, clear visual feedback
- **No Pressure** - Encouraging messages regardless of score

## Browser Support

Works on all modern browsers with localStorage support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
