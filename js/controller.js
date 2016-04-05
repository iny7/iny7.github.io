/**
 * 2016.3.28 iny
 * 利用控制器控制组件以及进行各个组件之间的通信
 */
function Controller(arr, options){
	
	var map = new Map(arr, options);

	var boy = new Boy($('#boy'));

	//当一个动画正在进行的时候,不允许其他动画进行
	var flag = true;
	var btn = $("#detail")
	
	btn.on('click', function(){
		if(flag){
			boy.walk()
			map.moveBottom(0, 0, options.animationTime)
			flag = false;
		}
	})

	var isMobile = (function(){
		var browser = navigator.userAgent.toLowerCase();
		console.log(browser)
		if(/iphone/.test(browser)){
			console.log("iphone")
			return true;	
		}else if(/android/.test(browser)){
			console.log("android")
			return true;
		}else if(document.ontouchstart !== undefined){
			//判断有没有触屏事件
			return true;
		}

	})()

	this.init = function(){
		if(isMobile){
			console.log("userAgent is Mobile")
			this.initMobileEvent();
		}
		if(options.tinyMap === true){
			
			this.generateTinyMap();
		}
		this.initEvent();
	}

	this.initMobileEvent = function(){
		var startX = 0;
		var startY = 0;
		var endX = 0;
		var endY = 0;

		document.addEventListener('touchstart',function(event){
		    startX = event.touches[0].pageX;
		    startY = event.touches[0].pageY;
		});

		document.addEventListener('touchend',function(event){
		    endX = event.changedTouches[0].pageX;
		    endY = event.changedTouches[0].pageY;

		    var deltaX = endX - startX ;
		    var deltaY = endY - startY ;
		    if(Math.abs(deltaX) >= Math.abs(deltaY) ){
		        if(deltaX >= 0 ){
		            //right
		        }else{
		            //left
		        }

		    }else{//y
		        if(deltaY >= 0 ){
		            //down
		            boy.walk()
					// map.moveTop(i, j, options.animationTime)
		        }else{
		            //up
		        }

		    }
		});
	}

	//生成小地图
	/**
	 * 2016.3.31 根据传入的数组动态生成小地图,而不是由使用者自己写
	 */
	this.generateTinyMap = function(){
		//因为传入的参数arr不是规则的二维数组,所以先取到能容纳该数组的最小方形数组
		var maxLength = 0;
		var arrLength = arr.length;
		for(var i = 0 ; i < arrLength ; i ++){
			maxLength = arr[i].length > maxLength ? arr[i].length : maxLength;
		}
		maxLength = arrLength > maxLength ? arrLength : maxLength;
		// console.log(maxLength)
		var tinyMap = $("[data-map='tinyMap']");
		var cellBox = $('<ol></ol>')
		var border = $("[data-map='cell-border']");
		border.css('width', 100/maxLength+'%');
		border.css('height', 100/maxLength+'%');
		for (var i = 0; i < maxLength; i ++) {
			for (var j = 0; j < maxLength; j ++) {
				var temp = $('<li class="cell"><a href="#"></a></li>')
				temp.css('width', 100/maxLength+'%');
				temp.css('height', 100/maxLength+'%');
				if(arr[i][j] !== undefined){
					temp.addClass('cell-used')
				}
				cellBox.append(temp);
			}			
		}
		tinyMap.append(cellBox)
		$(document.body).prepend(tinyMap)

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
				arr[i][j].css('top', 100*i+'%');
				arr[i][j].css('left', 100*j+'%');
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

		//下一版本,
		//√ 1.对当前页面加active 然后为document增加事件监听
		//√ 2.图片压缩,当前情况实在糟糕
		//3.在IE8下爆炸,试着做一些兼容?渐进增强,平稳退化
		//4.非首屏懒加载?


		//本来的事件绑定虽然丑,但还能看得下去,增加了触摸事件以后实在是太丑陋了,亟待重构
		var startX = 0;
		var startY = 0;
		var endX = 0;
		var endY = 0;

		document.addEventListener('touchstart',function(event){
		    startX = event.touches[0].pageX;
		    startY = event.touches[0].pageY;
		});

		document.addEventListener('touchend',function(event){
		    endX = event.changedTouches[0].pageX;
		    endY = event.changedTouches[0].pageY;
		    
		    var deltaX = endX - startX ;
		    var deltaY = endY - startY ;

		    if(flag && arr[i][j].hasClass('active') && Math.abs(deltaY) - Math.abs(deltaX) > 10 && deltaY > 0){
		    	boy.walk()
	    		map.moveTop(i, j, options.animationTime)
	    		flag = false;
		    }
	        
		})

		$(document).keydown(function(event) {
			if(flag && event.keyCode == 38 && arr[i][j].hasClass('active')){
				console.log("msg")
				boy.walk()
				map.moveTop(i, j, options.animationTime)
				flag = false;
			}
		});

		arr[i][j].on('mousewheel', function(event) {
			var x = event.originalEvent.deltaX;
			var y = event.originalEvent.deltaY;
			if(flag && arr[i][j].hasClass('active') && Math.abs(y) - Math.abs(x) > 10 && y < -10){

				boy.walk()
				map.moveTop(i, j, options.animationTime)
				flag = false;
			}
		})
	}

	this.moveBottom = function(i, j){
		var startX = 0;
		var startY = 0;
		var endX = 0;
		var endY = 0;

		document.addEventListener('touchstart',function(event){
		    startX = event.touches[0].pageX;
		    startY = event.touches[0].pageY;
		});

		document.addEventListener('touchend',function(event){
		    endX = event.changedTouches[0].pageX;
		    endY = event.changedTouches[0].pageY;
		    
		    var deltaX = endX - startX ;
		    var deltaY = endY - startY ;

		    if(flag && arr[i][j].hasClass('active') &&  Math.abs(deltaY) - Math.abs(deltaX) > 10 && deltaY < 0){
		    	boy.walk()
	    		map.moveBottom(i, j, options.animationTime)
	    		flag = false;
		    }
		})

		$(document).keydown(function(event) {
			if(flag && event.keyCode == 40 && arr[i][j].hasClass('active')){
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
			}
		})
	}

	this.moveLeft = function(i, j){
		var startX = 0;
		var startY = 0;
		var endX = 0;
		var endY = 0;

		document.addEventListener('touchstart',function(event){
		    startX = event.touches[0].pageX;
		    startY = event.touches[0].pageY;
		});

		document.addEventListener('touchend',function(event){
		    endX = event.changedTouches[0].pageX;
		    endY = event.changedTouches[0].pageY;
		    
		    var deltaX = endX - startX ;
		    var deltaY = endY - startY ;


		    if(flag && arr[i][j].hasClass('active') && Math.abs(deltaX) - Math.abs(deltaY) > 10 && deltaX > 0){
		    	console.log("msg")
		    	boy.walk()
	    		map.moveLeft(i, j, options.animationTime)
	    		flag = false;
		    }
		})

		$(document).keydown(function(event) {
			if(flag && event.keyCode == 37 && arr[i][j].hasClass('active')){
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
			}
		})
	}
	this.moveRight = function(i, j){
		var startX = 0;
		var startY = 0;
		var endX = 0;
		var endY = 0;
		document.addEventListener('touchstart',function(event){
		    startX = event.touches[0].pageX;
		    startY = event.touches[0].pageY;
		});

		document.addEventListener('touchend',function(event){
		    endX = event.changedTouches[0].pageX;
		    endY = event.changedTouches[0].pageY;
		    
		    var deltaX = endX - startX ;
		    var deltaY = endY - startY ;
		    if(flag && arr[i][j].hasClass('active') && Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0){
		    	boy.walk()
	    		map.moveRight(i, j, options.animationTime)
	    		flag = false;
		    }
		})

		$(document).keydown(function(event) {
			if(flag && event.keyCode == 39 && arr[i][j].hasClass('active')){
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
			}
		})
	}

	this.init()

}
