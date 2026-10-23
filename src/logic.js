// Pure game logic, kept free of DOM/canvas so it can be unit tested.

const TWO_PI = 2 * Math.PI;

/**
 * Returns true if the world-space point (x, y) lies inside a wall cell.
 * Note: rows are indexed with map.y as the stride (the map is square).
 */
export const isWall = (map, x, y) => {
  const mapX = Math.floor(x / map.gridSize);
  const mapY = Math.floor(y / map.gridSize);
  return map.map[mapX + map.y * mapY] === 1;
};

/**
 * Given an attempted move from (prevX, prevY) to (x, y), returns the position
 * the player should end up at: unchanged if free, otherwise slide along the
 * free axis, otherwise revert to the previous position.
 */
export const resolveCollision = (map, x, y, prevX, prevY) => {
  if (!isWall(map, x, y)) {
    return { x, y };
  }
  if (!isWall(map, x, prevY)) {
    return { x, y: prevY };
  }
  if (!isWall(map, prevX, y)) {
    return { x: prevX, y };
  }
  return { x: prevX, y: prevY };
};

/** Wraps an angle that is at most one turn out of range back into [0, 2PI]. */
export const wrapAngle = (angle) => {
  if (angle < 0) {
    return angle + TWO_PI;
  } else if (angle > TWO_PI) {
    return angle - TWO_PI;
  }
  return angle;
};
