# ✦ Aaru // Genshin Impact Profile Viewer & Team DPS Calculator ✦

**Aaru** is a modern, full-stack Genshin Impact theorycrafting application built with **Flask**, **Python**, **Tailwind CSS**, and the native **[gcsim](https://gcsim.app/)** combat simulation engine.

This application allows travelers to enter their in-game **UID**, fetch live character showcase builds directly from the **[Enka.Network API](https://enka.network/)**, inspect detailed artifact roll qualities, and execute 60-second Monte Carlo combat simulations to calculate precise team DPS and rotation breakdowns.

---

## 🌟 Key Features

### 1. 📡 Live Enka.Network Profile Integration
* **1-Click UID Lookup:** Enter any 9-digit Genshin Impact UID (e.g., `641874325`) to fetch current in-game showcased characters.
* **Character Build Inspector:**
  * Character Level, Ascension, and Friendship Level.
  * Constellation progression (`C0`–`C6`) with active indicator dots.
  * Talent levels with Crown of Insight indicators for Lv. 10+.
  * Equipped weapon details: Level, Refinement rank (`R1`–`R5`), Base ATK, and substats.
  * 5 Artifact slots (Flower, Plume, Sands, Goblet, Circlet) with primary stats, substats, Crit Value (CV) ratings, and active 2-piece / 4-piece set bonuses.
* **Calculated Combat Attributes:** Accurately calculates Max HP, Total ATK, Total DEF, Elemental Mastery (EM), CRIT Rate, CRIT DMG, Energy Recharge (ER), and Elemental DMG Bonuses.
* **Player Summary Card:** Shows Adventure Rank (AR) with rarity styling, World Level, Achievement count, Spiral Abyss progress, and regional server badges (**NA**, **EU**, **Asia**, **SAR**, **CN**).
* **Recent Accounts History:** Automatically caches searched profiles in `localStorage` for rapid re-inspection.

### 2. ⚔️ Realistic Team DPS Simulation (via `gcsim`)
* **Embedded Simulation Binary:** Bundles the native Go-based `gcsim` combat simulator (`bin/gcsim`).
* **Automated Rotation Synthesis:** Dynamically constructs optimal team skill/burst sequences, swap timings, and buff alignments based on the characters in your party.
* **Standard Combat Benchmark:** Runs multi-iteration Monte Carlo simulations over 60 seconds against standard Level 100 Ruin Guard targets (10% elemental resistance, Floor 12 benchmark).
* **Deep Metric Breakdown:**
  * **Team Mean DPS** and **Total 60s Damage Output**.
  * **Character Contribution:** Percentage and raw DPS breakdown per party member.
  * **Damage by Source:** Normal Attacks, Charged Attacks, Plunge, Elemental Skills, Bursts, and Elemental Reactions (Vaporize, Melt, Swirl, Overload, Electro-Charged, etc.).
* **Smart Live Caching:** Caches API payloads locally in `data/live_cache_<uid>.json` to prevent API rate limits and provide instant load times.

### 3. ✨ Celestial Teyvat & DoodleUI Aesthetics
* **Cosmic Leyline Atmosphere:** Deep midnight blue canvas (`#060913`) featuring an interactive HTML5 starfield canvas with twinkling particles and ambient elemental nebulae.
* **Procedural Sketch Tabs:** Custom hand-drawn underline tabs powered by the DoodleUI animation engine, dynamically sliding between tabs with organic wavy SVG paths.
* **Glassmorphic UI Cards:** Frosted glassmorphism (`backdrop-blur-2xl`) bordered with golden Celestia filigree accents.
* **Elemental Rune Emblems:** Interactive quick-access elemental runes for all 7 elements (🪨 Geo, 💧 Hydro, ⚡ Electro, 🌿 Dendro, 🔥 Pyro, ❄️ Cryo, 🌪️ Anemo).
* **Quick Presets:** Instant test accounts for one-click demonstrations across different regional servers.

### 4. 🧩 React & shadcn Project Compatibility
* Includes ready-to-use React / TypeScript component primitives in `components/ui/` (`tabs.tsx`, `mercury-login.tsx`, `neural-access-login.tsx`) and `lib/utils.ts` for frontend expansion into Next.js or Vite.

---

## 📁 Project Structure

```plaintext
GenshinImpactDamageCalc/
├── app.py                     # Flask web server and API routing
├── dps_calculator.py          # gcsim simulation builder, rotation solver & metrics parser
├── enka_parser.py             # Enka.Network API client, character & artifact parser
├── bin/
│   └── gcsim                  # Native compiled gcsim combat simulator binary
├── data/
│   ├── characters.json        # Character skill, costume, and avatar asset definitions
│   ├── gcsim_registry.json    # gcsim character/weapon/artifact key mappings
│   ├── loc.json               # English localization hash mappings
│   └── live_cache_*.json      # Cached Enka API response files
├── static/
│   ├── css/
│   │   └── style.css          # Glassmorphic styles, element badges, and responsive CSS
│   └── js/
│       ├── app.js             # Profile viewer controller & character build renderer
│       ├── home.js            # Homepage search controller & recent accounts table
│       └── sketch-tabs.js     # Procedural hand-drawn wavy underline tab engine
├── templates/
│   ├── home.html              # Celestia-themed search homepage & recent accounts
│   ├── profile.html           # Full character build showcase & stats dashboard
│   ├── login.html             # Sci-fi liquid mercury login screen
│   └── index.html             # Redirect / fallback gateway
├── components/ui/             # React / shadcn UI components
│   ├── tabs.tsx               # DoodleUI animated sketch tabs
│   ├── demo.tsx               # Liquid mercury gooey physics demo
│   └── tabs-utils/            # Supporting hooks and rough SVG generators
├── lib/
│   └── utils.ts               # Standard shadcn `cn` utility (clsx + tailwind-merge)
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Python 3.10+**
* **macOS / Linux** (the bundled `bin/gcsim` binary is compiled for Unix-based architectures)

### 1. Installation

Clone this repository and install the Python dependencies:

```bash
git clone https://github.com/your-username/GenshinImpactDamageCalc.git
cd GenshinImpactDamageCalc

# Install required Python packages
pip install flask flask-cors requests
```

Ensure the `bin/gcsim` executable has execution permissions:
```bash
chmod +x bin/gcsim
```

### 2. Running the Application

Start the Flask development server:

```bash
python3 app.py
```

The application will start on:
```plaintext
http://localhost:5050
```

*Note: You can configure a custom port using the `PORT` environment variable:*
```bash
PORT=8080 python3 app.py
```

---

## 🔌 API Reference

### `GET /`
Serves the homepage containing the UID search hero card, quick presets, and recent accounts table.

### `GET /profile/<uid>`
Renders the full character build showcase and combat attributes for the specified UID.

### `POST /api/player`
Fetches and parses live data from Enka.Network.

* **Request Body:**
  ```json
  {
    "uid": "641874325"
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "player": {
      "nickname": "Traveler",
      "level": 60,
      "signature": "Ad Astra Abyssosque",
      "worldLevel": 9,
      "achievements": 1240,
      "towerFloor": 12,
      "towerStar": 36
    },
    "characters": [ ... ]
  }
  ```

### `POST /api/calculate-dps`
Executes an automated `gcsim` combat simulation for a 4-character team and returns DPS calculations.

* **Request Body:**
  ```json
  {
    "uid": "641874325",
    "team": [ ...character objects... ]
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "teamDps": 68420,
    "totalDamage": 4105200,
    "duration": 60,
    "characters": [
      {
        "name": "Kamisato Ayaka",
        "dps": 42150,
        "dpsPercent": 61.6,
        "element": "Cryo"
      }
    ],
    "sourceBreakdown": { ... }
  }
  ```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3, Flask, Werkzeug, Flask-CORS |
| **Simulation Engine** | [gcsim](https://gcsim.app/) (Go-based Monte Carlo Genshin Impact Simulator) |
| **Data Source** | [Enka.Network Public API](https://enka.network/) |
| **Frontend** | Jinja2 Templates, HTML5 Canvas, Tailwind CSS, Lucide Icons |
| **Animations** | Procedural SVG Rough Underlines (`sketch-tabs.js`), SVG Filter Gooey Liquid Physics |
| **Design System** | Genshin Celestia Glassmorphism, Space Mono, Cinzel Serif, Plus Jakarta Sans |

---

## 📜 Disclaimer & Credits

* **Non-Commercial Theorycraft Tool:** This project is an unofficial, non-commercial theorycrafting application and is not affiliated with or endorsed by **miHoYo / HoYoverse**.
* **Game Assets & Trademarks:** Genshin Impact and all related media assets, character designs, and logos are property and copyright of **© miHoYo / COGNOSPHERE PTE. LTD.**
* **Community APIs & Tools:**
  * Powered by the public API provided by [Enka.Network](https://enka.network/).
  * Simulation capabilities powered by the open-source [gcsim project](https://github.com/genshinsim/gcsim).
