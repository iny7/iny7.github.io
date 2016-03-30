/**
 * 2016.3.28 iny
 * 利用控制器控制组件以及进行各个组件之间的通信
 */
function Controller(arr, options){
	
	var map = new Map(arr, options);

	var boy = new Boy($('#boy'));

	//当一个动画正在进行的时候,不允许其他动画进行
	var flag = true;

	this.init = function(){
		this.initEvent();
		this.generateTinyMap();
	}

	//生成小地图
	this.generateTinyMap = function(){
		var maxLength = 0;
		for(var i = 0 ; i < arr.length ; i ++){
			maxLength = arr[i].length > maxLength ? arr[i].length : maxLength;
		}	
	}

	$(map).on('transitionend', function(event) {
		flag = true;
		boy.stop();
	});

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
					// console.log(i+"-"+j+":"+arr[i][j]+"上")
					this.moveTop(i, j)
				}
				//下面有
				if(arr[i+1] && arr[i+1][j] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"下")
					this.moveBottom(i, j)
				}
				//左边有
				if(arr[j-1] && arr[i][j-1] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"左")
					this.moveLeft(i, j)
				}
				//右边有
				if(arr[j+1] && arr[i][j+1] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"右")
					this.moveRight(i, j)
				}
			}
		}
	}


	this.moveTop = function(i, j){

		arr[i][j].attr('tabindex', '1');
		arr[i][j].keydown(function(event) {
			if(event.keyCode == 38){
				boy.walk()
				map.moveTop(i, j, options.animationTime)
				flag = false;
			}
		});


		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(y) > Math.abs(x) && y < -10){

				boy.walk()
				map.moveTop(i, j, options.animationTime)
				flag = false;
				
				// console.log("top")
			}
		})
	}
	this.moveBottom = function(i, j){

		arr[i][j].attr('tabindex', '1');
		arr[i][j].keydown(function(event) {
			if(event.keyCode == 40){
				boy.walk()
				map.moveBottom(i, j, options.animationTime)

				flag = false;
			}
		});

		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(x) < Math.abs(y) && y > 10){

				boy.walk()
				map.moveBottom(i, j, options.animationTime)

				flag = false;

				// console.log("bottom")
			}
		})
	}

	this.moveLeft = function(i, j){

		arr[i][j].attr('tabindex', '1');
		arr[i][j].keydown(function(event) {
			if(event.keyCode == 37){
				if(boy.direction === 'left'){
					//直接移动
					boy.walk()
					map.moveLeft(i, j, options.animationTime)
				}
				//否则
				else{
					//男孩先转向,再移动,页面wait一个delayTime
					boy.turnAndWalk()
					map.moveLeft(i, j, options.animationTime, options.animationDelay)
				}

				flag = false;
			}
		});

		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(x) > Math.abs(y) && x < -10){

				//如果男孩朝向与目标方向相同
				if(boy.direction === 'left'){
					//直接移动
					boy.walk()
					map.moveLeft(i, j, options.animationTime)
				}
				//否则
				else{
					//男孩先转向,再移动,页面wait一个delayTime
					boy.turnAndWalk()
					map.moveLeft(i, j, options.animationTime, options.animationDelay)
				}

				flag = false;

				// console.log("left")
			}
		})
	}
	this.moveRight = function(i, j){

		arr[i][j].attr('tabindex', '1');
		arr[i][j].keydown(function(event) {
			if(event.keyCode == 39){
				if(boy.direction === 'right'){
					//直接移动
					boy.walk()
					map.moveRight(i, j, options.animationTime)
				}
				//否则
				else{
					//男孩先转向,再移动,页面wait一个delayTime
					boy.turnAndWalk()
					map.moveRight(i, j, options.animationTime, options.animationDelay)
				}

				flag = false;
			}
		});

		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && Math.abs(x) > Math.abs(y) && x > 10){

				//如果男孩朝向与目标方向相同
				if(boy.direction === 'right'){
					//直接移动
					boy.walk()
					map.moveRight(i, j, options.animationTime)
				}
				//否则
				else{
					//男孩先转向,再移动,页面wait一个delayTime
					boy.turnAndWalk()
					map.moveRight(i, j, options.animationTime, options.animationDelay)
				}

				flag = false;

				// console.log("right")
			}
		})
	}

	this.init()

}
