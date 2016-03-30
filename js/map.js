/**
 * 2016.3.28 iny
 * 这个对象是整个网页的地形以及小地图的抽象表示(入参为存放dom的二维数组以及配置参数
 * (如动画时间,是否需要小地图等,颜色信息应该由用户自己在css中定义))
 * 后期应该根据传入的数组动态生成小地图
 */
function Map(arr, options){

	var _this = this;

	var box = $("[data-map='box']");
	var border = $("[data-map='border']")
	// console.log('all '+ options.animationTime +'s '+options.animationDelay+ 's');
	
	//当box触发动画结束事件时,将事件传递给$(map),从而被Controller接收到
	box.on('transitionend', function(event) {
		$(_this).trigger('transitionend')
	});

	/*简单的单事件模型*/
	this.Events = []

	this.addEvent = function(name, func){
		if(!this.Events[name]){
			this.Events[name] = new Array;
		}
		this.Events[name].push(func)
	}

	//简单实现单事件绑定,不实用栈或者队列
	this.fireEvent = function(name){
		var funs = this.Events[name];
		funs[0]();
	}
	this.removeEvent = function(name){
		//清空事件队列
		this.Events[name] = null;
	}
	this.initTime = function(time, delay){
		if(delay){
			box.css('transition', 'all '+ time +'s '+delay+ 's');
			border.css('transition', 'all '+ time +'s '+delay+ 's');
		}
		else{
			box.css('transition', 'all '+ time +'s');
			border.css('transition', 'all '+ time +'s');
		}
	}

	this.moveTop = function(i, j, time){
		this.initTime(time);
		box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i-1)+'00%)')
		border.css('transform', 'translateX('+j+'00%) translateY('+(i-1)+'00%)')
	}
	this.moveBottom = function(i, j, time){
		this.initTime(time);
		box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i+1)+'00%)')
		border.css('transform', 'translateX('+j+'00%) translateY('+(i+1)+'00%)')
	}
	this.moveLeft = function(i, j, time, delay){
		this.initTime(time, delay);
		box.css('transform', 'translateX(-'+(j-1)+'00%) translateY(-'+i+'00%)')
		border.css('transform', 'translateX('+(j-1)+'00%) translateY('+i+'00%)')	
	}
	this.moveRight = function(i, j, time, delay){
		this.initTime(time, delay);
		box.css('transform', 'translateX(-'+(j+1)+'00%) translateY(-'+i+'00%)')
		border.css('transform', 'translateX('+(j+1)+'00%) translateY('+i+'00%)')			
	}

}