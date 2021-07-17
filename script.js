let cvn = document.createElement('canvas');
cvn.id = ('cvn');
document.body.appendChild(cvn);

const canvas = document.getElementById('cvn'),
ctx = canvas.getContext('2d');

const interval = 1000 / 60,
step = interval / 1000;

canvas.width = 720;
canvas.height = 480;

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------


let mouseX, mouseY, mousePos,
    leftClickPressed = false,
    rightClickPressed = false
;

let rightArrowPressed = false,
    leftArrowPressed = false, 
    upArrowPressed = false,
    downArrowPressed = false,
    spaceBarPressed = false
;

function getMousePos(canvas, evt) {
  this.rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - this.rect.left,
    y: evt.clientY - this.rect.top
  };
}

function mouseMoved(evt) {
  mousePos = getMousePos(canvas, evt);
  mouseX = mousePos.x;
  mouseY = mousePos.y;
}


function keyDown(event) {
  switch (event.keyCode){  //event.keyCode uses numbers
    case 38:
    upArrowPressed = true;
      break;
    case 37:
    leftArrowPressed = true;
      break;
    case 40:
    downArrowPressed = true;
      break;
    case 39:
    rightArrowPressed = true;
      break;
    case 32:
    spaceBarPressed = true;
      break;
  }
}

function keyUp(event) {
  switch (event.which){  //event.keyCode uses numbers
    case 38:
    upArrowPressed = false;
      break;
    case 37:
    leftArrowPressed = false;
      break;
    case 40:
    downArrowPressed = false;
      break;
    case 39:
    rightArrowPressed = false;
      break;
    case 32:
    spaceBarPressed = false;
      break;
  }
}

function mouseDown(event){
  switch (event.button){
    case 0:
    leftClickPressed = true;
      break;
    case 2:
    rightClickPressed = true;
      break;
  }
}

function mouseUp(event){
    switch (event.button){
    case 0:
    leftClickPressed = false;
      break;
    case 2:
    rightClickPressed = false;
      break;
    }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function rectangle(left, top, width, height) {
  this.left = left || 0;
  this.top = top || 0;
  this.width = width || 0;
  this.height = height || 0;
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;


  this.set = function(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width || this.width;
    this.height = height || this.height;

    this.right = (this.left + this.width);
    this.bottom = (this.top + this.height);

    this.centerX = this.left - this.width/2;
    this.centerY = this.top - this.height/2;
  }

  this.within = function(r) {
    return (r.left <= this.left &&
      r.right >= this.right &&
      r.top <= this.top &&
      r.bottom >= this.bottom);
  }

  this.overlaps = function(r) {
    return (this.left < r.right &&
      r.left < this.right &&
      this.top < r.bottom &&
      r.top < this.bottom);
  }

  this.draw = function (xView, yView){

    this.xView = xView;
    this.yView = yView;

    ctx.strokeStyle = ('#F00');
    ctx.strokeRect((this.left - this.width/2) - this.xView, (this.top - this.height/2) - this.yView, this.width, this.height);
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function button(string, x, y, width, height, color){

  this.string = string;

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;

  this.fontSize = (this.width * this.height) * 0.0009;

  this.draw = function (){
    ctx.fillStyle = ('rgba(10,10,10,0.9)');
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = ('#FFF'); //DDD
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = (this.fontSize + 'px ' + 'Times New Roman');
    ctx.fillStyle = (this.color);
    ctx.fillText(this.string, this.x + this.width/2, this.y + this.height/2);
  }
}

function btnChecker(btn){
  btn.top = btn.y;
  btn.bottom = btn.y + btn.height;
  btn.left = btn.x;
  btn.right = btn.x + btn.width;

  return btn.top < mouseY && btn.bottom > mouseY && btn.right > mouseX && btn.left < mouseX;
}

function buttonStuff(button, handler){
  if(btnChecker(button)){
    document.body.style.cursor = ('pointer');
    if(leftClickPressed)
      handler();
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// possible axises to move the camera
const axis = {
  none: 1,
  horizontal: 2,
  vertical: 3,
  both: 4
};

function camera(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight) {
    // position of camera (top-left coordinates)
    this.xView = xView || 0;
    this.yView = yView || 0;

    // distance from followed object to border before camera starts move
    this.xDeadZone = 0 || 0; // min distance to horizontal borders
    this.yDeadZone = 0; // min distance to vertical borders

    // viewport dimensions
    this.wView = viewportWidth;
    this.hView = viewportHeight;

    // allows camera to move in both axises
    this.cAxis = axis.both;

    // object that should be followed
    this.followed = null;

    // rectangle that represents the viewport
    this.viewportRect = new rectangle(this.xView, this.yView, this.wView, this.hView);

    // rectangle that represents the world's boundary (room's boundary)
    this.worldRect = new rectangle(0, 0, worldWidth, worldHeight);

  this.follow = function(gameObject, xDeadZone, yDeadZone) {
    this.followed = gameObject;
    this.xDeadZone = xDeadZone;
    this.yDeadZone = yDeadZone;
  }

  this.update = function() {
    if (this.followed != null) {
      if (this.cAxis == axis.horizontal || this.cAxis == axis.both) {
        // moves camera horizontally depending on the followed object position
        if (this.followed.x - this.xView + this.xDeadZone > this.wView)
          this.xView = this.followed.x - (this.wView - this.xDeadZone);
        else if (this.followed.x - this.xDeadZone < this.xView)
          this.xView = this.followed.x - this.xDeadZone;

      }
      if (this.cAxis == axis.vertical || this.cAxis == axis.both) {
        // moves camera vertically depending on the followed object position
        if (this.followed.y - this.yView + this.yDeadZone > this.hView)
          this.yView = this.followed.y - (this.hView - this.yDeadZone);
        else if (this.followed.y - this.yDeadZone < this.yView)
          this.yView = this.followed.y - this.yDeadZone;
      }
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function map(img, sX = 0, sY = 0, sW, sH, dX, dY, dW, dH){
  
  this.img = new Image();
  this.img.src = img;

  this.sW = sW;
  this.sH = sH;
  
  this.dX = dX;
  this.dY = dY;
  this.dW = dW;
  this.dH = dH;

  this.draw = function (xView, yView){ 
    this.sX = xView;
    this.sY = yView;

    ctx.drawImage(this.img, this.sX, this.sY, this.sW, this.sH, this.dX, this.dY, this.dW, this.dH);
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function gameAsset(img, sX, sY, sW, sH, dX, dY, dW, dH){
  this.img = new Image();
  this.img.src = img;

  this.sX = sX;
  this.sY = sY;
  this.sW = sW;
  this.sH = sH;
  
  this.dX = dX;
  this.dY = dY;
  this.dW = dW;
  this.dH = dH;

  this.draw = function(xView, yView, drawHitBox = null){
    this.drawHitBox = drawHitBox;

    ctx.save();
   
    ctx.drawImage(this.img, this.sX, this.sY, this.sW, this.sH, (this.dX - this.dW/2) - xView, (this.dY - this.dH/2) - yView, this.dW, this.dH);

    ctx.restore(); 

    if (this.drawHitBox != null) {
      ctx.strokeStyle = '#000';
      ctx.strokeRect(this.hitbox.left - xView, this.hitBox.top - yView, this.hitBox.width, this.hitBox.height);
    }
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let playerGravityEqualsZero = false;

function player(x, y, width, height, velocityX, velocityY) {

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.velocityX = velocityX;
  this.velocityY = velocityY;

  this.gravitySpeed = 0;
  this.bottomY = y;

  this.gravityF = function(){
    this.gravity = 0.5;
    this.bottom = function (){
    if(this.y >= this.bottomY){
      this.y = y;
      this.gravitySpeed = 0;
      this.gravity = 0;
    }
    this.gravitySpeed += this.gravity;
    this.y += this.velocityY + this.gravitySpeed;  
    }
  }

  this.hitBox = new rectangle(this.x, this.y, this.width, this.height);

  this.drawHitBox = null;

  this.draw = function (xView, yView, drawHitBox = false){
    this.drawHitBox = drawHitBox;

    ctx.save();

    ctx.fillStyle = '#000';		
    ctx.fillRect((this.x - this.width / 2) - xView, (this.y - this.height / 2) - yView,this.width, this.height);

    ctx.restore();

    if(this.drawHitBox == true) {
      userhit.draw(xView, yView);
    }
  }

  this.update = function (){
    this.x += this.velocityX * step;
    this.y += this.velocityY * step;
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function land(y, color, width = 2000, height = 1000, x = -10){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.draw = function (xView, yView){
    ctx.fillStyle = (color);
    ctx.fillRect(this.x - xView, this.y - yView, this.width, this.height);
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const vWidth = Math.min(2000, canvas.width),
vHeight = Math.min(1000, canvas.height);

let mainBckg = new map('mountains/Paint Layer 2.PNG', 0, 0, canvas.width, canvas.height, 0, 0, canvas.width,canvas.height);

let user = new player(1000, 700, 50, 50, 0, 0);

let house = new gameAsset('house.png', 0, 0, 453, 173, 1000, 700, 200, 100 );

let chicken = new gameAsset('farm.png', 325, 415, 60, 80, 1000, user.y, 60, 80);

let door = new rectangle(house.dX + 20, house.dY - 15, house.dW - 150, house.dH - 30);

//will change coordinates of the door at some point

let floor = new land(user.y + user.height, "#000");

let userhit = new rectangle(user.x, user.y, user.width, user.height);

let cam = new camera(0, 0, vWidth, vHeight, 2000, 1000);

cam.follow(user, vWidth / 2, vHeight / 2);

$(canvas).mousemove(function(e) {mouseMoved(e)});
$(canvas).mousedown(function(e){mouseDown(e)});
$(canvas).mouseup(function(e){mouseUp(e)});
$(document).keydown(function(e){keyDown(e)});
$(document).keyup(function(e){keyUp(e)});

function update(){
  if(user.hitBox.overlaps(door)){
  }
  user.velocityX = 0;
  if(leftArrowPressed){
    user.velocityX = -200;
  } 
  if(rightArrowPressed){
    user.velocityX = 200;
  }

  if(user.y >= user.bottomY)
    user.velocityY = 0;
  if(upArrowPressed){
    user.velocityY = -10;
  } else if(!upArrowPressed){
    userGravityEqualsZero = false;
  }

  user.gravityF();
  user.bottom();

  user.hitBox.set(user.x, user.y, user.width, user.height);
  cam.update();
  user.update();

  if(user.hitBox.overlaps(door) && spaceBarPressed){

  }
}

function sectionChecker(){
  this.sectionIndex = 0;
  this.sectionArray = [0, 1];
  //section 0 is outside, section 1 is inside house

  this.update = function (){
    
  }
}

function render(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = ('#ECDBBA');
  ctx.fillRect(0, 0, 2000, 1000);

  mainBckg.draw(cam.xView, cam.yView);

  user.draw(cam.xView, cam.yView - 70, true); 
  house.draw(cam.xView, cam.yView - 70);
  door.draw(cam.xView, cam.yView - 70);
  chicken.draw(cam.xView, cam.yView - 65);
  floor.draw(cam.xView, cam.yView - 40);

}

function drawLoop(){
  if(document.readyState == "complete"){
    update();
    render();
  }
}

setInterval(drawLoop, interval);