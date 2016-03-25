/*
 * 2016.3.24 iny
 * 目的:利用一个二维数组做简单的地图,地图和网页同步变化,并且
 * 根据地图中的0,1自动生成墙(网页只能在允许范围内滚动)
 * 最终抽象成为一个可复用的插件
 */

function Map(arr, options){

	var box = $("[data-map='box']");
	var border = $("[data-map='border']")
	box.css('transition', 'all 1s');
	border.css('transition', 'all 1s');
	
	this.init = function(){
		this.initEvent();
		this.generateTinyMap();
	}

	//初始化事件
	this.initEvent = function(){
		for(var i = 0 ; i < arr.length ; i ++){
			for(var j = 0 ; j < arr[i].length ; j ++){
				//首先筛选出不是墙的元素
				if(arr[i][j] === undefined){
					continue;
				}
				//对于非墙元素,上面有的,让他可以向上
				if(arr[i-1] && arr[i-1][j] != undefined){
					console.log(i+"-"+j+":"+arr[i][j]+"上")
					this.moveTop(i, j)
				}
				//下面有
				if(arr[i+1] && arr[i+1][j] != undefined){
					console.log(i+"-"+j+":"+arr[i][j]+"下")
					this.moveBottom(i, j)
				}
				//左边有
				if(arr[j-1] && arr[i][j-1] != undefined){
					console.log(i+"-"+j+":"+arr[i][j]+"左")
					this.moveLeft(i, j)
				}
				//右边有
				if(arr[j+1] && arr[i][j+1] != undefined){
					console.log(i+"-"+j+":"+arr[i][j]+"右")
					this.moveRight(i, j)
				}
			}
		}
	}

	//生成小地图
	this.generateTinyMap = function(){
		var maxLength = 0;
		for(var i = 0 ; i < arr.length ; i ++){
			maxLength = arr[i].length > maxLength ? arr[i].length : maxLength;
		}	
		console.log(maxLength)
	}
	

	//当一个动画正在进行的时候,不允许其他动画进行
	var flag = true;

	var canMove = function(){
		return flag;
	}
	box.on('transitionend', function(event) {
		flag = true;
	});

	this.moveTop = function(i, j){
		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(y) > Math.abs(x) && y < -10){
				flag = false;
				box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i-1)+'00%)')
				border.css('transform', 'translateX('+j+'00%) translateY('+(i-1)+'00%)')
				console.log("top")
			}
		})
	}
	this.moveBottom = function(i, j){
		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(x) < Math.abs(y) && y > 10){
				flag = false;
				box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i+1)+'00%)')
				border.css('transform', 'translateX('+j+'00%) translateY('+(i+1)+'00%)')
				console.log("bottom")
			}
		})
	}
	this.moveLeft = function(i, j){
		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(x) > Math.abs(y) && x < -10){
				flag = false;
				box.css('transform', 'translateX(-'+(j-1)+'00%) translateY(-'+i+'00%)')
				border.css('transform', 'translateX('+(j-1)+'00%) translateY('+i+'00%)')
				console.log("left")
			}
		})
	}
	this.moveRight = function(i, j){
		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(x) > Math.abs(y) && x > 10){
				flag = false;
				box.css('transform', 'translateX(-'+(j+1)+'00%) translateY(-'+i+'00%)')
				border.css('transform', 'translateX('+(j+1)+'00%) translateY('+i+'00%)')
				console.log("right")
			}
		})
	}

	this.init()
}

$(function(){
	
	var mapArr = [
		[$("#first")],
		[$("#fourth")	, $("#fifth")],
		[,$("#eighth")	, $("#ninth")]
	]
	//应该传个参数,控制比如要不要小地图这种功能
	var map = new Map(mapArr);
	//右上角map动态生成?
	
})