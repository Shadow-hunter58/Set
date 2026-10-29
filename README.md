# 🔥 SET! - 4-of-a-Kind Multiplayer Card Game

An Android and Mobile Web multiplayer adaptation of the [SET! Card Game](https://github.com/Shadow-hunter58/Set.git), featuring the **Luminous Deck** cyberpunk neon design created with Stitch, real-time cross-phone multiplayer, and native Android support.

---

## 🌟 What's New & Upgraded from the Original Python Script

1. **📱 Play Across Multiple Phones**:
   - The original `SET.py` was a single-computer CLI script where players had to share a keyboard.
   - This version lets **each player play from their own Android phone or mobile browser** simultaneously over local Wi-Fi or hotspot!
2. **✨ Stitch "Luminous Deck" Design**:
   - Dark obsidian surfaces (`#0b0e17`, `#10131c`), vibrant neon cyan (`#00f5d4`) and magenta glow accents.
   - Interactive 4-card player hand with tap-to-select, match highlights, and pass animations.
   - Circular radial table HUD showing all players' avatars, card counts, and live clockwise pass trail.
   - Center holographic **SET! Slap Pile** for lightning-fast reactions when 4 matching cards are collected.
3. **⚡ Zero External npm Dependencies**:
   - Pure Node.js standard library (`http`, `crypto`, `os`, `fs`) with a native RFC 6455 WebSocket engine.
   - Works 100% reliably in restricted, firewalled, or offline environments.
4. **📸 Instant QR Code Phone Join**:
   - Auto-detects your local Wi-Fi IP address.
   - Generates a live QR code on screen and in console so friends simply point their phone camera to join!
5. **🤖 Solo & Practice vs Smart AI Bots**:
   - Instant "Quick Play" matchmaking with intelligent bots that strategically collect matching cards.
6. **🔄 Offline Pass & Play Mode**:
   - If friends only have one phone between them, they can play offline on a single device with screen passing prompts.
7. **🎶 Web Audio API Sound Synthesizer**:
   - Built-in sound effects (card slide, pass whoosh, turn alert, slap, victory fanfare) and haptic vibrations without external audio files.
8. **📲 Android Native App + PWA**:
   - Complete Android Studio project with `WebView` in `android/`.
   - Installable Progressive Web App (`manifest.json` + `sw.js`) so friends can tap **"Install App"** on Android Chrome for an APK-like experience!

---

## 🚀 Quick Start (Play from Phone Right Now)

### 1. Start the Game Server
From this project directory:
```bash
node server.js
```
The terminal will display:
```
======================================================
  🔥 SET! 4-of-a-Kind Card Game Server is LIVE 🔥
======================================================
- Local Access:   http://localhost:3000
- Mobile / Wi-Fi: http://<your-ip>:3000
- Live QR Code:   http://<your-ip>:3000/api/qr
======================================================
```

### 2. Connect from Other Phones
- Connect the phones to the **same Wi-Fi network** (or phone hotspot).
- Open the Host screen and have friends **scan the QR code** with their phone camera, OR open `http://<your-ip>:3000` in their mobile browser.
- Tap **"Join Code"** and enter the 4-digit room PIN (e.g. `4092`).
- Each player sees only their own 4 cards on their phone!

---

## 🎮 How to Play

1. **The Goal**:
   - Collect **4 cards of the same item** (e.g. 4x Strawberries, 4x Teslas, 4x Lions).
2. **Passing Cards**:
   - Each player begins with 4 cards.
   - On your turn, tap the odd card in your hand and tap **"PASS SELECTED CARD"** (or double-tap the card) to pass it clockwise.
3. **Slapping the Pile & Reaction Frenzy**:
   - As soon as you collect 4-of-a-kind (or pass your final odd card), tap **"SLAP SET PILE!"** to claim **🥇 1st Place (SET Caller)**!
   - This instantly triggers an emergency **SLAP FRENZY** for all players!
   - **All other players (humans & AI bots) must immediately SLAP the center pile** to claim **🥈 2nd Place**, **🥉 3rd Place**, **4th Place**, etc.
   - The slowest player or anyone who fails to slap ends up in **🫏 Last Place (Donkey / Out)**!
4. **Arena Winner Board**:
   - Shows the complete standings podium with reaction times, winning hand showcase, and win streaks.

---

## 🃏 Card Categories & Custom Decks

The game includes presets and custom categories:
- **🍓 Fruits**: Apple, Mango, Cherry, Banana, Grape, Kiwi, Orange, Pineapple, Strawberry, Watermelon
- **🏎️ Cars**: BMW, Tesla, Audi, Honda, Ford, Toyota, Mercedes, Lamborghini, Ferrari, Bugatti
- **👾 Cyberpunk**: NeuralChip, LaserBlade, QuantumCore, HoverBike, PlasmaRifle, CyborgArm, HoloDeck, DataNode
- **🐾 Animals**: Tiger, Lion, Hippo, Monkey, Elephant, Panda, Fox, Wolf (from `custom_categories.txt`)
- **✨ Custom Decks**: Tap **"+ New Deck"** in the app to create your own category (saved to `custom_categories.txt`).

---

## 📱 Android Studio Project

The `app/` directory contains the complete native Android project:
- **Package**: `com.setgame.mobile`
- **Minimum SDK**: 24 (Android 7.0+)
- **Target SDK**: 34 (Android 14+)
- **Features**: Immersive fullscreen, hardware accelerated WebView, cleartext HTTP support for local LAN connections, offline bundled assets from `public/`.

To open and run:
1. Open Android Studio.
2. Select **Open an Existing Project** and navigate to this root folder.
3. Connect your Android phone via USB (or start an emulator) and click **Run**.

---

## 📂 Project Structure

```
SET-Card-Game/
├── app/                       # Android App Module
│   ├── build.gradle           # Configured to use public/ for assets
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/setgame/mobile/MainActivity.java
│       └── res/               # Android layouts and icons
├── public/                    # Unified Web Assets (Used by Android & Node.js)
│   ├── index.html             # Single-page UI
│   ├── style.css              # Cyberpunk tokens, glows & animations
│   └── app.js                 # Game client, WebSocket sync & Web Audio synth
├── server.js                  # Zero-dependency Node.js WebSocket & HTTP server
├── custom_categories.txt      # Custom decks storage
├── build.gradle               # Root Gradle build file
├── settings.gradle            # Gradle settings
└── README.md                  # Documentation
```