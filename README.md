# 🌿 SET! - 4-of-a-Kind Multiplayer Card Game

An Android, Mobile Web, and Cloud multiplayer adaptation of the [SET! Card Game](https://github.com/Shadow-hunter58/Set.git), featuring an organic **Natural Earth & Tactile Card** design system, full-table Slap Frenzy with podium rankings (1st, 2nd, 3rd...), smart AI bots, 24/7 cloud hosting support, and installable PWA / Native Android app capabilities.

---

## 🌟 Key Features & Improvements

1. **☁️ Play 24/7 in the Cloud (No Laptop Required)**:
   - Deployable to **Render, Railway, or Koyeb** with 1 click.
   - Automatically detects cloud domain headers (`RENDER_EXTERNAL_URL` / `x-forwarded-host`) to provide instant HTTPS & WSS links so friends can join using **cellular mobile data (5G/4G)** anywhere in the world!

2. **📱 Multi-Device Wi-Fi / Local Area Play**:
   - Auto-detects local Wi-Fi IP address and displays a live QR code so friends on the same network can point their phone camera and join instantly.

3. **🌿 Natural Earth & Tactile Design**:
   - Warm organic parchment & linen canvas (`#F4EFEA`, `#FAF7F2`) with soft stone card borders and elevation shadows.
   - Deep forest sage green (`#2D5A43`) action buttons, terracotta clay accents (`#C85A32`), and honey ochre highlights (`#D99B26`).
   - Circular tabletop HUD with wooden/stone avatar tokens and a physical wax-seal **SET! Slam Button**.

4. **⚡ Zero External npm Dependencies**:
   - Pure Node.js standard libraries (`http`, `crypto`, `os`, `fs`) with a custom RFC 6455 WebSocket engine.
   - Zero vulnerabilities, instant startup, and automatic port fallback (e.g. port 3000 ➔ 3005 if Docker is bound).

5. **💥 Slap Frenzy & Full Winner Leaderboard**:
   - When a player collects 4 matching cards and slams the center pile, a **Slap Frenzy** is initiated!
   - Other players and AI bots rush to slap the pile with sub-second reaction times to fight for **2nd, 3rd, and 4th place**.
   - Shows reaction times and a final podium leaderboard.

6. **🤖 Smart AI Bots & Player Size Selector**:
   - Choose between **4 Players**, **5 Players**, **6 Players (5 Bots)**, or **8 Players**.
   - Intelligent bots with unique personalities and distinct speed profiles (Ninja, Cat, Fox, Astro, Pixel, Wolf, Viper, Panda, Bear, Punk).

7. **📲 Progressive Web App (PWA) & Android App**:
   - Includes custom app icons (`icon-192.png`, `icon-512.png`, `icon.svg`), `manifest.json`, and service worker caching (`sw.js`).
   - 1-tap **"Install App"** button right in the header for a standalone fullscreen mobile app on Android Chrome and iOS Safari.
   - Complete Android Studio native project in `android/`.

8. **🔄 Offline Pass & Play & Bot Auto-Pilot**:
   - Single-phone offline multiplayer for passing a single device around.
   - Optional **Bot Pilot (Auto-Pilot)** mode for hands-free casual play.

---

## 🚀 Quick Start

### 1. Launch Locally (1-Click)
- On **Windows**: Double-click [`run_game.bat`](run_game.bat) — it automatically starts the server and launches your browser!
- From **Terminal / macOS / Linux**:
  ```bash
  node server.js
  ```
- Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Connect from Mobile Devices on Same Wi-Fi
- Connect your phone to the same Wi-Fi as your computer.
- Open the Host screen and scan the QR code, or open `http://<your-ip>:3000` on your mobile browser.
- Tap **"Join Code"** and enter the 4-digit room PIN.

### 3. Deploy 24/7 on Render (Free, Laptop Off)
1. Sign up at [Render.com](https://render.com) with GitHub.
2. Click **New +** ➔ **Web Service** ➔ connect `Shadow-hunter58/Set`.
3. Set **Start Command** to `node server.js` and select **Free** tier.
4. Render gives you a permanent `https://your-service.onrender.com` link that works on mobile data 24/7!

---

## 🎮 How to Play

1. **The Goal**:
   - Collect **4 cards of the same item** (e.g. 4x Strawberries, 4x Teslas, 4x Lions).
2. **Passing Cards**:
   - Each player begins with 4 cards.
   - On your turn, tap the odd card in your hand and click **"PASS SELECTED CARD"** to pass it to the next player.
   - *Tip*: Clicking "PASS" without selecting a card will automatically pass your odd card!
3. **Slapping SET! & Winner Standings**:
   - Once you hold 4 matching cards, SLAP the center pile immediately!
   - Rivals have 4 seconds to slap the pile — the faster you react, the higher your finishing rank (1st, 2nd, 3rd, 4th...).

---

## 🃏 Card Categories & Custom Decks

The game comes with built-in presets and full custom deck support:
- **🍓 Fruits**: Apple, Mango, Cherry, Banana, Grape, Kiwi, Orange, Pineapple, Strawberry, Watermelon
- **🏎️ Cars**: BMW, Tesla, Audi, Honda, Ford, Toyota, Mercedes, Lamborghini, Ferrari, Bugatti
- **👾 Cyberpunk**: NeuralChip, LaserBlade, QuantumCore, HoverBike, PlasmaRifle, CyborgArm, HoloDeck, DataNode
- **🐾 Animals**: Tiger, Lion, Hippo, Monkey, Elephant, Panda, Fox, Wolf
- **✨ Custom Decks**: Tap **"+ New Deck"** in the app to create your own category (stored in `custom_categories.txt`).

---

## 📱 Native Android Project

The `android/` directory contains a full Android Studio project:
- **Package**: `com.setgame.mobile`
- **Minimum SDK**: 24 (Android 7.0+)
- **Target SDK**: 34 (Android 14+)
- **Features**: Fullscreen immersive WebView, hardware acceleration, cleartext HTTP support for local LAN play.

---

## 📂 Project Structure

```
set-card-game/
├── android/                   # Native Android Studio Project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/setgame/mobile/MainActivity.java
│   │   └── assets/            # Bundled offline assets
│   ├── build.gradle
│   └── settings.gradle
├── public/                    # Frontend Mobile App
│   ├── index.html             # Single-page UI with modals and HUD
│   ├── style.css              # Earth-tone tactile theme & animations
│   ├── app.js                 # Game client, WebSocket sync & Web Audio synth
│   ├── icon.svg               # Vector app icon
│   ├── icon-192.png           # 192x192 PWA icon
│   ├── icon-512.png           # 512x512 PWA splash icon
│   ├── manifest.json          # PWA configuration
│   └── sw.js                  # PWA offline service worker
├── server.js                  # Zero-dependency Node.js WebSocket & HTTP server
├── run_game.bat               # 1-Click desktop game launcher
├── custom_categories.txt      # Custom decks storage (compatible with SET.py)
├── SET.py                     # Original Python game script
└── README.md                  # Comprehensive documentation
```
