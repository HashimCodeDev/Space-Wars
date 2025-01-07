import { useEffect } from 'react';

const Bullet = ({ ctx, bullets, bulletImage }) => {
  useEffect(() => {
    bullets.forEach((bullet) => {
      console.log('bullet', bullet);
      ctx.drawImage(bulletImage, bullet.x, bullet.y, 10, 20);
    });
  }, [ctx, bullets, bulletImage]);

  return null;
};

export default Bullet;
