'use strict';

const pushKeys = {};
const canvas = document.getElementById("tutorial");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let frames = 0;
console.log(canvas.length);

const player = {
  x: 300,
  y: 300,
  dx: 5,
  dy: 0,
  z: 10,
  angle: 0,
  color:"rgba(255, 255, 0, 1)"
}; 

const map = {
  x:8,
  y:8,
  gridSize:64,
  get cellSize() {return this.x * this.y;},
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

/*
const drawMap2d = () => {
  ctx.fillRect(player.x+10,player.y,4,4);
  const {gridSize,wallColor,floorColor} = map;
  console.log(gridSize,wallColor,floorColor)
  map.map.forEach((wall,index)=>{
    //console.log(wall)
    const x = index%map.x
    const y = Math.floor(index/map.y)
    ctx.fillColor = wall ? wallColor : floorColor
    ctx.fillRect(x, y, gridSize, gridSize);
  })
}
*/
/*
const wall = {
  x: Array(4),
  y: Array(4),
  z: Array(4)
}*/

const handleKey = (e,set) => {
  pushKeys[e.key] = set;
};

document.addEventListener('keydown',(e)=>handleKey(e,true));
document.addEventListener('keyup',(e)=>handleKey(e,false));

const drawRays3D = () => {
  const ray = {
    angle: player.angle,
    x: 0,
    y: 0
  };
  const mapCheck = {
    point: 0,
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
  const collisionLoop = (ray, xOffset, yOffset, depthOfField) => {
    let hitDepth = 8;
    let distance = 999999;
    while(depthOfField < 8){
      mapCheck.x = Math.floor(ray.x / gridSize);
      mapCheck.y = Math.floor(ray.y / gridSize);
      const point = mapCheck.y * map.x + mapCheck.x;
      // console.log('ray.y',ray.y,'dof',depthOfField);
      // console.log(mapCheck,map.map[mapCheck.point]);
      if(point < map.x * map.y && map.map[point] === 1){ // hit wall
        // console.log('point',mapCheck.point);
        // console.log('found');
        hitDepth = depthOfField;
        
        depthOfField = 8;
      } else {
        ray.x += xOffset;
        ray.y += yOffset;
        depthOfField += 1;
      }
    }
    distance = Math.sqrt(Math.pow(ray.x - player.x, 2) + Math.pow(ray.y - player.y, 2));
    return {x: Math.round(ray.x), y: Math.round(ray.y), hitDepth, distance};
  };

  

  // ---Check Horizontal Lines---
  
  const atanRayAngle = -1 / Math.tan(ray.angle);

  const {gridSize} = map;
  // looking up
  if( player.angle > Math.PI){
    ray.y = Math.floor(player.y / gridSize) * gridSize - 0.0001; // this should never be 0
    ray.x = (player.y - ray.y) * atanRayAngle + player.x;
    yOffset = -gridSize;
    xOffset = -yOffset * atanRayAngle;
    // looking down
  } else if(player.angle < Math.PI && player.angle > 0){
    ray.y = Math.floor(player.y / gridSize) * gridSize + gridSize;
    ray.x = ((player.y - ray.y) * atanRayAngle + player.x);
    yOffset = gridSize;
    xOffset = -yOffset * atanRayAngle;
    console.log('2');
  } else { // looking horizontally no horizontal hits to check
    console.log('3');
    ray.x = player.x;
    ray.y = player.y;
    depthOfField = 8;
  }

  const horizontalRay = collisionLoop(ray, xOffset, yOffset, depthOfField);
  const hit = {x: ray.x, y: ray.y};

  depthOfField = 0;
  const nTan = -Math.tan(ray.angle);

  // looking left
  if( player.angle > Math.PI / 2 && player.angle < 3 * Math.PI / 2){
    ray.x =   Math.floor(player.x / gridSize) * gridSize - 0.0001; // this should never be 0
    ray.y = (player.x - ray.x) * nTan + player.y;
    console.log(ray.x,ray.y);

    xOffset = -gridSize;
    yOffset = -xOffset * nTan;
    console.log('looking left');
    // looking right
  } else if(player.angle < Math.PI / 2 || player.angle > 3 * Math.PI / 2){
    ray.x = Math.floor(player.x / gridSize) * gridSize + gridSize;
    ray.y = ((player.x - ray.x) * nTan + player.y);

    xOffset = gridSize;
    yOffset = -xOffset * nTan;
    console.log('looking right');
  } else { // looking vertically nothing to check
    ray.x = player.x;
    ray.y = player.y;
    depthOfField = 8;
  }

  const verticalRay = collisionLoop(ray, xOffset, yOffset, depthOfField);



  ray.a = Math.round(ray.x);
  ray.b = Math.round(ray.y);
  ray.x = Math.round(hit.x);
  ray.y = Math.round(hit.y);

  return verticalRay.distance < horizontalRay.distance ? verticalRay : horizontalRay;
  // if (ray.hDepth < ray.vDepth){
  //   return {x: ray.x, y: ray.y};
  // } else {
  //   return {x: ray.a, y: ray.b};
  // }
  // return horizontalRay;
  // return verticalRay;
  
};

// petrea elskar eyjolfinn sinn

const draw = () => {

  if (!canvas.getContext) {
    return;
  }
  const WIDTH = canvas.width;
  // const WIDTH2 = WIDTH / 2;
  const HEIGHT = canvas.height;
  // const HEIGHT2 = HEIGHT / 2;



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

  // ctx.clearRect(0,0,WIDTH,HEIGHT)
  ctx.fillStyle = "rgba(100, 100, 100, 1)";
  ctx.fillRect(0,0,WIDTH,HEIGHT);


  // const dx=sin(player.angle)*10;
  // const dy=cos(player.angle)*10;


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

  const ray = drawRays3D();
  // console.log(ray)
  ctx.beginPath();
  ctx.moveTo(playerXRound, playerYRound);
  ctx.lineTo(ray.x, ray.y);
  ctx.stroke();

  // ctx.beginPath();
  // ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
  // ctx.moveTo(playerXRound, playerYRound);
  // ctx.lineTo(ray.a, ray.b);
  // ctx.stroke();
  // ctx.strokeStyle = player.color;

  ctx.fillRect(player.x - 2,player.y - 2,5,5);


  // wall
  // const x1 = 40-player.x
  // const x2 = 40-player.x
  // const y1 = 10-player.y
  // const y2 = 290-player.y
  // const cosN = cos(player.angle)
  // const sinN = sin(player.angle)

  // wall.x[0] = x1*cosN - y1*sinN
  // wall.x[1] = x2*cosN - y2*sinN

  // wall.y[0] = x1*cosN + y1*sinN
  // wall.y[1] = x2*cosN + y1*sinN

  // ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  // ctx.fillRect(wall.x[0], wall.y[0], 4, 4);
  // console.log(wall.x[0],wall.y[0])

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);






  // const data = imageData.data;
  // console.log(data.length)
  // console.log(imageData)
  // for (let i = 0; i < data.length-frames++; i += 4) {
  //   data[i] = 0; // red
  //   data[i + 1] = 0; // green
  //   data[i + 2] = 0; // blue
  //   data[i + 3] = 255; // alpha
  //   ctx.putImageData(imageData, 0, 0);
  // }
  // console.log(imageData)
  ctx.putImageData(imageData, 0, 0);
};

window.onload = setInterval(draw,1000 / 30);