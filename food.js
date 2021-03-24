/// <reference path="definitions/pixi.js.d.ts"/>
/* global polygon, simplepolygon, randomColor */
"use strict"

var FOOD = {
  /*color : 0x00ff00,
  width : Math.random()*15+5,
  x : 0,
  y : 0,
  life : 300,
*/  graphics : null,

  set : function (s, x, y) {
    this.color = parseInt(randomColor({
      luminosity: 'bright',
      hue: 'yellow'}
      ).slice(1), 16);
    this.width = Math.random()*30+5;
    var rnd = Math.floor(Math.random()*20);
    if (rnd<10)
    {
        this.type = 1; // normalfood
        this.value = this.width*0.1;
    }
    else if (rnd<16)
    {
        this.type = 2; // superfood
        this.value = this.width*0.2;
    }
    else if (rnd<18)
    {
        this.type = 3; // megafood
        this.value = this.width*0.3;
    }
    else
    {
        this.type = 4; // triforce
        this.width = 40;
        this.value = this.width*0.1;      
    }
    //this.type=2;
    this.x = x;
    this.y = y;
    this.life = 300+Math.random()*100;
    this.draw(s);
  },

  update : function (s) {
    if (this.graphics.visible === false)
    {
      return;
    }
    this.life--;
    if (this.life<30)
      this.graphics.alpha = this.life/30.0;
    if (this.life <0)
      this.dead();
  },

  draw : function (s) {
    //console.log(s);
    if (this.graphics === null)
    {
      this.graphics = new PIXI.Graphics();
      s.addChild(this.graphics);
    }
    //console.log(this.x, this.y);
    this.graphics.cacheAsBitmap = false;
    this.graphics.clear();
    this.graphics.visible = true;
    this.graphics.alpha = 1.0;
    this.graphics.x=this.x;
    this.graphics.y=this.y;
    //this.type=4;
   this.graphics.clear();
 
    switch (this.type)
    {
    case 1:
        this.graphics.beginFill(this.color);
        simplepolygon(this.graphics, 3, 0, 0, this.width);
        this.graphics.endFill();
        break;
    case 2:
        this.graphics.beginFill(this.color, 0.7);
        simplepolygon(this.graphics, 14, 0, 0, this.width);
        this.graphics.endFill();

        this.graphics.beginFill(this.color);
        simplepolygon(this.graphics, 12, 0, 0, this.width*0.85);
        this.graphics.endFill();

        break;
    case 3:
        this.graphics.beginFill(this.color);
        simplepolygon(this.graphics, 8, -this.width/2, 0, this.width/2);
        this.graphics.endFill();
        this.graphics.beginFill(this.color);
        simplepolygon(this.graphics, 8, 0, +this.width/2, this.width/2);
        this.graphics.endFill();
        this.graphics.beginFill(this.color);
        simplepolygon(this.graphics, 8, +this.width/2, 0, this.width/2);
        this.graphics.endFill();
        this.graphics.beginFill(this.color);
        simplepolygon(this.graphics, 8, 0, -this.width/2, this.width/2);
        this.graphics.endFill();

        break;
        
    case 4: //triforce
        this.graphics.beginFill(this.color);
        polygon(this.graphics, 3, 0, -this.width/2, this.width/2, this.width/2, Math.PI/6);
        this.graphics.endFill();
        this.graphics.beginFill(this.color);
        polygon(this.graphics, 3, -this.width/4, 0, this.width/2, this.width/2, Math.PI/6);
        this.graphics.endFill();
        this.graphics.beginFill(this.color);
        polygon(this.graphics, 3, +this.width/4, 0, this.width/2, this.width/2, Math.PI/6);
        this.graphics.endFill();

    }
    this.graphics.rotation = Math.random()*Math.PI*2;
    this.graphics.cacheAsBitmap = true;
  },
  dead: function() {
    this.graphics.visible = false;
  },
  checkhit: function(obj, radius) {
    //console.log(obj);
    var g = this.graphics;
    if (g.visible===false)
      return false;
    var w = g.width/2/2;
    var h = g.width/2/2;
    var wo = radius;
    var ho = radius;
    //console.log(g.x+'-'+w+' < '+obj.x+'+'+wo +'  &&  '+ g.x+'+'+w +' > '+ obj.x+'-'+wo);
    if (g.x-w < obj.x+wo && g.x+w > obj.x-wo &&
        g.y-h < obj.y+ho && g.y+h > obj.y-ho)
    {
      //console.log("HIT!");
      return true;
    }
    return false;
  },
};
var foods = [];