# Space Wars

**Space Wars** is a simple 2D space shooter game built using React.js and HTML5 Canvas. The player controls a spaceship to shoot bullets and avoid enemies while scoring points.

---

## Features

- **Smooth Player Movement**: Use the arrow keys to move the spaceship left and right.
- **Shooting Bullets**: Press the spacebar to fire bullets at enemies.
- **Canvas Rendering**: The game is rendered using the HTML5 Canvas API for high-performance graphics.
- **Responsive Design**: The game adjusts smoothly to different screen sizes.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

---

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/space-wars.git
   cd space-wars
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start the Development Server**:

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to play the game.

---

## How to Play

- **Move Left**: Press the left arrow key (`←`).
- **Move Right**: Press the right arrow key (`→`).
- **Shoot**: Press the spacebar (`Space`).
- Avoid collisions with enemies to survive.

---

## File Structure

```plaintext
space-wars/
├── public/
│   ├── index.html
├── src/
│   ├── assets/
│   │   ├── player.png
│   │   ├── laserGreen.png
│   │   └── enemy.png
│   ├── components/
│   │   ├── GameCanvas.jsx
│   │   ├── Player.jsx
│   │   ├── Bullet.jsx
│   │   └── Enemy.jsx
│   ├── App.jsx
│   ├── style.css
│   └── index.js
├── .gitignore
├── package.json
├── README.md
└── package-lock.json
```

---

## Technologies Used

- **React.js**: A JavaScript library for building the user interface.
- **HTML5 Canvas**: For rendering 2D graphics.
- **CSS**: For styling the game interface.

---

## Future Enhancements

- Add enemy ships that spawn dynamically.
- Implement collision detection between bullets and enemies.
- Add a scoring system to track the player's progress.
- Create levels with increasing difficulty.
- Add background music and sound effects.

---

## Acknowledgments

- Inspired by classic space shooter arcade games.
- Built with React and love for web development.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the game.
