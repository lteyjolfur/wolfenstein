'use strict';

const pushKeys = {};
const canvas = document.getElementById("tutorial");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let frames = 0;
const degInRad = Math.PI / 180;
const radInDeg = 180 / Math.PI;

const CANVAS = {
  WIDTH: null,
  HEIGHT: null,
  WIDTH2: null,
  HEIGHT2: null
};

const colors = {
  RED: "rgba(255, 0, 0, 1)",
  RED_DARK: "rgba(150, 0, 0, 1)",
  GREEN: "rgba(0, 255, 0, 1)",
  BLUE: "rgba(0, 0, 255, 1)",
  YELLOW: "rgba(255, 255, 0, 1)",
  CEILING: "rgba(59,59, 59, 1)",
  FLOOR: "rgba(115, 115, 115, 1)"

};


const player = {
  x: 300,
  y: 300,
  dx: 5,
  dy: 0,
  angle: 0.00000001,
  color: colors.YELLOW,
  checkCollision: function(x,y){
    const mapX = Math.floor(x / map.gridSize);
    const mapY = Math.floor(y / map.gridSize);
    return map.map[mapX + map.y * mapY] === 1;
  }
}; 

const map = {
  x:8,
  y:8,
  gridSize:64,
  get cellSize() {return this.x * this.y;},
  get mapHeight() {return this.x * this.gridSize;},
  wallColor:"rgba(200, 200, 200, 1)",
  floorColor:"rgba(0, 0, 0, 1)",
  map: [
    1,1,1,1,1,1,1,1,
    1,0,1,0,1,0,0,1,
    1,0,1,0,0,0,1,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,
  ]
};

const projection3D = (ray,i,angle) => {
  const DRAW_WIDTH = 8;
  const {mapHeight} = map; 
  const rectifiedDistance = ray.distance * Math.cos(player.angle - angle);

  // scaling to get a usable height hand tuned
  const height = Math.min((mapHeight * 64) / rectifiedDistance, mapHeight);
  const top = CANVAS.HEIGHT2 - height / 2;

  ctx.fillStyle = ray.isVertical ?  colors.RED : colors.RED_DARK;
  ctx.fillRect(CANVAS.WIDTH2 + i * DRAW_WIDTH, top, DRAW_WIDTH, height);
};

const drawCeiling = () => {
  const fillStyle = ctx.fillStyle;
  ctx.fillStyle = colors.CEILING; // #3B3B3B
  ctx.fillRect(CANVAS.WIDTH2, 0, CANVAS.WIDTH, CANVAS.HEIGHT2); // #737373
  ctx.fillStyle = fillStyle;
};
const drawFloor = () => {
  const fillStyle = ctx.fillStyle;
  ctx.fillStyle = colors.FLOOR;
  ctx.fillRect(CANVAS.WIDTH2, CANVAS.HEIGHT / 2, CANVAS.WIDTH, CANVAS.HEIGHT);
  ctx.fillStyle = fillStyle;
};

const handleKey = (e,set) => {
  pushKeys[e.key] = set;
};

document.addEventListener('keydown',(e)=>handleKey(e,true));
document.addEventListener('keyup',(e)=>handleKey(e,false));

const calcRays3D = (angle) => {
  const ray = {
    angle,
    x: 0,
    y: 0
  };

  let xOffset;
  let yOffset;
  let depthOfField = 0;

  /**
   * Checks for collisions in a grid-based map by tracing a ray and adjusting its position.
   *
   * @param {Object} ray - The ray object containing its current position.
   * @param {number} ray.x - The x-coordinate of the ray.
   * @param {number} ray.y - The y-coordinate of the ray.
   * @param {number} xOffset - The amount to offset the ray's x-coordinate on each iteration.
   * @param {number} yOffset - The amount to offset the ray's y-coordinate on each iteration.
   * @param {number} depthOfField - The initial depth of field value.
   * @returns {Object} - The final position of the ray and the depth of field.
   * @returns {number} x - The final x-coordinate of the ray.
   * @returns {number} y - The final y-coordinate of the ray.
   * @returns {number} depthOfField - The final depth of field value.
   */
  const collisionLoop = (ray, xOffset, yOffset, depthOfField, isVertical) => {
    let hitDepth = 8;
    let distance = 999999;
    while(depthOfField < 8){
      const x = Math.floor(ray.x / gridSize);
      const y = Math.floor(ray.y / gridSize);
      const point = y * map.x + x;
      if(point < map.x * map.y && map.map[point] === 1){ // hit wall
        hitDepth = depthOfField;
        depthOfField = 8;
      } else {
        ray.x += xOffset;
        ray.y += yOffset;
        depthOfField += 1;
      }
    }
    // pythagorean theorem
    distance = Math.sqrt(Math.pow(ray.x - player.x, 2) + Math.pow(ray.y - player.y, 2));
    return {...ray, x: Math.round(ray.x), y: Math.round(ray.y), hitDepth, distance, isVertical};
  };

  

  // ---Check Horizontal Lines---
  
  const atanRayAngle = -1 / Math.tan(ray.angle);

  const {gridSize} = map;
  // looking up
  if( angle > Math.PI){
    ray.y = Math.floor(player.y / gridSize) * gridSize - 0.0001; // this should never be 0
    ray.x = (player.y - ray.y) * atanRayAngle + player.x;
    yOffset = -gridSize;
    xOffset = -yOffset * atanRayAngle;

    // looking down
  }  else if(angle < Math.PI && angle > 0){
    ray.y = Math.floor(player.y / gridSize) * gridSize + gridSize;
    ray.x = ((player.y - ray.y) * atanRayAngle + player.x);
    yOffset = gridSize;
    xOffset = -yOffset * atanRayAngle;

  } else { // looking horizontally no horizontal hits to check
    ray.x = player.x;
    ray.y = player.y;
    depthOfField = 8;
  }

  const horizontalRay = collisionLoop(ray, xOffset, yOffset, depthOfField,false);

  depthOfField = 0;
  const nTan = -Math.tan(ray.angle);

  // looking left
  if( angle > Math.PI / 2 && angle < 3 * Math.PI / 2){
    ray.x =   Math.floor(player.x / gridSize) * gridSize - 0.0001; // this should never be 0
    ray.y = (player.x - ray.x) * nTan + player.y;

    xOffset = -gridSize;
    yOffset = -xOffset * nTan;

    // looking right
  } else if(angle < Math.PI / 2 || angle > 3 * Math.PI / 2){
    ray.x = Math.floor(player.x / gridSize) * gridSize + gridSize;
    ray.y = ((player.x - ray.x) * nTan + player.y);

    xOffset = gridSize;
    yOffset = -xOffset * nTan;

  } else { // looking vertically nothing to check
    ray.x = player.x;
    ray.y = player.y;
    depthOfField = 8;
  }

  const verticalRay = collisionLoop(ray, xOffset, yOffset, depthOfField,true);

  return verticalRay.distance < horizontalRay.distance ? verticalRay : horizontalRay;  
};

// petrea elskar eyjolfinn sinn


let isFirstRender = true;
const draw = () => {

  if (!canvas.getContext) {
    return;
  }

  // Make available in global scope
  if (isFirstRender) {
    isFirstRender = false;
    CANVAS.WIDTH = canvas.width;
    CANVAS.HEIGHT = canvas.height;
    CANVAS.WIDTH2 = CANVAS.WIDTH / 2;
    CANVAS.HEIGHT2 = CANVAS.HEIGHT / 2;
  }

  const {WIDTH, HEIGHT/* ,HEIGHT2,WIDTH2*/} = CANVAS;



  const prevX = player.x;
  const prevY = player.y;

  switch(true){
  //   case pushKeys.w && pushKeys.a:
  //   player.y -= sin(45)*5
  //   player.x -= sin(45)*5
  //   break;
  // case pushKeys.w && pushKeys.d:
  //   player.y -= sin(45)*5
  //   player.x += sin(45)*5
  //   break;
  case pushKeys.w:
    player.x += player.dx; 
    player.y += player.dy; 
    break;
  case pushKeys.s:
    player.x -= player.dx; 
    player.y -= player.dy; 
    break;
    // case pushKeys.a:
    //   //player.x -= 5
    //   break;
    // case pushKeys.d:
    //   //player.x += 5
    //   break;   
  case pushKeys.q:
  case pushKeys.a:
    player.angle -= 0.1;
    player.angle = player.angle < 0 ? player.angle + (2 * Math.PI) : player.angle;
    player.dx = Math.cos(player.angle) * 5;
    player.dy = Math.sin(player.angle) * 5;
    break;
  case pushKeys.e:
  case pushKeys.d:
      
    player.angle += 0.1;
    player.angle = player.angle > 2 * Math.PI ? player.angle - (2 * Math.PI) : player.angle;
    player.dx = Math.cos(player.angle) * 5;
    player.dy = Math.sin(player.angle) * 5;
    break;           
  default:

  }

  // is player inside a wall
  if(player.checkCollision(player.x,player.y)){
    // the player will be inside a wall
    // check if the player should wallslide
    if(!player.checkCollision(player.x,prevY)){
      player.y = prevY;
    } else if (!player.checkCollision(prevX,player.y)){
      player.x = prevX;
    } else {
      player.x = prevX;
      player.y = prevY; 
    }
  }

  ctx.fillStyle = "rgba(100, 100, 100, 1)";
  ctx.fillRect(0,0,WIDTH,HEIGHT);

  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(frames++ % WIDTH, 0, 4, 4);


  // draw map
  const {cellSize,wallColor,floorColor} = map;
  map.map.forEach((wall,index)=>{
    const x = index % map.x;
    const y = Math.floor(index / map.y);
    ctx.fillStyle = wall ? wallColor : floorColor;
    ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 1, cellSize - 1);
  });

  // Draw player
  const playerXRound = Math.round(player.x);
  const playerYRound = Math.round(player.y);
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.strokeStyle = player.color;
  ctx.moveTo(playerXRound, playerYRound);
  ctx.lineTo(player.x + Math.floor(player.dx * 5), player.y + Math.floor(player.dy * 5));
  ctx.stroke();

  const drawRays3D = (ray) => {
    ctx.beginPath();
    ctx.moveTo(playerXRound, playerYRound);
    ctx.lineTo(ray.x, ray.y);
    ctx.stroke();
  };

  drawCeiling();
  drawFloor();

  Array.from({length:64}, (_ ,i)=>{
    let angle = player.angle - 30 * degInRad + i * degInRad;
    if (angle < 0) {
      angle += 2 * Math.PI;
    } else if (angle > 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    if(i === 0){
      console.log('angle',angle * radInDeg);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 0, 1)";
      ctx.moveTo(playerXRound, playerYRound);
      const lineX = 1000;
      const lineY = 0;
      ctx.lineTo( playerXRound + lineX * Math.cos(angle) - lineY * Math.sin(angle), playerYRound + lineX * Math.sin(angle)  + lineY * Math.sin(angle));
      ctx.stroke();
      
    } 
    ctx.strokeStyle = player.color;
    const ray = calcRays3D(angle);
    drawRays3D(ray);
    // console.log('ray',ray);
    projection3D(ray,i,angle);
  });

  ctx.strokeStyle = player.color;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - 2,player.y - 2,5,5);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  ctx.putImageData(imageData, 0, 0);
};

window.onload = setInterval(draw,1000 / 30);