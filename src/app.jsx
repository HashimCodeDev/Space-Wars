import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { throttle } from 'lodash/fp';
import './style.css';

import GameCanvas from './components/gameCanvas';

import { isCollision } from './utils/isCollision';

import playerImage from './assets/player.png';
import playerLeft from './assets/playerLeft.png';
import playerRight from './assets/playerRight.png';
import playerDamaged from './assets/playerDamaged.png';

import playerBulletImage from './assets/laserGreen.png';
import playerBulletHitImage from './assets/laserGreenShot.png';
import enemyBulletImage from './assets/laserRed.png';
import enemyBulletHitImage from './assets/laserRedShot.png';

import enemyImage from './assets/enemyShip.png';
import rockImage from './assets/meteorBig.png';
const preloadImage = (src) => {
  const img = new Image();
  img.src = src;

  //Handle errors during loading
  img.onerror = () => {
    console.error(`Failed to load image: ${src}`);
  };

  return img;
};

const playerImg = preloadImage(playerImage);
const playerLeftImg = preloadImage(playerLeft);
const playerRightImg = preloadImage(playerRight);
const playerDamagedImg = preloadImage(playerDamaged);
const bulletImg = preloadImage(playerBulletImage);
const bulletHitImg = preloadImage(playerBulletHitImage);
const enemyImg = preloadImage(enemyImage);
const rockImg = preloadImage(rockImage);

const App = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 200, y: 650 });
  const [playerBullets, setPlayerBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState([]);

  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const playerAnimationFrameId = React.useRef(null);
  const bulletAnimationFrameId = React.useRef(null);
  const enemyAnimationFrameId = React.useRef(null);
  const rockAnimationFrameId = React.useRef(null);

  const [playerSpeed, setPlayerSpeed] = useState(5); // Define how fast the player moves per frame
  const [bulletSpeed, setBulletSpeed] = useState(5); // Define how fast the bullet moves per frame
  const [enemySpeed, setEnemySpeed] = useState(2);

  function gameOver() {
    setIsGameOver(true);
    setPlayerSpeed(0);
    setBulletSpeed(0);
    setEnemySpeed(0);
  }

  useEffect(() => {
    if (isGameOver) {
      cancelAnimationFrame(playerAnimationFrameId.current);
      cancelAnimationFrame(bulletAnimationFrameId.current);
      cancelAnimationFrame(enemyAnimationFrameId.current);
      cancelAnimationFrame(rockAnimationFrameId.current);
    }
  }, [isGameOver]);

  function restartGame() {
    setIsGameOver(false);
    setIsMovingLeft(false);
    setIsMovingRight(false);
    setPlayerSpeed(5);
    setBulletSpeed(5);
    setEnemySpeed(2);
    setScore(0);
    setPlayerPosition({ x: 200, y: 650 });
    setPlayerBullets([]);
    setRocks([]);
  }

  // Function to update the particles
  const updateParticles = useCallback(() => {
    if (!isGameOver) {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY,
        }))
      );
    }
    setParticles((prevParticles) => {
      // Map through particles and reset those that are off-screen
      return prevParticles.map((particle) => {
        if (particle.y >= 750) {
          // Reset particle's y position to 0 when it goes off-screen
          return {
            ...particle,
            y: 0,
          };
        }
        return particle;
      });
    });
  });

  //Creates a new bullet when the space key is pressed
  const newBullet = useMemo(
    () => ({
      x: playerPosition.x + 15,
      y: playerPosition.y,
      speed: bulletSpeed,
      hitTimer: 0,
      image: bulletImg,
    }),
    [playerPosition.x]
  );

  const scoreUpdation = useCallback(() => {
    if (!isGameOver) {
      setScore(score + 1);
    }
  }, [score]);

  // Function to move the player
  const movePlayer = useCallback(() => {
    setPlayerPosition((prevPosition) => {
      let newX = prevPosition.x;
      if (isMovingLeft && newX > 0) {
        newX -= playerSpeed;
      }
      if (isMovingRight && newX < 360) {
        newX += playerSpeed;
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
    setPlayerBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - bullet.speed }))
        .filter((bullet) => bullet.y > 0)
    );

    bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);
  });

  const fireBullet = throttle(100, () => {
    setPlayerBullets((prevBullets) => [...prevBullets, newBullet]);
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
        .map((enemy) => ({ ...enemy, y: enemy.y + enemySpeed }))
        .filter((enemy) => enemy.y < 700)
    );
    enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
  });

  // Function to spawn rocks
  const rockSpawner = useCallback(() => {
    const randomX = Math.floor(Math.random() * 350);
    setRocks((prevRocks) => [
      ...prevRocks,
      { x: randomX, y: 0, image: rockImg },
    ]);
  }, []);

  // Function to move the rocks
  const moveRocks = useCallback(() => {
    setRocks((prevRocks) =>
      prevRocks
        .map((rock) => ({ ...rock, y: rock.y + enemySpeed }))
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
          setIsMovingLeft(true);
          if (!playerAnimationFrameId.current) {
            movePlayer();
          }
        }
      } else if (event.key === 'ArrowRight') {
        if (!isMovingLeft) {
          setIsMovingRight(true);
          if (!playerAnimationFrameId.current) {
            movePlayer();
          }
        }
      }
      if (event.key === ' ' || event.key === 'ArrowUp') {
        fireBullet();
      }
    };

    // Handle key up event
    const handleKeyUp = (event) => {
      if (event.key === 'ArrowLeft') {
        setIsMovingLeft(false);
      } else if (event.key === 'ArrowRight') {
        setIsMovingRight(false);
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
    // Generate initial particles
    const newParticles = [];
    for (let i = 0; i < 100; i++) {
      // Adjust number of particles as needed
      newParticles.push({
        x: Math.floor(Math.random() * 400),
        y: Math.floor(Math.random() * 700),
        speedX: 0,
        speedY: playerSpeed / 2, // Speed of the player
        width: Math.random() * 3 + 1, // Random size between 1 and 4
        height: Math.random() * 3 + 1,
        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        })`, // Random color with opacity
      });
    }
    setParticles(newParticles);
  }, []);

  //Move the particles
  useEffect(() => {
    if (particles.length > 0) {
      const particleAnimationFrameId = requestAnimationFrame(updateParticles);
      return () => {
        cancelAnimationFrame(particleAnimationFrameId);
      };
    }
  }, [particles, updateParticles]);

  // Move the bullets
  useEffect(() => {
    if (playerBullets.length > 0) {
      bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);
    }
    return () => {
      cancelAnimationFrame(bulletAnimationFrameId.current);
    };
  }, [playerBullets, moveBullets]);

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
    playerBullets.forEach((bullet) => {
      enemies.forEach((enemy) => {
        if (isCollision(bullet, enemy)) {
          setEnemies((prevEnemies) => prevEnemies.filter((e) => e !== enemy));
          setScore(score + 50);
        }
      });
    });
  }, [playerBullets, enemies]);

  useEffect(() => {
    // Check for collision between player and enemies
    enemies.forEach((enemy) => {
      if (isCollision(playerPosition, enemy)) {
        gameOver();
      }
    });
  }, [playerPosition, enemies]);

  useEffect(() => {
    // Check for collision between player and rocks
    rocks.forEach((rock) => {
      if (isCollision(playerPosition, rock)) {
        gameOver();
      }
    });
  }, [playerPosition, rocks]);

  useEffect(() => {
    // Check for collision between bullets and rocks
    playerBullets.forEach((bullet) => {
      rocks.forEach((rock) => {
        if (isCollision(bullet, rock)) {
          setPlayerBullets((prevBullets) =>
            prevBullets.filter((b) => b !== bullet)
          );
        }
      });
    });
  }, [playerBullets, rocks]);

  //check for collision between rocks and enemies
  useEffect(() => {
    enemies.forEach((enemy) => {
      rocks.forEach((rock) => {
        if (isCollision(rock, enemy)) {
          setEnemies((prevEnemies) => prevEnemies.filter((e) => e !== enemy));
          enemySpawner();
        }
      });
    });
  }, [enemies, rocks, enemySpawner]);

  // Function to render the canvas
  const renderCanvas = (ctx, canvasWidth, canvasHeight) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the particles
    particles.forEach((particle) => {
      ctx.fillStyle = 'white';
      ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
    });

    // Draw the player at the updated position
    let currentImage = playerImg;

    if (isGameOver) {
      currentImage = playerDamagedImg;
    }

    if (isMovingLeft) {
      currentImage = playerLeftImg;
    }
    if (isMovingRight) {
      currentImage = playerRightImg;
    }
    ctx.drawImage(currentImage, playerPosition.x, playerPosition.y, 40, 40);

    // Draw the bullets
    playerBullets.forEach((bullet) => {
      const hitEnemy = enemies.find((enemy) => isCollision(bullet, enemy));
      const hitRock = rocks.find((rock) => isCollision(bullet, rock));
      if (hitEnemy || hitRock) {
        bullet.hitTimer = 10;
        bullet.speed = 0;
      }

      if (bullet.hitTimer > 0) {
        ctx.drawImage(bulletHitImg, bullet.x, bullet.y, 10, 20);
        bullet.hitTimer--;
      } else {
        if (bullet.speed === 0) {
          setPlayerBullets((prevBullets) =>
            prevBullets.filter((b) => b !== bullet)
          );
        }
        ctx.drawImage(bulletImg, bullet.x, bullet.y, 10, 20);
      }
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
      {isGameOver && (
        <div className='game-over'>
          <h1>Game Over</h1>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default App;
