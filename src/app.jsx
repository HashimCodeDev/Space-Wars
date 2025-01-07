import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './style.css';

import GameCanvas from './components/gameCanvas';

import { isCollision } from './utils/isCollission';

import playerImage from './assets/player.png';
import playerLeft from './assets/playerLeft.png';
import playerRight from './assets/playerRight.png';
import playerDamaged from './assets/playerDamaged.png';
import bulletImage from './assets/laserGreen.png';
import enemyImage from './assets/enemyShip.png';
import rockImage from './assets/meteorBig.png';

const playerImg = new Image();
playerImg.src = playerImage;

const playerLeftImg = new Image();
playerLeftImg.src = playerLeft;

const playerRightImg = new Image();
playerRightImg.src = playerRight;

const bulletImg = new Image();
bulletImg.src = bulletImage;

const enemyImg = new Image();
enemyImg.src = enemyImage;

const rockImg = new Image();
rockImg.src = rockImage;

const App = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 200, y: 650 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [score, setScore] = useState(0);

  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);

  const playerAnimationFrameId = React.useRef(null);
  const bulletAnimationFrameId = React.useRef(null);
  const enemyAnimationFrameId = React.useRef(null);
  const rockAnimationFrameId = React.useRef(null);

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

  const scoreUpdation = useCallback(() => {
    setScore(score + 1);
  }, [score]);

  // Function to move the player
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

  // Function to move the bullets
  const moveBullets = useCallback(() => {
    setBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - bulletSpeed }))
        .filter((bullet) => bullet.y > 0)
    );

    bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);
  });

  // Function to spawn enemies
  const enemySpawner = useCallback(() => {
    const randomX = Math.floor(Math.random() * 350);
    setEnemies((prevEnemies) => [...prevEnemies, { x: randomX, y: 0 }]);
  }, []);

  // Function to move the enemies
  const moveEnemies = useCallback(() => {
    setEnemies((prevEnemies) =>
      prevEnemies
        .map((enemy) => ({ ...enemy, y: enemy.y + 2 }))
        .filter((enemy) => enemy.y < 700)
    );
    enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
  });

  // Function to spawn rocks
  const rockSpawner = useCallback(() => {
    const randomX = Math.floor(Math.random() * 350);
    setRocks((prevRocks) => [...prevRocks, { x: randomX, y: 0 }]);
  }, []);

  // Function to move the rocks
  const moveRocks = useCallback(() => {
    setRocks((prevRocks) =>
      prevRocks
        .map((rock) => ({ ...rock, y: rock.y + 2 }))
        .filter((rock) => rock.y < 700)
    );
    rockAnimationFrameId.current = requestAnimationFrame(moveRocks);
  });

  //Update the score
  useEffect(() => {
    const scoreInterval = setInterval(scoreUpdation, 1000);
    return () => {
      clearInterval(scoreInterval);
    };
  }, [scoreUpdation]);

  // Handle key down and key up events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the key pressed is the left or right arrow key
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

    // Handle key up event
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

  // Move the bullets
  useEffect(() => {
    if (bullets.length > 0) {
      bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);
    }
    return () => {
      cancelAnimationFrame(bulletAnimationFrameId.current);
    };
  }, [bullets, moveBullets]);

  // Spawn enemies every 5 seconds
  useEffect(() => {
    const enemySpawnerInterval = setInterval(enemySpawner, 5000);
    return () => {
      clearInterval(enemySpawnerInterval);
    };
  }, [enemySpawner]);

  // Move the enemies
  useEffect(() => {
    if (enemies.length > 0) {
      enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
    }
    return () => {
      cancelAnimationFrame(enemyAnimationFrameId.current);
    };
  }, [enemies, moveEnemies]);

  //Spawn Rock every 2 seconds
  useEffect(() => {
    const rockSpawnerInterval = setInterval(rockSpawner, 2000);
    return () => {
      clearInterval(rockSpawnerInterval);
    };
  }, [rockSpawner]);

  //Move the rocks
  useEffect(() => {
    if (rocks.length > 0) {
      rockAnimationFrameId.current = requestAnimationFrame(moveRocks);
    }
    return () => {
      cancelAnimationFrame(rockAnimationFrameId.current);
    };
  }, [rocks, moveRocks]);

  useEffect(() => {
    // Check for collision between bullets and enemies
    bullets.forEach((bullet) => {
      enemies.forEach((enemy) => {
        if (isCollision(bullet, enemy)) {
          setBullets((prevBullets) => prevBullets.filter((b) => b !== bullet));
          setEnemies((prevEnemies) => prevEnemies.filter((e) => e !== enemy));
          setScore(score + 50);
        }
      });
    });
  }, [bullets, enemies]);

  useEffect(() => {
    // Check for collision between player and enemies
    enemies.forEach((enemy) => {
      if (isCollision(playerPosition, enemy)) {
        alert('Game Over');
        setScore(0);
        setPlayerPosition({ x: 200, y: 650 });
        setBullets([]);
        setEnemies([]);
      }
    });
  }, [playerPosition, enemies]);

  useEffect(() => {
    // Check for collision between player and rocks
    rocks.forEach((rock) => {
      if (isCollision(playerPosition, rock)) {
        alert('Game Over');
        setScore(0);
        setPlayerPosition({ x: 200, y: 650 });
        setBullets([]);
        setRocks([]);
      }
    });
  }, [playerPosition, rocks]);

  useEffect(() => {
    // Check for collision between bullets and rocks
    bullets.forEach((bullet) => {
      rocks.forEach((rock) => {
        if (isCollision(bullet, rock)) {
          setBullets((prevBullets) => prevBullets.filter((b) => b !== bullet));
        }
      });
    });
  }, [bullets, rocks]);

  // Function to render the canvas
  const renderCanvas = (ctx, canvasWidth, canvasHeight) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the player at the updated position
    let currentImage = playerImg;

    if (isMovingLeft) {
      currentImage = playerLeftImg;
    }
    if (isMovingRight) {
      currentImage = playerRightImg;
    }
    ctx.drawImage(currentImage, playerPosition.x, playerPosition.y, 40, 40);
    bullets.forEach((bullet) => {
      ctx.drawImage(bulletImg, bullet.x, bullet.y, 10, 20);
    });
    enemies.forEach((enemy) => {
      ctx.drawImage(enemyImg, enemy.x, enemy.y, 40, 40);
    });
    rocks.forEach((rock) => {
      ctx.drawImage(rockImg, rock.x, rock.y, 40, 40);
    });
  };

  // Render the canvas
  return (
    <div
      className='Canvas'
      align='center'>
      <div className='ScoreBoard'>{score}</div>
      <GameCanvas onRender={renderCanvas} />
    </div>
  );
};

export default App;
