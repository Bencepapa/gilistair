/// <reference path="definitions/pixi.js.d.ts"/>
/*global pi, SNAKE, snakes, PIXI, randomColor, FOOD, foods */
/* global addplayer, PLAYER, players, Stats*/
"use strict"

/***************************
Initialize PIXI
***************************/
/*
var game = function () {

  var _tweens = [];

};*/
/*
//sounds
var sfxHit = new Howl({
  urls: ['hit.wav'],
  autoplay: false,
  volume: 0.1,
});
var sfxExplosion = new Howl({
  urls: ['explosion2.wav'],
  autoplay: false,
  volume: 0.2,
});
var sfxDeath = new Howl({
  urls: ['death.wav'],
  autoplay: false,
});
var sfxShoot = new Howl({
  urls: ['shoot.wav'],
  volume: 0.2,
  autoplay: false,
});
*/

var stats;
//console.log(typeof Stats);
if (typeof Stats != "undefined") { 
    // safe to use the function
    stats = new Stats();
    stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    // align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );
}
else
{
    stats = {
        begin : function() {},
        end : function() {},
    };
    //console.log(stats);
}


//var GameOver=false;
//var scores = 0;
var mytimer = 0;
var GAME_WIDTH = 540; //1920 //1600;
var GAME_HEIGHT = 960; //1080 //1080;
var renderer = PIXI.autoDetectRenderer(GAME_WIDTH,GAME_HEIGHT);
renderer.view.style.display="block";
renderer.view.style.marginLeft="auto";
renderer.view.style.marginRight="auto";
resize();
document.body.appendChild(renderer.view);
window.addEventListener("resize", resize);

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

var Stage = new PIXI.Container();

var Container = new PIXI.Container();
//var newPosition = {x: 150};
Stage.addChild(Container);

var EarthContainer = new PIXI.Graphics();
Stage.addChild(EarthContainer);
createBackground1b(EarthContainer);
EarthContainer.cacheAsBitmap=true;
//EarthContainer.alpha=0.1;

var MudContainer = new PIXI.Graphics();
Stage.addChild(MudContainer);

/*
{
  var g = EarthContainer;
  var deltay=70;
  for (var y=0; y<GAME_HEIGHT+50; )
  {
    if (y===0)
    {
      // grass
      g.beginFill(parseInt(randomColor({
        luminosity: 'dark',
        hue: 'green'}
        ).slice(1), 16));
    }
    else
    {
      // mud
      g.beginFill(parseInt(randomColor({
        luminosity: 'dark',
        hue: 'orange'}
        ).slice(1), 16));
    }
    for (var x=0; x<GAME_WIDTH; x += deltay/2 + Math.random()*10-5)
    {
      g.drawCircle(x,
       y + Math.floor(Math.random()*deltay*0.5-deltay*0.25),
       Math.random()*deltay/2+deltay);
    }
    g.endFill();
    y += deltay;
    deltay = Math.floor(Math.random()*50+10);
    y += deltay;
  }
//sky
    g.beginFill(parseInt(randomColor({
      luminosity: 'dark',
      hue: 'blue'}
      ).slice(1), 16));
    for (var x=0; x<GAME_WIDTH; x += 30)
    {
      g.drawCircle(x,
       0,
       Math.random()*10 + 30);
    }
    g.endFill();
    //g.cacheAsBitmap = true;
}
*/
var FoodContainer = new PIXI.Graphics();
Stage.addChild(FoodContainer);

var SnakeContainer = new PIXI.Graphics();
Stage.addChild(SnakeContainer);

var NameContainer = new PIXI.Graphics();
Stage.addChild(NameContainer);

var status_ = new PIXI.Graphics();
status_.x=10;
status_.y=5;
Stage.addChild(status_);
var statusoffset=0;
statusoffset=5;
/*
var SnakeToAdd;
for (var i = 0; i< 4; ++i)
{
  SnakeToAdd = Object.create(SNAKE);
  SnakeToAdd.set(Math.random()*(GAME_WIDTH-100)+50,Math.random()*(GAME_HEIGHT-200)+150,Math.random()*pi*2);
  SnakeToAdd.forward(1.0, 1.0);
  //SnakeToAdd.idle=false;
  snakes.push(SnakeToAdd);
}
*/

var Foodtoadd;
for (var i = 0; i< 5; ++i)
{
  Foodtoadd = Object.create(FOOD);
  var spwn = getSpawnPoint();
  Foodtoadd.set(FoodContainer, spwn[0],spwn[1]);
  foods.push(Foodtoadd);
}



requestAnimationFrame(animate);





function onAirMessage(from, data)
{
	//console.log(from);
  if (!(from in players))
  {
    console.log("Not in players, id: "+from);
		return;
  }
	var player=players[from];
    for (var k1 in data) {
      //console.log(k);

      if (k1=="change")
      {
        player.randomstyle();
        //player.set("name", from, status_, statusoffset);
      }
    }
  for (var s in player.snakes)
  {
    var snake = player.snakes[s];

    if (snake.idle)
    {
      snake.idle = false;
      //snake.desiredlength += snake.deltalength;
    }
    //console.log(snake);
    for (var k in data) {
      //console.log(k);
      if (k=="left" || k=="right")
      {
        snake.pressed[k]=data[k].pressed;
      }
    }
  }
}

function resize() {
  var ratio = window.innerHeight/GAME_HEIGHT;
  var width = (GAME_WIDTH*ratio);
  var height = window.innerHeight;
  if (width > window.innerWidth)
  {
    width = window.innerWidth -5;
    height = window.innerWidth/GAME_WIDTH * GAME_HEIGHT -5;
  }
  renderer.view.style.height = height + "px";
  renderer.view.style.width = width + "px";
}

var fps = 20;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;

var frametime=0;
var lastframe=0;
var lastreport=0;
function animate() {
  requestAnimationFrame(animate);
  now = Date.now();
  delta = now - then;
     
    if (delta > interval) {
      stats.begin();
      onFrame();
      //renderer.render(Container);
      renderer.render(Stage);
      stats.end();
      
      frametime += (now-lastframe-frametime) / 10;
      lastframe = now;
      if (now - lastreport > 1000)
      {
        //var fps = (1000 / frametime).toFixed(1);
        //console.log(fps);
        //status_.text= ""+fps + " fps"; 
        lastreport=now;
      }
      //then = now - (delta % interval);
      then += interval;
    }   
}


function createSky(g, height)
{
 //sky
    g.beginFill(parseInt(randomColor({
      luminosity: 'dark',
      hue: 'blue'}
      ).slice(1), 16));
    g.drawRect(0,0, GAME_WIDTH, height);
    /*
    for (var x=0; x<GAME_WIDTH; x += 30)
    {
      g.drawCircle(x,
       0,
       Math.random()*10 + 30);
    }*/
    g.endFill();
    g.beginFill(0xffffff, 0.4);
    g.drawRect(0,height, GAME_WIDTH, 2);

    g.endFill();

    //stars
    var starcolor = parseInt(randomColor({
      luminosity: 'light',
      hue: 'yellow'}
      ).slice(1), 16);
    for (var x=0; x<GAME_WIDTH; x += 30)
    {
      var y = Math.random()*height*0.8;
      var r = Math.random()*2+1;
      g.beginFill(0xffffff,0.4);
      g.drawCircle(x,
       y,
       r*1.7);
      g.endFill();
      g.beginFill(starcolor);
      g.drawCircle(x,
       y,
       r);
      g.endFill();
    }
    //g.endFill();
}

function createMud(g, color)
{
  var deltay=20;

  // mud
  g.beginFill(color);
  for (var y=deltay; y<GAME_HEIGHT+50; )
  {
    deltay = Math.floor(Math.random()*15+10);
    y += deltay;
    for (var x=0; x<GAME_WIDTH; x += deltay + Math.random()*10)
    {
      g.drawCircle(x,
       y + Math.floor(Math.random()*deltay*2-deltay*1),
       Math.random()*5+2);
    }
    y += deltay;
  }
  g.endFill();
}

function createGrass(g, color, height)
{ 
// grass
  var deltay=height*1.1;
  /*g.beginFill(0x000000, 0.3);
  for (var x=0; x<GAME_WIDTH; x += deltay/2 + Math.random()*10-5)
  {
    g.drawCircle(x,
     Math.floor(Math.random()*deltay*0.5-deltay*0.25),
     Math.random()*deltay/2+deltay);
  }
  g.endFill();*/

  deltay=height;
  g.beginFill(color);
  for (var x=0; x<GAME_WIDTH; x += deltay/2 + Math.random()*10-5)
  {
    var r = Math.random()*deltay/2+deltay;
    var y = Math.floor(Math.random()*deltay*0.5-deltay*0.25);
    g.beginFill(0x000000, 0.3);
    g.drawCircle(x,
     y+10,
     r);
    g.beginFill(color, 1.0);
    g.drawCircle(x,
     y,
     r);
  }
  g.endFill();
}

function createBackground1(g)
{
  var deltay=70;
  for (var y=0; y<GAME_HEIGHT+50; )
  {

    // earth
    g.beginFill(parseInt(randomColor({
      luminosity: 'dark',
      hue: 'orange'}
      ).slice(1), 16));

    for (var x=0; x<GAME_WIDTH; x += deltay/2 + Math.random()*10-5)
    {
      g.drawCircle(x,
       y + Math.floor(Math.random()*deltay*0.5-deltay*0.25),
       Math.random()*deltay/2+deltay);
    }
    g.endFill();
    y += deltay;
    deltay = Math.floor(Math.random()*50+10);
    y += deltay;
  }
  
  createMud(g, 0x5c3410);
  createGrass(g, parseInt(randomColor({
    luminosity: 'dark',
    hue: 'green'}
    ).slice(1), 16),
    90 //height
    );

  createSky(g, 80);
    //g.cacheAsBitmap = true;
}

function createBackground1b(g)
{
  var deltay=70;
  //var colors = [0x886151, 0x795748, 0x674a3d, 0x664536, 0x634030];
  //var colors = [0x665148, 0x5f4c43, 0x57463e, 0x4f3f38, 0x483933]; //darker, less contrast
  var colors = [0x5f4f48, 0x5f4c43, 0x57463e, 0x4f3f38, 0x483933]; //darker, lesser contrast
  for (var y=0; y<GAME_HEIGHT+50; )
  {
    if (y===0)
    {
      // grass
      g.beginFill(parseInt(randomColor({
        luminosity: 'dark',
        hue: 'green'}
        ).slice(1), 16));
    }
    else
    {
      // earth
      g.beginFill(colors[Math.floor(Math.random()*colors.length)]);
    }
    for (var x=0; x<GAME_WIDTH; x += deltay/2 + Math.random()*10-5)
    {
      g.drawCircle(x,
       y + Math.floor(Math.random()*deltay*0.5-deltay*0.25),
       Math.random()*deltay/2+deltay);
    }
    g.endFill();
    y += deltay;
    deltay = Math.floor(Math.random()*50+10);
    y += deltay;
  }
  
  //createMud(g, 0x5c3410);

  createGrass(g, parseInt(randomColor({
    luminosity: 'dark',
    hue: 'green'}
    ).slice(1), 16),
    90 //height
  );
  createSky(g, 80);
}


function createBackground2(g)
{
  g.beginFill(0x885F3C);
  g.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  g.endFill();

  // mud
  createMud(g, 0x5c3410);

  createGrass(g, parseInt(randomColor({
    luminosity: 'dark',
    hue: 'green'}
    ).slice(1), 16),
    90 //height
  );

  createSky(g, 80);
}


//
// OnFrame
//
function onFrame() {
//  if (mytimer>2) return;
  var Snake; 
  var s = SnakeContainer;
  s.clear();
  
  for (var pl in players)
  {
    var player = players[pl];
    player.update(s);
    /*
    for (var snakeI in player.snakes)
    {
      Snake = player.snakes[snakeI];
      Snake.update(s);
      if (!Snake.idle && !Snake.dead)
      {
        Snake.checkHitFood(foods);
        for (var pl2 in players)
        {
          var player2 = players[pl2];      
          Snake.checkHitSnake(player2.snakes);
        }
      }
    }*/
  }

  // dig mud
  var g = MudContainer;
  //var c = Math.random()*0.1;
  var c=0.05; //maybe random from 0.0-0.1
  g.beginFill(PIXI.utils.rgb2hex([0.15+c, 0.10+c, 0.07+c]));
  for (var pl in players)
  {
    var player = players[pl];
    for (var snakeI2 in player.snakes)
    {
      Snake = player.snakes[snakeI2];
      if (Snake.dead) continue;
      if (Snake.segments.length < 5) continue;
      var head0 = Snake.gethead(1);
      var head = Snake.gethead(3);
      var head2 = Snake.gethead(5);
      var head3 = Snake.gethead(7);
      var w = Snake.width * 0.8;

      var p = head0.getleft(1);
      g.moveTo(p[0], p[1]);
      p = head.getleft(w);
      g.lineTo(p[0], p[1]);
      p = head2.getleft(w);
      g.lineTo(p[0], p[1]);
      p = head3.getleft(w*0.5);
      g.lineTo(p[0], p[1]);
      
      p = head3.getright(w*0.5);
      g.lineTo(p[0], p[1]);
      p = head2.getright(w);
      g.lineTo(p[0], p[1]);
      p = head.getright(w);
      g.lineTo(p[0], p[1]);
      //g.drawCircle(head.x, head.y, head.width*Snake.width * 1.2); //slow!
    }
  }
  g.endFill();
  
  //food
  for (var foodI in foods)
  {
    var food = foods[foodI];
    if (food.graphics.visible===false)
    {
      var spwn = getSpawnPoint();
      food.set(FoodContainer,spwn[0],spwn[1]);
    }
    food.update();
  }

  mytimer += 0.005;
}