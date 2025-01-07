import React, { useState, useEffect, useCallback } from 'react';
import './style.css';

import GameCanvas from './components/gameCanvas';

import playerImage from './assets/player.png';
import bulletImage from './assets/laserGreen.png';

const playerImg = new Image();
playerImg.src = playerImage;

const bulletImg = new Image();
bulletImg.src = bulletImage;

const App = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 200, y: 650 });
  const [bullets, setBullets] = useState([]);

  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);

  const animationFrameId = React.useRef(null);

  const playerSpeed = 10; // Define how fast the player moves per frame
  const bulletSpeed = 5; // Define how fast the bullet moves per frame

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
      animationFrameId.current = requestAnimationFrame(movePlayer);
    } else {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, [isMovingLeft, isMovingRight]);

  const moveBullets = useCallback(() => {
    setBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - bulletSpeed }))
        .filter((bullet) => bullet.y > 0)
    );

    animationFrameId.current = requestAnimationFrame(moveBullets);
  }, []);

  // Handle key down and key up events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        console.log('Started moving left');
        setIsMovingLeft(true);
        if (!animationFrameId.current) {
          movePlayer();
        }
      } else if (event.key === 'ArrowRight') {
        console.log('Started moving right');
        setIsMovingRight(true);
      } else if (event.key === ' ') {
        console.log('Fired a bullet');
        setBullets((prevBullets) => {
          return [
            ...prevBullets,
            { x: playerPosition.x + 15, y: playerPosition.y },
          ];
        });
        if (!animationFrameId.current) {
          moveBullets();
        }
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
  }, [movePlayer, isMovingLeft, isMovingRight, moveBullets]);

  const renderCanvas = (ctx, canvasWidth, canvasHeight) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the player at the updated position
    ctx.drawImage(playerImg, playerPosition.x, playerPosition.y, 40, 40);
    bullets.forEach((bullet) => {
      ctx.drawImage(bulletImg, bullet.x, bullet.y, 10, 20);
    });
  };

  return (
    <div align='center'>
      <GameCanvas onRender={renderCanvas} />
    </div>
  );
};

export default App;
