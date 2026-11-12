# 🌿 SET! - 4-of-a-Kind Multiplayer Card Game

An Android and Mobile Web multiplayer adaptation of the [SET! Card Game](https://github.com/Shadow-hunter58/Set.git), featuring a **Natural Earth & Tactile Card** design system with warm linen parchment, deep forest sage, terracotta clay, real-time cross-phone multiplayer, and native Android support.

---

## 🌟 What's New & Upgraded from the Original Python Script

1. **📱 Play Across Multiple Phones**:
   - The original `SET.py` was a single-computer CLI script where players had to share a keyboard.
   - This version lets **each player play from their own Android phone or mobile browser** simultaneously over local Wi-Fi or hotspot!
2. **🌿 Natural Earth & Tactile Design**:
   - Warm organic parchment & linen canvas (`#F4EFEA`, `#FAF7F2`) replacing harsh dark cyber neon.
   - Tactile ivory playing cards with soft stone borders, realistic paper depth, and elevation shadows.
   - Deep forest sage green (`#2D5A43`) action buttons, rich terracotta clay accents (`#C85A32`), and warm honey ochre highlights (`#D99B26`).
   - Circular tabletop HUD with organic wooden/stone avatar tokens and a physical wax-seal **SET! Slap Pile**.
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
   - On your turn, tap the odd card in your hand and tap **"PASS SELECTED CARD"** to pass it clockwise.
3. **Calling SET! & Winning**:
   - As soon as you hold 4 matching cards, SLAP the glowing center pile!
   - The game triggers a victory celebration with confetti, winner spotlight, and scoreboard.

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

The `android/` directory contains the complete native Android project:
- **Package**: `com.setgame.mobile`
- **Minimum SDK**: 24 (Android 7.0+)
- **Target SDK**: 34 (Android 14+)
- **Features**: Immersive fullscreen, hardware accelerated WebView, cleartext HTTP support for local LAN connections, offline bundled assets.

To open and run:
1. Open Android Studio.
2. Select **Open an Existing Project** and navigate to `android/`.
3. Connect your Android phone via USB (or start an emulator) and click **Run**.

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
├── public/                    # Frontend Mobile App (Luminous Deck)
│   ├── index.html             # Single-page UI with Stitch designs & modals
│   ├── style.css              # Cyberpunk tokens, glows & animations
│   ├── app.js                 # Game client, WebSocket sync & Web Audio synth
│   ├── icon.svg               # Vector icon
│   ├── manifest.json          # PWA configuration
│   └── sw.js                  # PWA service worker
├── server.js                  # Zero-dependency Node.js WebSocket & HTTP server
├── custom_categories.txt      # Custom decks storage (compatible with SET.py)
├── SET.py                     # Original Python game script
└── README.md                  # Documentation
```
