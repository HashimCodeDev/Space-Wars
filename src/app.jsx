import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './style.css';

import GameCanvas from './components/gameCanvas';

import playerImage from './assets/player.png';
import bulletImage from './assets/laserGreen.png';
import enemyImage from './assets/enemyShip.png';

const playerImg = new Image();
playerImg.src = playerImage;

const bulletImg = new Image();
bulletImg.src = bulletImage;

const enemyImg = new Image();
enemyImg.src = enemyImage;

const App = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 200, y: 650 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);

  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);

  const playerAnimationFrameId = React.useRef(null);
  const bulletAnimationFrameId = React.useRef(null);
  const enemyAnimationFrameId = React.useRef(null);

  const playerSpeed = 10; // Define how fast the player moves per frame
  const bulletSpeed = 5; // Define how fast the bullet moves per frame

  //Creates a new bullet when the space key is pressed
  const newBullet = useMemo(
    () => ({
      x: playerPosition.x + 15,
      y: playerPosition.y,
    }),
    [playerPosition.x]
  );

  const movePlayer = useCallback(() => {
    setPlayerPosition((prevPosition) => {
      let newX = prevPosition.x;
      if (isMovingLeft && newX > 0) {
        newX -= playerSpeed;
        console.log('Moving left');
      }
      if (isMovingRight && newX < 360) {
        newX += playerSpeed;
        console.log('Moving right');
      }
      return { ...prevPosition, x: newX };
    });
    if (isMovingLeft || isMovingRight) {
      playerAnimationFrameId.current = requestAnimationFrame(movePlayer);
    } else {
      cancelAnimationFrame(playerAnimationFrameId.current);
      playerAnimationFrameId.current = null;
    }
  }, [isMovingLeft, isMovingRight]);

  const moveBullets = useCallback(() => {
    setBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - bulletSpeed }))
        .filter((bullet) => bullet.y > 0)
    );

    bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);
  });

  const enemySpawner = useCallback(() => {
    const randomX = Math.floor(Math.random() * 350);
    setEnemies((prevEnemies) => [...prevEnemies, { x: randomX, y: 0 }]);
  }, []);

  const moveEnemies = useCallback(() => {
    setEnemies((prevEnemies) =>
      prevEnemies
        .map((enemy) => ({ ...enemy, y: enemy.y + 2 }))
        .filter((enemy) => enemy.y < 700)
    );
    enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
  });

  // Handle key down and key up events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        if (!isMovingRight) {
          console.log('Started moving left');
          setIsMovingLeft(true);
          if (!playerAnimationFrameId.current) {
            movePlayer();
          }
        }
      } else if (event.key === 'ArrowRight') {
        if (!isMovingLeft) {
          console.log('Started moving Right');
          setIsMovingRight(true);
          if (!playerAnimationFrameId.current) {
            movePlayer();
          }
        }
      }
      if (event.key === ' ') {
        console.log('Fired a bullet');
        setBullets((prevBullets) => [...prevBullets, newBullet]);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowLeft') {
        setIsMovingLeft(false);
        console.log('Stopped moving left');
      } else if (event.key === 'ArrowRight') {
        setIsMovingRight(false);
        console.log('Stopped moving right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start moving the player once key is pressed
    movePlayer();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [movePlayer, isMovingLeft, isMovingRight]);

  useEffect(() => {
    if (bullets.length > 0) {
      bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);
    }
    return () => {
      cancelAnimationFrame(bulletAnimationFrameId.current);
    };
  }, [bullets, moveBullets]);

  useEffect(() => {
    const enemySpawnerInterval = setInterval(enemySpawner, 5000);
    return () => {
      clearInterval(enemySpawnerInterval);
    };
  }, [enemySpawner]);

  useEffect(() => {
    if (enemies.length > 0) {
      enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
    }
    return () => {
      cancelAnimationFrame(enemyAnimationFrameId.current);
    };
  }, [enemies, moveEnemies]);

  const renderCanvas = (ctx, canvasWidth, canvasHeight) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the player at the updated position
    ctx.drawImage(playerImg, playerPosition.x, playerPosition.y, 40, 40);
    bullets.forEach((bullet) => {
      ctx.drawImage(bulletImg, bullet.x, bullet.y, 10, 20);
    });
    enemies.forEach((enemy) => {
      ctx.drawImage(enemyImg, enemy.x, enemy.y, 40, 40);
    });
  };

  return (
    <div align='center'>
      <GameCanvas onRender={renderCanvas} />
    </div>
  );
};

export default App;
