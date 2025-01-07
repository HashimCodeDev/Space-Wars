import { useEffect } from 'react';

const Player = ({ ctx, x, y, image }) => {
  useEffect(() => {
    if (ctx && image) {
      const draw = () => {
        ctx.drawImage(image, x, y, 40, 40);
      };

      if (image.complete) {
        // If the image is already loaded
        draw();
      } else {
        // Wait for the image to load
        image.onload = draw;
      }
    }
  }, [ctx, x, y, image]);

  return null;
};

export default Player;
