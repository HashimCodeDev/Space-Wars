import React, { useRef, useEffect } from 'react';

const GameCanvas = ({ player, bullets, enemies, onRender }) => {
  const canvasRef = useRef(null);
  const canvasWidth = 400;
  const canvasHeight = window.innerHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Call the parent render function
    onRender(ctx, canvasWidth, canvasHeight);
  });

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ border: '1px solid black', background: 'black' }}
    />
  );
};

export default GameCanvas;
