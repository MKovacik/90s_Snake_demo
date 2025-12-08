# 🐍 Nokia Snake Game

A nostalgic browser-based recreation of the classic Nokia 3310 Snake game. Play it right in your browser with no installation required!

## 🎮 Play Now

**[Play the Game](https://mkovacik.github.io/90s_Snake_demo/)**

## ✨ Features

- 🎨 **Authentic Nokia 3310 UI** - Complete with phone frame, keypad, and LCD green display
- 🕹️ **Multiple Controls** - Arrow keys, on-screen buttons, and swipe gestures
- 📱 **Mobile Friendly** - Touch controls and responsive design
- 🎚️ **Difficulty Levels** - Slow, Normal, and Fast speeds
- 🔊 **Retro Sound Effects** - Nokia-style beeps using Web Audio API
- ⏸️ **Pause & Restart** - Full game state management
- 🏆 **Score Tracking** - Current score and session high score

## 🎯 How to Play

### Desktop
- **Arrow Keys** - Control snake direction
- **P or ESC** - Pause/Resume game
- **M** - Mute/Unmute sound
- **SPACE** - Restart after game over

### Mobile
- **Swipe** - Change direction on the game screen
- **D-Pad Buttons** - Use the on-screen navigation buttons
- **Tap** - Restart after game over

## 🎮 Game Rules

1. Guide the snake to eat the food (dark squares)
2. Each food item adds 10 points and grows the snake
3. Avoid hitting the walls or your own tail
4. The game ends on collision - try to beat your high score!

## 🛠️ Technology

This game is built with pure vanilla technologies:
- **HTML5** - Structure and Canvas element
- **CSS3** - Nokia phone frame styling and responsive design
- **JavaScript** - Game logic and Web Audio API for sounds

No frameworks, no dependencies, no build tools required!

## 📁 Project Structure

```
/
├── index.html    # Main game page
├── style.css     # Nokia phone styling
├── game.js       # Game logic
└── README.md     # This file
```

## 🚀 Local Development

Simply open `index.html` in a modern web browser, or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Then open http://localhost:8000
```

## 🌐 Deployment

This project is deployed via GitHub Pages. To deploy your own:

1. Fork this repository
2. Go to **Settings** → **Pages**
3. Set Source to "Deploy from a branch"
4. Select **main** branch and **/ (root)** folder
5. Save and wait for deployment
6. Access at `https://[username].github.io/90s_Snake_demo/`

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| LCD Light | `#9BBC0F` | Screen background |
| LCD Dark | `#0F380F` | Snake & food |
| Phone Body | `#3d5a80` | Nokia frame |
| Phone Dark | `#293241` | Frame accents |

## 📱 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile Chrome
- ✅ Mobile Safari

## 📜 License

This project is open source and available for educational purposes.

## 🙏 Credits

Inspired by the legendary Nokia 3310 Snake game that defined mobile gaming in the late 90s and early 2000s.

---

Made with 💚 for retro gaming enthusiasts
