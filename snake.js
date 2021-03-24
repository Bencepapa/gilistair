/* global randomColor, GAME_HEIGHT, GAME_WIDTH */

//var pihalf = Math.PI/2;
var pi = Math.PI;

function getSpawnPoint()
{
  return [Math.random()*(GAME_WIDTH-100)+50,Math.random()*(GAME_HEIGHT-200)+150];
 
}

// Snake data
var SEGMENT = SEGMENT || (function () {
});

SEGMENT.prototype.width=1.0;

  SEGMENT.prototype.set = function (x, y, angle, width) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.width = width;
    this.cache = [];
    this.cache[0] = {};
    this.cache[1] = {};
    this.cachewidth = [];
    this.calc();
  };
  SEGMENT.prototype.calc = function () {
    this.cx = Math.cos(this.angle)*this.width;
    this.cy = Math.sin(this.angle)*this.width;
  };
  SEGMENT.prototype.getfromcache = function (side, width)
  {
    if (this.cachewidth[side]==width) return this.cache[side];
    return undefined;
    /*var p = this.cache[side][width];
    return p;*/
  };
  SEGMENT.prototype.inserttocache = function (side, width, p)
  {
    this.cachewidth[side]=width;
    this.cache[side]=p;
    //this.cache[side][width] = p;
  };  
  SEGMENT.prototype.getleft = function (width) {
    var p = this.getfromcache(0, width);
    if (p == undefined)
    {
    //p = {x : this.x + this.cy * width, y : this.y - this.cx * width};
      p = [this.x + this.cy * width, this.y - this.cx * width];

      this.inserttocache(0, width, p);
    }
    return p;
  };
  SEGMENT.prototype.getright = function (width) {
    var p = this.getfromcache(1, width);
    if (p == undefined)
    {
      //p = {x : this.x - this.cy * width, y : this.y + this.cx * width};
      p = [this.x - this.cy * width, this.y + this.cx * width];
      this.inserttocache(1, width, p);
    }
    return p;
  };
//});



var SNAKE = {
  color : parseInt(randomColor().slice(1), 16),
  width : Math.random()*15+5,
  angle : 0,
  x : 0,
  y : 0,
  cx : 0,
  cy : 0,
  lHead : 10, //length
  lTail : 10,
  wHead : [], //width
  wTail : [],
  pressed: {left: false, right: false},
  desiredlength : 3,
  deltalength : 5,
  l : 10,
  a : pi/180*10,
  idle : true, //never touched controller
  dead : false,
  deadleft : 1000,
  neededtoremove : false,

  reset : function(x,y,angle)
  {
    this.x = x;
    this.y = y;   
    this.angle = angle;
    this.cx = 1;
    this.cy = 0;
    this.desiredlength = 15;
    this.idle = true;
    this.dead = false;
    this.deadleft = 1000;
    this.neededtoremove = false;
    this.pressed = {left: false, right: false};
    this.segments.length=0;
    this.eatwidthcounter = 0;
    this.calc();
    this.blinkingtime=0;

    var segment = new SEGMENT();
    segment.set(this.x,this.y,this.angle);
    this.segments.push(segment);
  },
  setplayer : function (player) {
    this.player = player;
  },
  set : function (x, y, angle) {
    this.segments = [];

    this.reset(x,y,angle);

    this.color = parseInt(randomColor({
      luminosity: 'light'}
      ).slice(1), 16);
    this.width = Math.random()*10+5;
    this.originalwidth = this.width;
    this.score = 0;

    this.wHead = []; //width
    this.wTail = [];

    this.lHead= 5+Math.floor(Math.random()*20); //length
    this.lTail= 5+Math.floor(Math.random()*20);
    this.typeHead = Math.floor(Math.random()*4+1);
    this.typeTail = Math.floor(Math.random()*3+0);
    this.precalcSnakeEnd(this.typeHead, 'head');
    this.precalcSnakeEnd(this.typeTail, 'tail');
  },

  clone : function()
  {
    var snake = Object.create(SNAKE);
    snake.x = this.x;
    snake.y = this.y;
    snake.angle = this.angle;
    snake.cx = this.cx;
    snake.cy = this.cy;
    snake.desiredlength = this.desiredlength;
    snake.idle = this.idle;
    snake.dead = this.dead;
    snake.color = this.color;
    snake.width = this.width;
    snake.originalwidth = this.originalwidth;
    snake.score = this.score;
    snake.segments = [];
    snake.wHead = []; //width
    snake.wTail = [];
    snake.lHead = this.lHead;
    snake.lTail = this.lTail;
    snake.typeHead = this.typeHead;
    snake.typeTail = this.typeTail;
    snake.precalcSnakeEnd(this.typeHead, 'head');
    snake.precalcSnakeEnd(this.typeTail, 'tail');
    snake.player = this.player;
    
    var segment = new SEGMENT();
    segment.set(this.x,this.y,this.angle);
    snake.segments.push(segment);

    return snake;
  },
  slice : function(s)
  {
    var newsnake = this.clone();
    newsnake.segments = this.segments.splice(0, s);
    if (this.segments.length < 4)
    {
      this.neededtoremove = true;
    }
    if (newsnake.segments.length < 4)
    {
      return;
    }
    newsnake.segments.reverse();
    var head = newsnake.gethead(0);
    if (head == undefined)
      return;
    for (var seg in newsnake.segments)
    {
      var segment = newsnake.segments[seg];
      segment.cachewidth = [];
      segment.angle += Math.PI;
      segment.calc();
    }
    newsnake.x = head.x;
    newsnake.y = head.y;
    newsnake.angle = head.angle;
    newsnake.calc();

    newsnake.desiredlength = newsnake.segments.length;
    this.desiredlength = this.segments.length;
    this.player.addsnake(newsnake);
  },
  setstyle : function(snakestyle)
  {
    this.color = snakestyle.color;
    this.width = snakestyle.width;
    this.originalwidth = this.width;
    this.lHead = snakestyle.headlength;
    this.typeHead = snakestyle.headtype;
    this.lTail = snakestyle.taillength;
    this.typeTail = snakestyle.tailtype;
    this.precalcSnakeEnd(this.typeHead, 'head');
    this.precalcSnakeEnd(this.typeTail, 'tail');
    
  },

  calc : function () {
    this.cx = Math.cos(this.angle);
    this.cy = Math.sin(this.angle);
  },
  forward : function (l, w) {
    this.x += this.cx*l;
    this.y += this.cy*l;
    var segment = new SEGMENT();
    segment.set(this.x,this.y,this.angle, w);
    this.segments.push(segment);
    if (this.eatwidthcounter != 0)
    {
      //console.log(111);
      this.eatwidthcounter--;
      var prevhead = this.gethead(1);
      segment.width = prevhead.width;
      segment.calc();
    }
  },
  turn : function (l, angle, w) {
    this.angle += angle;
    this.calc();
    this.forward(l, w);
  },

  calcwidth : function (i, length) {
      var w = this.width;
      var ring=true;
      if (i<this.lTail)
      {
        w *= this.wTail[i];
        ring=false;
      }
      if (i>length-1-this.lHead)
      {
        w *= this.wHead[length-1-i];
        ring=false;
      }
      if (ring && i % 10 === 0) w *= 0.8;
      return w;
  },
/*
  calcwidth2 : function (i, length) {
      var w = this.width;
      if (i<10)
      {
        w *= 0.0+Math.abs(i*i*i/1000.0);
      }
      if (i>length-6)
      {
        //w *= 1.5;
        w *= (length - i)/4;
      }
      else if (i>length-10)
      {
        w *= 1 + (2 - (length - i - 6))*(1/4);
      }
      return w;
  },
*/
  setSnakeType: function(starttype, endtype)
  {
    this.precalcSnakeEnd(starttype, 'head');
    this.precalcSnakeEnd(endtype, 'tail');
  },

  precalcSnakeEnd: function (type, whichend)
  {
    var ws = this.wHead;
    var ls = this.lHead;
    if (whichend=='tail')
    {
      ws = this.wTail;
      ls = this.lTail;
    } else if (whichend=='head')
    {
      ws = this.wHead;
      ls = this.lHead;
    } else
    {
      console.log("invalid whichend: '"+whichend+"'");
      return;
    }
    //console.log(whichend + " type: "+type);
    var w=0;
    ws.length = 0;
    for (var i=0; i<ls; ++i)
    {
      switch (type)
      {
        case 0:
          w = i/ls; //tail
        break;
        case 1:
          w = 1-Math.pow(1-i/ls,6); //rounded
        break;
        case 2:
          w = 0.2 + 0.8-Math.pow(1-i/ls,6)*0.8; //rounded
        break;
        case 3:  // big head
          w = Math.sin(i/ls*Math.PI*0.8)*1.2+0.3;
          w *= 1.3-Math.pow(i/ls,2)*0.3;
        break;
        case 4:  // head with ring
          if (i<ls/2)
          {
            w = 1-Math.pow(1-i/(ls/2),2); //not so rounded
          }
          else
          {
            w = 1.3;
          }
        break;
        default:
          console.log("ERROR: Invalid type " + type + " for " + whichend);
      }
      ws.push( w );
    }
  },

  gethead: function(num)
  {
    return this.segments[Math.max(0,this.segments.length-1-num)];
  },

  update : function (s) {
    var Snake = this;
    if (this.dead)
    {
      if (this.deadleft<=0)
      {
        this.neededtoremove = true;
        return;
      }
      --this.deadleft;
      if (this.deadleft<30)
      {
        this.width = this.originalwidth * (this.deadleft / 30);
      }
      
      this.draw(s);
      return;
    }
    if (Snake.idle)
    {
      Snake.turn(Snake.l/2, -Snake.a*2, 0.6);
    }
    else
    {
      var head = Snake.gethead(0); // head
      var newwidth = 1.0 + (head.width-1.0)*0.3;
      if (head.x < 50 || head.y < 170 ||
        head.x > GAME_WIDTH-50 || head.y > GAME_HEIGHT-50)
      {
        var angleToCenter = Math.atan2(GAME_HEIGHT/2 - this.y, GAME_WIDTH/2 - this.x);
        var angleDelta = angleToCenter - this.angle;
        if (angleDelta>Math.PI) angleDelta -= Math.PI*2;
        if (angleDelta<-Math.PI) angleDelta += Math.PI*2;
        if (angleDelta < 0)
          Snake.turn(Snake.l, -Snake.a, newwidth);
        else if (angleDelta > 0)
          Snake.turn(Snake.l, Snake.a, newwidth);

        Snake.x += (GAME_WIDTH/2-Snake.x>0)?+2:-2;
        Snake.y += (GAME_HEIGHT/2-Snake.y>0)?+2:-2;
      }
      else
      {
        if (Snake.pressed.left == Snake.pressed.right)
        {
          Snake.forward(Snake.l, newwidth);
        }
        else if (Snake.pressed.left)
          Snake.turn(Snake.l, -Snake.a, newwidth);
        else
          Snake.turn(Snake.l, Snake.a, newwidth);
        }
     }
    if (Snake.segments.length >= Snake.desiredlength)
      Snake.segments.shift(); //delte first element from array
    //Snake.forward(l);

     //s.lineStyle(1, 0xffffff, 1.0);
    Snake.draw(s);
  },

  eat : function(length, width)
  {
    var head = this.gethead(0);
    this.desiredlength += this.deltalength*length;
    head.width *= 1.0+width;
    head.calc();
    this.eatwidthcounter = 1;
  },

  checkHitFood: function(arr)
  {
    var head = this.gethead(0);
    for (var a in arr)
    {
      var food = arr[a];
      if (food.graphics.visible===false)
        continue;
      if (food.checkhit(head, this.width))
      {
        this.player.addscore(food.value);
        this.eat(food.value, food.width/30.0*0.5);
        if (food.type==4)
        {
          this.blinkingtime=300;
        }
        food.dead();
      }
    }
  },
  checkHitSnake: function(arr)
  {
    if (this.idle || this.dead)
    {
      //console.log("idle");
      return false;
    }
    //console.log(this.idle);
    //var head = this.gethead(0);
    for (var a in arr)
    {
      var snake = arr[a];

      for (var s in snake.segments)
      {
        var isSelf=false;
        if (snake == this)
        {
          isSelf=true;
          if (s>this.segments.length-10)
            continue; // 10 segment from the head left out from the check
        }
        var seg = snake.segments[s];
        if (this.checkhit(seg, snake.width))
        {
          if (snake.idle)
          {
            // idle snake can be eaten!!!
            if (!isSelf)
            {
              snake.die();
              this.eat(1, 0.7);
              this.player.addscore(1);
            }
            return false;   
          }
          if (this.blinkingtime>0)
          {
            snake.slice(s);
          }
          else
          {
            this.die();
            if (isSelf)
            {
              this.player.addscore(-1);
            }
            else
            {
              snake.player.addscore(10);
            }
          }
          return true;
        }
     }
    }
    return false;
  },
  die : function()
  {
    if (this.idle)
    {
        var spwn = getSpawnPoint();
        this.reset(spwn[0],spwn[1],Math.random()*pi*2);
        this.forward(1.0, 1.0); 
    }
    else
    {
        //this.player.createnewsnake();
        this.color=0xffffff;
        this.dead=true;
    }
  },
  addscore : function(score)
  {
    this.score += score;
  },
  draw : function (s) {
    var Snake = this;
    var color = Snake.color;
    if (this.blinkingtime>0)
    {
      --this.blinkingtime;
      color = Math.floor(Math.random()*0xffffff)
    }
    s.moveTo(Snake.segments[0].x, Snake.segments[0].y);
    s.beginFill(color);

    var segment,i,w,p; 
      //left side
    var length = Snake.segments.length;
    for (i=1; i < length; ++i)
    {
      segment = Snake.segments[i];
      //console.log(segment);
      w = this.calcwidth(i, length);
      p = segment.getleft(w);
      s.lineTo(p[0], p[1]);      
    }
    //right side
    for (i=Snake.segments.length-1; i > 0; --i)
    {
      segment = Snake.segments[i];
      w = this.calcwidth(i, length);
      p = segment.getright(w);
      s.lineTo(p[0], p[1]);
    }
    s.lineTo(Snake.segments[0].x, Snake.segments[0].y);
    s.endFill();
/*
	//eyes?
	head = this.gethead(1);
	p0 = head.getleft(Snake.width * 0.2);
    s.moveTo(p0.x, p0.y);
    s.beginFill(0xffffff, 1.0);
    head2 = this.gethead(2);
	p = head2.getleft(Snake.width * 0.2);
    s.lineTo(p.x, p.y);
    p = head2.getleft(Snake.width * 0.9);
    s.lineTo(p.x, p.y);
	p = head.getleft(Snake.width * 0.9);
    s.lineTo(p.x, p.y);
    s.endFill();*/
    /*
	head = this.gethead(3);
	p = head.getleft(Snake.width * 0.3);
    s.moveTo(p.x, p.y);
    s.beginFill(0xffffff, 1.0);
    head2 = this.gethead(4);
	p = head2.getleft(Snake.width * 0.3);
    s.lineTo(p.x, p.y);
    p = head2.getleft(Snake.width * 0.9);
    s.lineTo(p.x, p.y);
	p = head.getleft(Snake.width * 0.9);
    s.moveTo(p.x, p.y);
    s.endFill();*/
  },

  checkhit: function(obj, radius) {
    //console.log(obj);
    var g = this;
    //if (g.visible===false)
    //  return false;
    var w = g.width/2;
    var h = w; //g.width/2;
    var wo = radius/2;
    var ho = wo;
    //var ho = radius/2;
   // console.log(g.x+'-'+w+' < '+obj.x+'+'+wo +'  &&  '+ g.x+'+'+w +' > '+ obj.x+'-'+wo);
    if (g.x-w < obj.x+wo && g.x+w > obj.x-wo &&
        g.y-h < obj.y+ho && g.y+h > obj.y-ho)
    {
      //console.log("SNAKE HIT!");
      return true;
    }
    return false;
  },
};
//var l=10;
//var a = pi/180*10;
//var snakes=[];