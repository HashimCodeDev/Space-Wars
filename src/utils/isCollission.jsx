export const isCollision = (obj1, obj2) => {
  return (
    obj1.x < obj2.x + 40 &&
    obj1.x + 10 > obj2.x &&
    obj1.y < obj2.y + 40 &&
    obj1.y + 20 > obj2.y
  );
};
