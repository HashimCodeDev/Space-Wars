import { useEffect } from 'react';

const Enemy = ({ ctx, enemies, enemyImage }) => {
  useEffect(() => {
    enemies.forEach((enemy) => {
      ctx.drawImage(enemyImage, enemy.x, enemy.y, 40, 40);
    });
  }, [ctx, enemies, enemyImage]);

  return null;
};

export default Enemy;
