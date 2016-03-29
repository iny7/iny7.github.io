/*
 * 2016.3.24 iny
 * 目的:利用一个二维数组做简单的地图,地图和网页同步变化,并且
 * 根据地图中的0,1自动生成墙(网页只能在允许范围内滚动)
 * 最终抽象成为一个可复用的插件
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

$(function(){
	
	var mapArr = [
		[$("#first")],
		[$("#fourth")	, $("#fifth")],
		[,$("#eighth")	, $("#ninth")]
	]

	var options = {
		'animationTime' : '3',
		'animationDelay' : '1'
	}

	var ctrl = new Controller(mapArr, options);


})