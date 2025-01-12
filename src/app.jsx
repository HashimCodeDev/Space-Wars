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
const enemyBulletImg = preloadImage(enemyBulletImage);
const enemyBulletHitImg = preloadImage(enemyBulletHitImage);
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
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const playerAnimationFrameId = React.useRef(null);
  const bulletAnimationFrameId = React.useRef(null);
  const enemyAnimationFrameId = React.useRef(null);
  const rockAnimationFrameId = React.useRef(null);

  let ENEMY_SPAWN_INTERVAL = Math.random() * 5000;
  let ROCK_SPAWN_INTERVAL = Math.random() * 1000;

  const [playerSpeed, setPlayerSpeed] = useState(5); // Define how fast the player moves per frame
  const [bulletSpeed, setBulletSpeed] = useState(15); // Define how fast the bullet moves per frame
  const [enemyBulletSpeed, setEnemyBulletSpeed] = useState(5);
  const [enemySpeed, setEnemySpeed] = useState(2);

  function startGame() {
    setIsGameStarted(true);
  }
  function gameOver() {
    setIsGameOver(true);
    setPlayerSpeed(0);
    setBulletSpeed(0);
    setEnemyBulletSpeed(0);
    setEnemySpeed(0);
  }

  useEffect(() => {
    if (isGameOver) {
      cancelAnimationFrame(playerAnimationFrameId.current);
      cancelAnimationFrame(bulletAnimationFrameId.current);
      cancelAnimationFrame(enemyAnimationFrameId.current);
      cancelAnimationFrame(rockAnimationFrameId.current);

      setPlayerBullets([]);
      setEnemies((prevEnemies) =>
        prevEnemies.map((enemy) => ({
          ...enemy,
          bullets: [], // Reset bullets to an empty array for each enemy
        }))
      );
    }
  }, [isGameOver]);

  function restartGame() {
    setPlayerBullets([]);
    setEnemies([]);
    setRocks([]);
    setIsMovingLeft(false);
    setIsMovingRight(false);
    setPlayerSpeed(5);
    setBulletSpeed(15);
    setEnemySpeed(2);
    setEnemyBulletSpeed(5);
    setScore(0);
    setPlayerPosition({ x: 200, y: 650 });
    setIsGameOver(false);
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
  }, [isGameOver]);

  //Creates a new bullet when the space key is pressed
  const newBullet = useMemo(
    () => ({
      x: playerPosition.x + 15,
      y: playerPosition.y,
      speed: bulletSpeed,
      hitTimer: 0,
      image: bulletImg,
    }),
    [playerPosition.x, bulletSpeed]
  );

  const scoreUpdation = useCallback(() => {
    if (!isGameOver) {
      setScore(score + 1);
    }
  }, [score, isGameOver]);

  // Function to move the player
  const movePlayer = useCallback(() => {
    if (isGameOver) return;
    if (isGameStarted) {
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
    }
  }, [isGameStarted, playerSpeed, isMovingLeft, isMovingRight, isGameOver]);

  // Function to move the bullets
  const moveBullets = useCallback(() => {
    if (isGameOver) return;
    setPlayerBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - bullet.speed }))
        .filter((bullet) => bullet.y > 0)
    );

    bulletAnimationFrameId.current = requestAnimationFrame(moveBullets);

    return () => {
      cancelAnimationFrame(bulletAnimationFrameId);
    };
  }, [setPlayerBullets, isGameOver]);

  const fireBullet = useCallback(
    throttle(100, () => {
      setPlayerBullets((prevBullets) => [...prevBullets, newBullet]);
    }),
    [newBullet]
  );

  // Function to spawn enemies
  const enemySpawner = useCallback(() => {
    if (isGameOver) return;
    if (isGameStarted) {
      const randomX = Math.floor(Math.random() * 350);
      setEnemies((prevEnemies) => [
        ...prevEnemies,
        { x: randomX, y: 0, bullets: [] },
      ]);
    }
  }, [isGameStarted, isGameOver]);

  // Function to move the enemies
  const moveEnemies = useCallback(() => {
    if (isGameOver) return;
    setEnemies((prevEnemies) =>
      prevEnemies
        .map((enemy) => ({ ...enemy, y: enemy.y + enemySpeed }))
        .filter((enemy) => enemy.y < 750)
    );
    enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
    return () => {
      cancelAnimationFrame(enemyAnimationFrameId.current);
    };
  }, [setEnemies, enemySpeed, isGameOver]);

  // Function to spawn rocks
  const rockSpawner = useCallback(() => {
    if (isGameOver) return;
    if (isGameStarted) {
      const randomX = Math.floor(Math.random() * 350);
      setRocks((prevRocks) => [
        ...prevRocks,
        { x: randomX, y: 0, image: rockImg },
      ]);
    }
  }, [isGameStarted, isGameOver]);

  // Function to move the rocks
  const moveRocks = useCallback(() => {
    if (isGameOver) return;
    setRocks((prevRocks) =>
      prevRocks
        .map((rock) => ({ ...rock, y: rock.y + enemySpeed }))
        .filter((rock) => rock.y < 750)
    );
    rockAnimationFrameId.current = requestAnimationFrame(moveRocks);
    return () => {
      cancelAnimationFrame(rockAnimationFrameId.current);
    };
  }, [setRocks, enemySpeed, isGameOver]);

  //Update the score
  useEffect(() => {
    if (isGameStarted) {
      const scoreInterval = setInterval(scoreUpdation, 1000);
      if (isGameOver) {
        clearInterval(scoreInterval);
      }
      return () => {
        clearInterval(scoreInterval);
      };
    }
  }, [scoreUpdation, isGameStarted, isGameOver]);

  // Handle key down and key up events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the key pressed is the left or right arrow key
      if (event.key === 'Enter') {
        setIsGameStarted(true);
      }

      if (event.key === 'R' || event.key === 'r') {
        restartGame();
      }

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
        speedY: Math.random() * playerSpeed,
        width: (Math.random() + 0.1) * 3 + 1, // Random size between 1 and 4
        height: Math.random() * 3 + 1,
        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          Math.random() * 255
        })`, // Random color with opacity
      });
    }
    setParticles(newParticles);
  }, [playerSpeed, setParticles]);

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
    if (isGameOver) return;
    const enemySpawnerInterval = setInterval(
      enemySpawner,
      ENEMY_SPAWN_INTERVAL
    );
    if (isGameOver) {
      clearInterval(enemySpawnerInterval);
    }
    return () => {
      clearInterval(enemySpawnerInterval);
    };
  }, [enemySpawner, isGameStarted, ENEMY_SPAWN_INTERVAL, isGameOver]);

  // Move the enemies
  useEffect(() => {
    if (enemies.length > 0) {
      enemyAnimationFrameId.current = requestAnimationFrame(moveEnemies);
    }
    return () => {
      cancelAnimationFrame(enemyAnimationFrameId.current);
    };
  }, [enemies, moveEnemies]);

  useEffect(() => {
    if (isGameOver) return;

    let lastShootTime = 0;

    const shootBullets = (timestamp) => {
      if (timestamp - lastShootTime > 4000) {
        // Shoot every 2 seconds
        setEnemies((prevEnemies) =>
          prevEnemies.map((enemy) => ({
            ...enemy,
            bullets: [
              ...enemy.bullets,
              {
                x: enemy.x + 15,
                y: enemy.y + 10,
              },
            ],
          }))
        );
        lastShootTime = timestamp;
      }

      requestAnimationFrame(shootBullets); // Keep the loop running
    };

    bulletAnimationFrameId.current = requestAnimationFrame(shootBullets);
    return () => cancelAnimationFrame(bulletAnimationFrameId.current); // Cleanup on unmount
  }, [isGameOver]);

  useEffect(() => {
    if (!isGameOver && isGameStarted) {
      const moveBullets = () => {
        setEnemies((prevEnemies) =>
          prevEnemies.map((enemy) => ({
            ...enemy,
            bullets: enemy.bullets
              .map((bullet) => ({
                ...bullet,
                y: bullet.y + enemyBulletSpeed, // Move the bullet downward
              }))
              .filter((bullet) => bullet.y <= 750), // Remove bullets that go off-screen
          }))
        );

        console.log('Bullet Speed:', enemyBulletSpeed);
        requestAnimationFrame(moveBullets); // Keep the loop running
      };

      const animationId = requestAnimationFrame(moveBullets);
      return () => cancelAnimationFrame(animationId); // Cleanup on unmount
    }
  }, [isGameOver, enemyBulletSpeed, isGameStarted]);

  //Spawn Rock every 2 seconds
  useEffect(() => {
    const rockSpawnerInterval = setInterval(rockSpawner, ROCK_SPAWN_INTERVAL);
    if (isGameOver) {
      clearInterval(rockSpawnerInterval);
    }
    return () => {
      clearInterval(rockSpawnerInterval);
    };
  }, [rockSpawner, isGameStarted, ROCK_SPAWN_INTERVAL, isGameOver]);

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
  }, [playerBullets, enemies, score]);

  useEffect(() => {
    // Check for collision between player and enemies
    enemies.forEach((enemy) => {
      if (isCollision(playerPosition, enemy)) {
        gameOver();
      }
      enemy.bullets.forEach((bullet) => {
        if (isCollision(bullet, playerPosition)) {
          gameOver();
        }
      });
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

    if (isGameStarted) {
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

      if (!isGameOver) {
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
      }
      enemies.forEach((enemy) => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, 40, 40);

        if (!isGameOver && enemy.bullets.length > 0) {
          enemy.bullets.forEach((bullet) => {
            ctx.drawImage(enemyBulletImg, bullet.x, bullet.y, 10, 20);
          });
        }
      });
      rocks.forEach((rock) => {
        ctx.drawImage(rockImg, rock.x, rock.y, 40, 40);
      });
    }
  };

  // Render the canvas
  return (
    <div
      className='Canvas'
      align='center'>
      <GameCanvas onRender={renderCanvas} />
      {isGameStarted && <div className='ScoreBoard'>{score}</div>}
      {!isGameStarted && (
        <div className='start-screen'>
          <h1 className='title'>SPACE WARS</h1>
          <button
            className='start'
            onClick={startGame}>
            START GAME
          </button>
        </div>
      )}
      {isGameOver && (
        <div className='game-over'>
          <h1 className='text'>Game Over</h1>
          <button
            className='restart'
            onClick={restartGame}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
