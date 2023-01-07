const UNIT_SIZE = 4

const cos = (degree) => Math.cos(degree * Math.PI / 180);
const sin = (degree) => Math.sin(degree * Math.PI / 180)

let key = null
const canvas = document.getElementById("tutorial");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
let frames = 0
console.log(canvas.length)

const player = {
  x: 70,
  y: -100,
  z: 10,
  angle: 0
} 

const wall = {
  x: Array(4),
  y: Array(4),
  z: Array(4)
}

const handleKeyDown = (e) => {
  key = e.key
}

document.addEventListener('keydown',handleKeyDown)

//petrea elskar eyjolfinn sinn

const draw = () => {

  if (!canvas.getContext) {
    return
  }
  const WIDTH = canvas.width;
  const WIDTH2 = WIDTH/2
  const HEIGHT = canvas.height;
  const HEIGHT2 = HEIGHT/2



  let xVelocity = cos(player.angle) * 10
  let yVelocity = sin(player.angle) * 10



    switch(key){
    case 'w':
      //console.log('forward');
      player.x += xVelocity
      player.y += yVelocity
      break;
    case 's':
      //console.log('backward');
      player.x -= xVelocity
      player.y -= yVelocity
      break;
    case 'a':
      //console.log('left');
      player.x += xVelocity
      player.y -= yVelocity
      break;
    case 'd':
      //console.log('right');
      player.x -= xVelocity
      player.y += yVelocity
      break;   
    case 'q':
      //console.log('rot left');
      player.angle -4 < 0 ? player.angle - 4 : player.angle + 360 - 4
      break;
    case 'e':
      //console.log('rot right');
      player.angle +4 > 359 ? player.angle + 4 : player.angle - 360 + 4
      break;           
    default:
      //console.log('no key')  
  }

  ctx.clearRect(0,0,WIDTH,HEIGHT)


  const dx=sin(player.angle)*10
  const dy=cos(player.angle)*10

  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(frames++%WIDTH, 0, 4, 4);


  // wall
  const x1 = 40-player.x
  const x2 = 40-player.x
  const y1 = 10-player.y
  const y2 = 290-player.y
  const cosN = cos(player.angle)
  const sinN = sin(player.angle)

  wall.x[0] = x1*cosN - y1*sinN
  wall.x[1] = x2*cosN - y2*sinN

  wall.y[0] = x1*cosN + y1*sinN
  wall.y[1] = x2*cosN + y1*sinN

  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(wall.x[0], wall.y[0], 4, 4);
  console.log(wall.x[0],wall.y[0])

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);






  const data = imageData.data;
  // console.log(data.length)
  // console.log(imageData)
  console.log(frames)
  // for (let i = 0; i < data.length-frames++; i += 4) {
  //   data[i] = 0; // red
  //   data[i + 1] = 0; // green
  //   data[i + 2] = 0; // blue
  //   data[i + 3] = 255; // alpha
  //   ctx.putImageData(imageData, 0, 0);
  // }
  //console.log(imageData)
  ctx.putImageData(imageData, 0, 0);
  key = null
}

window.onload = setInterval(draw,1000/30)