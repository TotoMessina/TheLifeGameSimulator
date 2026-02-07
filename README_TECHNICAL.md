# TheLifeGameSimulator - Technical Documentation

## 📁 Project Structure

```
TheLifeGameSimulator-main/
├── index.html              # Main UI (773 lines)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline support
├── css/
│   └── style.css          # All styles (1662 lines)
└── js/
    ├── app.js             # App initialization & event listeners
    ├── game.js            # Core game logic (1684 lines)
    ├── state.js           # Global game state
    ├── ui.js              # UI rendering & updates
    ├── config.js          # Game data & constants
    ├── world.js           # World events & trends
    ├── phases.js          # Life phase management
    ├── business.js        # Business simulation
    ├── athletics.js       # Athletics system
    ├── freelancer.js      # Freelance work system
    ├── routine.js         # Daily routine management
    ├── school.js          # School system
    ├── db.js              # Supabase integration
    ├── audio.js           # Sound effects
    └── dev.js             # Developer mode
```

## 🏗️ Architecture

### Core Modules

#### `Game` (game.js)
Main game controller with lifecycle methods:
- `init()` - Initializes game state and UI
- `nextMonth()` - Processes monthly game tick
- `updateStat(key, amount)` - Updates player stats with trait modifiers
- `calculateFinancials()` - Computes income, expenses, net worth
- `checkAchievements()` - Awards trophies based on conditions

#### `UI` (ui.js)
Handles all rendering and user interface:
- `render()` - Updates all UI elements
- `log(msg, type)` - Adds event to timeline
- `openModal(id)` / `closeModal(id)` - Modal management
- `renderJobMarket()` - Displays available jobs
- `renderProfile()` - Shows character stats

#### `state` (state.js)
Global game state object containing:
- Player stats (health, happiness, intelligence, etc.)
- Financial data (money, portfolio, real estate)
- Relationships (friends, partner, children)
- Career progress (job, experience, education)
- Business & athletics data

#### `PhaseManager` (phases.js)
Manages life phases with contextual actions:
- **CHILDHOOD** (0-18): School, study, play, socialize
- **UNIVERSITY** (18-23): Study, part-time work, parties
- **ADULTHOOD** (23-65): Career, business, family

### Data Flow

```
User Action → Event Handler (app.js)
    ↓
Game Logic (game.js)
    ↓
State Update (state.js)
    ↓
UI Render (ui.js)
    ↓
Visual Feedback
```

## 🎮 Game Systems

### Career System
- 40+ jobs across 7 career tracks
- Experience-based progression
- Requirements: intelligence, health, degrees
- Performance reviews and promotions

### Financial System
- **Active Income**: Job salary
- **Passive Income**: Real estate, investments, royalties
- **Expenses**: Living costs, children, loans
- **Net Worth**: Cash + investments + real estate + business value

### Education System
- High school with GPA tracking
- University with student loans
- Professional courses and certifications
- Degrees unlock high-tier jobs

### Business System
- Start SaaS, E-commerce, or Mobile App companies
- Allocate resources (product, marketing, sales)
- Manage cash flow and growth
- Risk of bankruptcy

### Athletics System
- Training intensity levels (low, med, high)
- Stamina building
- Race registration (10K, Half Marathon, Marathon)
- Injury risk management

### Social System
- Friends with relationship tracking
- Partner progression (dating → living together → marriage)
- Children with monthly costs
- Networking for job opportunities

### World Events
- Economic trends (AI Boom, Housing Bubble, Crypto Crash)
- Temporary opportunities
- Global effects on salaries and markets

## 💾 Data Persistence

### Local Storage
- Auto-save every month
- Legacy system for next playthrough
- Settings and preferences

### Cloud Save (Supabase)
- Optional account creation
- Cross-device sync
- Leaderboard support

## 🎨 Theming

Dynamic themes based on wealth:
- **Poor Theme** (<$4k): Monochrome, newspaper texture
- **Normal Theme** ($4k-$100k): Default neon green
- **Rich Theme** (>$100k): Gold accents, serif fonts, glassmorphism

## 🔧 Development

### Running Locally
```bash
# Simple HTTP server
python -m http.server 8000
# or
npx serve
```

Open `http://localhost:8000`

### Dev Mode
Access with password in settings:
- Add money, max stats
- Time travel (advance years)
- Edit any stat directly

### Code Style
- ES6+ JavaScript (no transpilation)
- Vanilla CSS (no preprocessors)
- No build step required

## 📝 Key Functions Reference

### Game.updateStat(key, amount)
Updates player stat with trait modifiers and clamping.
```javascript
Game.updateStat('intelligence', 10); // +10 intelligence
Game.updateStat('money', -500);      // -$500
```

### Game.calculateFinancials()
Returns financial summary:
```javascript
{
  activeIncome: 5000,    // Job salary
  passiveIncome: 1200,   // Investments + rent
  expenses: 2000,        // Living costs
  netWorth: 150000       // Total assets
}
```

### UI.log(msg, type)
Adds event to timeline:
```javascript
UI.log("Got promoted!", "good");
UI.log("Lost job", "bad");
UI.log("Neutral event", "info");
```

## 🐛 Known Issues

- ~~Duplicate functions in game.js~~ ✅ FIXED
- ~~Malformed HTML in index.html~~ ✅ FIXED
- `nextMonth()` function is very long (needs refactoring)
- No unit tests
- Some edge cases in financial calculations

## 🚀 Future Improvements

1. **Refactoring**
   - Split `game.js` into smaller modules
   - Extract financial logic
   - Reduce `nextMonth()` complexity

2. **Testing**
   - Add unit tests for core functions
   - Integration tests for game flow

3. **Features**
   - More career paths
   - Stock market simulation
   - Multiplayer/social features

## 📄 License

[Add license information]

## 👥 Contributors

[Add contributors]
