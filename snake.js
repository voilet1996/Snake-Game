var sw =20,
     sh=20,
     tr=30,
     td=30;

     var snake=null,//蛇的实例
         food=null,//食物的实例
         game =null; //游戏的实例

        


function Square(x,y,classname){
    this.x =x *sw;
    this.y=y*sh;
    this.class =classname;
    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');
}
Square.prototype.create = function(){  //创建方块DOM，并添加到页面里。
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width= sw +"px";
    this.viewContent.style.height = sh +"px";
    this.viewContent.style.left= this.x +"px";
    this.viewContent.style.top = this.y +"px";

    this.parent.appendChild(this.viewContent);
    

}
Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent);
}

function Snake(){
    this.head=null; //存一下蛇头的信息
    this.tail=null;//存一下蛇尾的信息
    this.pos=[];   //存储蛇身上每一个方块的位置
    this.directionNum= {  //存储蛇走的方向，用一个对象来表示
       left:{
           x:-1,
           y:0,
           rotate:180
        },//蛇头在不同的方向中应该进行旋转，要不始终是向右
       right:{
           x:1,
           y:0,
           rotate:0
        },
       up:{
           x:0,
           y:-1,
           rotate:-90
        },
       down:{
           x:0,
           y:1,
           rotate:90
        }
    }
}

Snake.prototype.init = function(){
    //创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head =snakeHead; //存储蛇头信息
    this.pos.push([2,0]);//把蛇头的位置存起来

    //创建蛇身体1
    var snakeBody1 =new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);//把蛇身体1的位置存起来

     //创建蛇身体2
     var snakeBody2 =new Square(0,0,'snakeBody');
     snakeBody2.create();
     this.tail = snakeBody2;
     this.pos.push([0,0]);//把蛇身体1的位置存起来
     
     //形成链表关系
     snakeHead.last =null;
     snakeHead.next =snakeBody1;

     snakeBody1.last = snakeHead;
     snakeBody1.next = snakeBody2;
     
     snakeBody2.last = snakeBody1;
     snakeBody2.next = null;
     
  //给蛇添加一条属性，用来表示蛇走的方向
  this.direction = this.directionNum.right; //默认让蛇向右走
};


Snake.prototype.getNextPos = function(){
    var nextPos=[
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]

    //下个点是自己，代表撞到自己，游戏结束
    var  selfCollied=false;
    this.pos.forEach(function(value){
        if(value[0]==nextPos[0] && value[1]==nextPos[1]){
            selfCollied = true;
        }
    });
    if(selfCollied){
        console.log("撞到自己了！");
        this.strategies.die.call(this);
        return;
    }

    //下一个点是围墙，游戏结束
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]> td-1 || nextPos[1]> tr-1){
        console.log("撞到墙了！");
        this.strategies.die.call(this);
        return;
    }

    //下一个点是食物，吃
    if(food && food.pos[0]==nextPos[0] && food.pos[1]== nextPos[1]){
        console.log('吃到了！');
        this.strategies.eat.call(this);
        return;
    }

    //下一个点什么也不是，走
    this.strategies.move.call(this);
}

Snake.prototype.strategies ={
    move:function(format){//这个参数用于决定是否要删除最后一个方块（蛇尾）
       
        //创建新的身体（在旧蛇头的位置）
        var newBody= new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表关系
        newBody.next = this.head.next;
        newBody.next.last= newBody;
        newBody.last = null;

        this.head.remove();//把旧蛇头从原来的位置删除
        newBody.create();

        //创建一个新蛇头（蛇头下一个要走到的点nextPos）
        var newHead = new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
        //更新链表关系
        newHead.next= newBody;
        newHead.last = null;
        newBody.last= newHead;
        newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
        newHead.create();

        //蛇身上的每一个坐标也要更新
        this.pos.splice(0,0,[this.head.x/sw + this.direction.x, this.head.y/sh+this.direction.y]);
           //蛇身上的坐标就是在第一位插上一个新蛇头的坐标
        this.head= newHead;//还要把this.head的信息更新一下

        if(!format){ //如果format的值为false，表示需要删除（除了吃之外的操作）
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }
    },
   
    eat:function(){
        this.strategies.move.call(this,true);//
        createFood();
        game.score++;
    },
    die:function(){
        game.over();
    },
    
}



snake = new Snake();



//创建食物
function createFood(){
    //食物的小方块的随机坐标
    var x=null;
    var y=null;

    var include=true;//循环跳出的条件，true表示食物的坐标在蛇身上，需要继续循环。false表示食物坐标不在蛇身上，跳出循环
    while(include){
        x= Math.round(Math.random()*(td-1));
        y= Math.round(Math.random()*(tr-1));

        snake.pos.forEach(function(value){
            if(x!=value[0] && y!=value[1]){
                //这个条件成立说明现在随机出来的这个坐标，在蛇身上并没有找到。
                include = false;
            }
        })
    }

    food=new Square(x,y,'food');
    food.pos=[x,y]; //存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比
    var foodDom= document.querySelector('.food');
    if(foodDom){
        foodDom.style.left= x*sw+'px';
        foodDom.style.top = y*sh +'px';
    }else{
        food.create();
    }
}


//创建游戏逻辑
function Game(){
    this.timer =null;
    this.score =0;
}
Game.prototype.init= function(){
    snake.init();
    createFood();

    document.onkeydown = function(ev){
        if(ev.which==37 && snake.direction!=snake.directionNum.right){
            snake.direction= snake.directionNum.left;
        }else if(ev.which==38 && snake.direction!=snake.directionNum.down){
            snake.direction= snake.directionNum.up;
        }else if(ev.which==39 && snake.direction!=snake.directionNum.left){
            snake.direction= snake.directionNum.right;
        }else if(ev.which==40 && snake.direction!=snake.directionNum.up){
            snake.direction= snake.directionNum.down;
        }
    }
    this.start();
}

Game.prototype.start = function(){
    this.timer=setInterval(function(){
        snake.getNextPos();
    },200);
}
Game.prototype.pause=function(){
    clearInterval(this.timer);
}
Game.prototype.over=function(){
    clearInterval(this.timer);
    alert('你的得分为：'+this.score);
    
    //游戏回到最初始状态
    var snakeWrap =document.getElementById('snakeWrap');
    snakeWrap.innerHTML='';
    snake = new Snake();
    game= new Game();

    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display='block';
}

//开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
};

var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick =function(){
    game.pause();
    pauseBtn.parentNode.style.display='block';
}

pauseBtn.onclick= function(){
    game.start();
    pauseBtn.parentNode.style.display='none';
}