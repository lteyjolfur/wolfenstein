'use strict';
const pushKeys = {}
const canvas = document.getElementById("tutorial");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let frames = 0
console.log(canvas.length)

const WIDTH = canvas.width;
const WIDTH2 = WIDTH/2
const SCREEN2 = WIDTH/4
const HEIGHT = canvas.height;
const HEIGHT2 = HEIGHT/2
const VPOINT = HEIGHT*0.3  // Vanishing point
//const SCREENR2 = WIDTH2+SCREEN2

console.log(WIDTH,HEIGHT)

const player = {
  x: SCREEN2,
  y: HEIGHT,
  dx: 0,
  dy: -5,
  z: 10,
  angle: 1.5*Math.PI,
  color: "rgba(255, 255, 0, 1)"
} 

const map = {
  x:8,
  y:8,
  gridSize:64,
  wallColor:"rgba(200, 200, 200, 1)",
  floorColor:"rgba(0, 0, 0, 1)",
  map: [
    1,1,1,0,0,0,1,1,
    1,0,1,0,0,0,0,1,
    1,0,1,0,0,0,1,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,1,1,0,0,1,1,1,
  ]
}

const lineThroughPoints = (point1,point2) => {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  // Calculate slope
  let slope;
  if (x2 - x1 === 0) {  // Handle vertical line case
      slope = 0;
  } else {
      slope = (y2 - y1) / (x2 - x1);
  }
  
  // Calculate y-intercept
  let intercept;
  if (slope === null) {  // Handle vertical line case
      intercept = x1;
  } else {
      intercept = y1 - slope * x1;
  }
  return {slope, intercept};
}

const lineFromEq = (slope,intercept,level=0) => {
  const prevColor = ctx.strokeStyle
  ctx.strokeStyle = "rgb(128, 0, 128)";
  ctx.beginPath();
  ctx.moveTo(intercept+slope*(HEIGHT-(100*level)),HEIGHT-(100*level));
  ctx.lineTo(intercept+slope*0.3*HEIGHT,0.3*HEIGHT);
  ctx.stroke();
  ctx.strokeStyle = prevColor;
}


const handleKey = (e,set) => {
  pushKeys[e.key] = set
}

document.addEventListener('keydown',(e)=>handleKey(e,true))
document.addEventListener('keyup',(e)=>handleKey(e,false))

const drawRays3D = () => {
  const ray = {
    angle: player.angle,
    x: 0,
    y: 0
  }
  const mapCheck = {
    point: 0,
    x: 0,
    y: 0
  }

  let xOffset
  let yOffset
  let depthOfField = 0

   // ---Check Horizontal Lines---
  
  const atanRayAngle = -1/Math.tan(ray.angle)
  // looking up
  if( player.angle > Math.PI){
    ray.y = Math.floor(player.y/64)*64-0.0001
    ray.x = (player.y-ray.y)*atanRayAngle+player.x
    yOffset = -map.gridSize
    xOffset = -yOffset*atanRayAngle
 } else if(player.angle < Math.PI && player.angle > 0){
    ray.y = Math.floor(player.y/64)*64+64
    ray.x = ((player.y-ray.y)*atanRayAngle+player.x)
    yOffset = map.gridSize
    xOffset = -yOffset*atanRayAngle
  } else {
    ray.x = player.x
    ray.y = player.y
    depthOfField = 8
  }
  while(depthOfField<8){
    mapCheck.x = Math.floor(ray.x/64)
    mapCheck.y = Math.floor(ray.y/64)
    mapCheck.point = mapCheck.y*map.x+mapCheck.x
    // console.log('ray.y',ray.y,'dof',depthOfField)
    // console.log(mapCheck,map.map[mapCheck.point])
    if(mapCheck.point < map.x*map.y && map.map[mapCheck.point]===1){ // hit wall
      console.log('found')
      depthOfField = 8
    } else {
      ray.x += xOffset
      ray.y += yOffset
      depthOfField +=1
    }


  }
  ray.x = Math.round(ray.x)
  ray.y = Math.round(ray.y)
  return ray
}

//petrea elskar eyjolfinn sinn

// make guide lines formulas

const guideLines = []
ctx.fillStyle = "rgba(100, 100, 100, 1)";
ctx.fillRect(0,0,WIDTH,HEIGHT);
ctx.fillStyle = "rgba(200, 200, 200, 1)";
ctx.fillRect(WIDTH2,0,WIDTH,HEIGHT);

for(let i = 0; i<=map.x; i++){
  const point1 = [VPOINT,WIDTH2+SCREEN2] // use to adjust line
  const point2 = [HEIGHT,WIDTH2+i*map.gridSize] // lower point
  guideLines.push(lineThroughPoints(point1,point2))
}
for(let i = 0; i<=map.x; i++){
  const point1 = [VPOINT,WIDTH2+SCREEN2] // use to adjust line
  const point2 = [HEIGHT-100,WIDTH2+i*map.gridSize] // lower point
  guideLines.push(lineThroughPoints(point1,point2))
  const {slope,intercept} = guideLines[map.x+i]
  lineFromEq(slope,intercept,1)
}

console.log(guideLines)
guideLines.forEach(({slope,intercept})=>{
  //lineFromEq(slope,intercept)
})

debugger;

/// BEGIN DRAW 
const draw = () => {

  if (!canvas.getContext) {
    return
  }

    switch(true){
    case pushKeys.w:
      player.x += player.dx
      player.x = player.x % WIDTH 
      player.y += player.dy % HEIGHT
      player.y <0  && (player.y = HEIGHT)
      console.log(player.x,player.y)
      break;
    case pushKeys.s:
      player.x -= player.dx 
      player.y -= player.dy 
      break;
    case pushKeys.q:
    case pushKeys.a:
      player.angle -= 0.1
      player.angle = player.angle < 0 ? player.angle+(2*Math.PI) :player.angle
      player.dx = Math.cos(player.angle) * 5
      player.dy = Math.sin(player.angle) * 5
      break;
    case pushKeys.e:
    case pushKeys.d:
      
      player.angle += 0.1
      player.angle = player.angle > 2*Math.PI ? player.angle-(2*Math.PI) :player.angle
      player.dx = Math.cos(player.angle) * 5
      player.dy = Math.sin(player.angle) * 5
      break;           
    default:

  }

  //ctx.clearRect(0,0,WIDTH,HEIGHT)
  ctx.fillStyle = "rgba(100, 100, 100, 1)";
  ctx.fillRect(0,0,WIDTH,HEIGHT);


  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(frames++%WIDTH, 0, 4, 4);


  // draw map
  const {gridSize,wallColor,floorColor} = map;
  map.map.forEach((wall,index)=>{
    const x = index%map.x-1
    const y = Math.floor(index/map.y)
    ctx.fillStyle = wall ? wallColor : floorColor
    ctx.fillRect(x*gridSize+1, y*gridSize+1, gridSize-1, gridSize-1);
  })

// Draw player
  const playerXRound = Math.round(player.x)
  const playerYRound = Math.round(player.y)
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.strokeStyle = player.color
  ctx.moveTo(playerXRound, playerYRound);
  ctx.lineTo(player.x+Math.floor(player.dx*5), player.y + Math.floor(player.dy*5));
  ctx.stroke();
  ctx.fillRect(player.x-2,player.y-2,5,5);
  ctx.beginPath();
  ctx.moveTo(0,player.y);
  ctx.lineTo(WIDTH2,player.y);
  ctx.stroke();


  const ray = drawRays3D()
 // console.log(ray)
  ctx.beginPath();
  ctx.moveTo(playerXRound, playerYRound);
  ctx.lineTo(ray.x, ray.y);
  ctx.stroke();


  // 3dmode
  // Guide lines
  
    for(let i = 0; i<=map.x; i++){
      // const point1 = [WIDTH2+SCREEN2+ (i-4)*map.gridSize/4,HEIGHT2]
      // const point2 = [WIDTH2+i*map.gridSize,HEIGHT] // lower point
      
      // ctx.beginPath();
      // ctx.moveTo(point1[0],point1[1]);
      // ctx.lineTo(point2[0],point2[1]);
      // ctx.stroke();
  }


  //debugger
  
  const lastRow = Array(map.x).fill(0)
  let lastLineBottom = 0
  let lastX = 0
  for(let i = 0; i<map.y*3; i++){
    const yDist = gridSize * i - (HEIGHT-playerYRound)
    // 0.7**x-1
    const scalar = Math.pow(0.7,yDist/map.gridSize-1)
    const lineHeight = scalar*HEIGHT2// (HEIGHT2 / (yDist / gridSize))
    
    //const lineBottom = lineHeight / 2 + HEIGHT2
    const lineBottom = HEIGHT2+lineHeight
    //console.log(yDist)
    let xPosLast = 0
    
    if (i === 0){
        console.log(yDist, lineHeight, lineBottom)
    }
    for(let j = 0; j<=map.x; j++){
    if(true){
        const {slope,intercept} = guideLines[j]
        const x = intercept+slope*lineBottom
        ctx.fillRect(intercept+slope*lineBottom-2,lineBottom-2,4,4);
        // horizontal line
        if(j > 0) {
          ctx.beginPath();
          ctx.moveTo(lastX,lineBottom);
          ctx.lineTo(intercept+slope*lineBottom,lineBottom);
          ctx.stroke()
        }
        // vertical line
        if(i > 0 && lastRow[j] > 0) {
          const lastStroke = ctx.strokeStyle
          ctx.strokeStyle = "rgb(160, 0, 160)";
          ctx.beginPath();
          ctx.moveTo(lastRow[j],lastLineBottom);
          ctx.lineTo(intercept+slope*lineBottom,lineBottom);
          ctx.stroke()
          ctx.strokeStyle = lastStroke
        }


      lastRow[j] = x
      lastX = x
     
          
      }
      if(j === map.x){
        lastLineBottom = lineBottom
      }
    }


  }

 




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






  const data = imageData.data
  // console.log(data.length)
  // console.log(imageData)
  // for (let i = 0; i < data.length-frames++; i += 4) {
  //   data[i] = 0; // red
  //   data[i + 1] = 0; // green
  //   data[i + 2] = 0; // blue
  //   data[i + 3] = 255; // alpha
  //   ctx.putImageData(imageData, 0, 0);
  // }
  //console.log(imageData)
  ctx.putImageData(imageData, 0, 0);
}

window.onload = setInterval(draw,1000/30)


                // debugger
                // GÖMul leið til að reikna línur
                // veit ekki hvernig þetta virkaði
                // const xIntersect = j-half;
                // const run = HEIGHT2/map.gridSize; // 4

                // //const run = j-half
                // const rise = xIntersect //- (4-j/4)
                // const slope = rise/run
                // const x = (lineBottom/map.gridSize)*slope-xIntersect
                // const xScaled = SCREENR2+x*map.gridSize 
                // //ctx.lineTo(xScaled,lineBottom);
                
                // ctx.fillRect(xScaled-2,lineBottom-2,6,6);
                //ctx.stroke();
                //ctx.beginPath();
                //ctx.moveTo(lastRow[j],lastLineBottom);
                //ctx.lineTo(xScaled,lineBottom);
                //ctx.stroke();
                //xPosLast = xScaled;
                //lastRow[j] = xScaled