/* global randomColor */

/* global SNAKE, GAME_WIDTH, GAME_HEIGHT */
/* global foods */

var SNAKESTYLE  = {
  set : function (color, width, headlength, taillength, headtype, tailtype) {
    this.color = color;
    this.width = width;
    this.headlength = headlength;
    this.headtype = headtype;
    this.taillength = taillength;
    this.tailtype = tailtype;
  },
  
  random : function () {
    this.set(
      parseInt(randomColor().slice(1), 16), //color
      Math.random()*15+5, //width
      5+Math.floor(Math.random()*20), //head length
      5+Math.floor(Math.random()*20), //tail length
      Math.floor(Math.random()*4+1), //head type
      Math.floor(Math.random()*3+0) //tail type
    );
  }
}

var NAMEDRAWER = {
 
  set : function(name, color, snake)
  {
    this.name = name;
    this.color = color;
    this.timer = 200;
    this.snake = snake;
    
    this.draw();
    
  },
  
  draw : function()
  {
    //this.graphics.clear();
    this.graphics = new PIXI.Text(this.name+"\n▼", {
      font:"35px Arial",
      fill: this.color,
      stroke : "black",
      strokeThickness : 5
    });
    this.graphics.anchor.x = 0.2;
    this.graphics.anchor.y = 1;
    this.graphics.visible = true;
    
  },
  
  move : function(x,y)
  {
    this.graphics.x = x;
    this.graphics.y = y;
  },
  
  update : function()
  {
    if (this.timer>0)
    {
      --this.timer;
      if (this.snake) {
        this.graphics.x = this.snake.x;
        this.graphics.y = this.snake.y-50;
      }
      if (this.timer<30)
      {
        this.graphics.alpha = this.timer/30.0;
      }
    }
    else
    {
      this.graphics.visible = false;
      if (this.snake) {
        this.snake.namedrawer = null;
        this.snake = null;
      }
    }
  }
  
  
}

var PLAYER = {
  snakes : [],

  set : function(name, id, s, statusoffset)
  {
    this.id = id;
    this.name = name;
    this.snakes = [];
    this.snakestyle = Object.create(SNAKESTYLE);
    this.snakestyle.random();
    this.connected = true;
    this.namedrawers = [];
    this.score = 0;
    this.statusname = null;
    this.status = null;
    //console.log("aaa");

  },
  addstatus : function(s, statusoffset)
  {
    this.statusname = new PIXI.Text(this.name, {font:"30px Arial", fill:"white"});
    this.statusname.anchor.x=0;
    this.statusname.anchor.y=0;
    this.statusname.x=statusoffset % GAME_WIDTH;
    this.statusname.y=Math.floor( statusoffset / GAME_WIDTH ) * 100;
    s.addChild(this.statusname);
    this.status = new PIXI.Text("0", {font:"40px Arial", fill:"white"});
    this.status.anchor.x=0;
    this.status.anchor.y=0.5;
    this.status.x=this.statusname.x;
    this.status.y=this.statusname.y + 53;
    s.addChild(this.status);

    statusoffset += 300;
    return statusoffset;
  },
  changeName : function(name)
  {
    this.name = name;
    this.statusname.text = name;
  },
  addsnake : function(snake)
  {
    this.snakes.push(snake);
  },
  removesnake : function(snake)
  {
    snake.namedrawer.snake = null;
    snake.namedrawer.timer = 0;
    this.snakes.remove(snake);
  }, 
  removeall : function()
  {
    this.snakes.length=0;
  },
  randomstyle : function()
  {
    this.snakestyle.random();
    for (var sn in this.snakes)
    {
      var snake = this.snakes[sn];
      if (!snake.dead)
      { 
        snake.setstyle(this.snakestyle);
      }
    }
  },
  addscore : function(score)
  {
    this.score += score;
    this.score = Math.floor(this.score);
    this.status.text = ""+this.score;
  },
  update : function(s)
  {
    var needremove=[];
    var alivecounter=0;
    for(var sn in this.snakes) {
      var snake = this.snakes[sn];
      snake.update(s);
      if (snake.neededtoremove)
      {
        needremove.push(sn);
      } else {
        if (!snake.idle && !snake.dead)
        {
          snake.checkHitFood(foods);
          for (var pl2 in players)
          {
            var player2 = players[pl2];      
            snake.checkHitSnake(player2.snakes);
          }
        }
        if (!snake.dead)
        {
          ++alivecounter;
        }        
      }
    }
    for (var r in needremove)
    {
      var removethissnake = needremove[r];
      this.snakes.splice(removethissnake, 1);
    }
    if (alivecounter===0)
    {
      console.log("createnewsnake");
       this.createnewsnake();
    }

    for (var nd in this.namedrawers)
    {
      var namedrawer = this.namedrawers[nd];
      if (namedrawer === undefined)
        continue;
      namedrawer.update();
      if (namedrawer.timer<=0)
        {
          NameContainer.removeChild(namedrawer.graphics);
          delete this.namedrawers[nd];
        }
    }
  },
  createnewsnake : function()
  {
    var SnakeToAdd = Object.create(SNAKE);
    var spwn = getSpawnPoint();
    SnakeToAdd.set(spwn[0],spwn[1],Math.random()*pi*2);
    SnakeToAdd.setplayer(this);
    SnakeToAdd.forward(1.0, 1.0);
    SnakeToAdd.setstyle(this.snakestyle);

    var namedrawer = Object.create(NAMEDRAWER);
    namedrawer.set(this.name, this.snakestyle.color, SnakeToAdd);
    namedrawer.move(SnakeToAdd.x, SnakeToAdd.y-50);
    SnakeToAdd.namedrawer = namedrawer;
    this.snakes.push(SnakeToAdd);
    this.namedrawers.push(namedrawer);
    NameContainer.addChild(namedrawer.graphics);
  }
};

var players = {};

function addplayer(name, id, samplesnake)
{
  var pl = Object.create(PLAYER);
  pl.set(name, id, samplesnake);
  players[id] = pl;
  return pl;
}
