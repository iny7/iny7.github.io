/**
 * 2016.3.28 iny
 * 利用控制器控制组件以及进行各个组件之间的通信
 */
function Controller(arr, options){
	
	//下一版本,
	//√ 1.对当前页面加active 然后为document增加事件监听
	//√ 2.图片压缩,当前情况实在糟糕
	//3.在IE8下爆炸,试着做一些兼容?渐进增强,平稳退化
	//4.非首屏懒加载?
	//5.本来的事件绑定虽然丑,但还能看得下去,增加了触摸事件以后实在是太丑陋了,亟待重构
	
	//1.注意兼容ff,事件的绑定抽象出来
	//2.注意非首页懒加载或者对非当前页面隐藏,否则刚刷新的时候会全出来,
	//3.读on的源码

	var _this = this;
	var map = new Map(arr, options);

	var boy = new Boy($('#boy'));

	//当一个动画正在进行的时候,不允许其他动画进行
	var flag = true;
	var btn = $("#detail")
	
	btn.on('click', function(){
		console.log("click")
		if(flag){
			boy.walk()
			map.moveBottom(0, 0, options.animationTime)
			flag = false;
		}
	})
	//把滚轮,触屏和键盘事件条件封装成自定义事件,触发后调用者仍需判断当前位置下是否能进行移动
	var isMobile = (function(){
		var browser = navigator.userAgent.toLowerCase();
		console.log(browser)
		if(/iphone/.test(browser)){
			console.log("iphone")
			return true;	
		}else if(/android/.test(browser)){
			console.log("android")
			return true;
		}
		//与其使用浏览器嗅探,还不如直接对象检测
		else if(document.ontouchstart !== undefined){
			//判断有没有触屏事件
			return true;
		}
		return false;
	})()

	this.init = function(){
		if(options.tinyMap === true){
			this.generateTinyMap();
		}
		this.initEvent();
	}

    this.addEvent = function(){

    	//对事件对象进行包装
    	var packEvent = function(event){
    		var type = event.type;
    		//如果是ff浏览器的滚轮事件
    		if (type == 'DOMMouseScroll'){
				//根据axis和detail对事件进行包装,添加一个方向
				//垂直是2,水平是1
				var axis = event.axis;
				//左和上为正方向
				var detail = event.detail;
				//水平方向
    			if(axis === 1){
    				if(detail > 5){
    					event.direction = 'left';
    				}else if(detail < -5){
    					event.direction = 'right';
    				}
    			}
    			//垂直方向
    			else if(axis === 2){
    				if(detail > 5){
						event.direction = 'top';
    				}else if(detail < -5){
    					event.direction = 'bottom';
    				}
    			}
            }
            //如果是其他浏览器的滚轮事件
            if(type === 'mousewheel'){
            	//根据deltaX和deltaY的比较对事件进行包装,添加一个方向
            	var deltaX = event.deltaX;
				var deltaY = event.deltaY;
				
            	if(Math.abs(deltaX) - Math.abs(deltaY) > 10){
			    	if(deltaX > 5){
			    		event.direction = 'left';
			    	}else if(deltaX < -5){
			    		event.direction = 'right';
			    	}
			    }else if(Math.abs(deltaY) - Math.abs(deltaX) > 10){
			    	if(deltaY > 5){
			    		event.direction = 'top';
			    	}else if(deltaY < -5){
			    		event.direction = 'bottom';
			    	}
			    }
            }

            if (event.srcElement && !event.target) {
                event.target = event.srcElement;    
            }
            if (!event.preventDefault && event.returnValue !== undefined) {
                event.preventDefault = function() {
                    event.returnValue = false;
                };
            }
            /* 
               ......其他一些兼容性处理 */
            return event;
    	}
    	
    	if (window.addEventListener) {
            return function(el, type, fn, capture) {
                //如果是ff,将mousewheel事件改变为ff的类型
                if (type === "mousewheel" && document.mozHidden !== undefined) {
                    type = "DOMMouseScroll";
                }
                el.addEventListener(type, function(event) {
                    fn.call(this, packEvent(event));
                }, capture || false);
            }
        } else if (window.attachEvent) {
            return function(el, type, fn, capture) {
                el.attachEvent("on" + type, function(event) {
                    event = event || window.event;
                    fn.call(el, packEvent(event));
                });
            }
        }
    }()

	//触摸事件
	this.initTouchEvent = function(){
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
		    //这里判断与event相关的条件能否满足,调用者自身再判断当前状态下能否移动(flag和是否active)
		    if(Math.abs(deltaX) - Math.abs(deltaY) > 10){
		    	if(deltaX > 5){
		    		//向右划,向左移动
		    		$(_this).trigger('moveLeft')
		    		// console.log("left")
		    	}else if(deltaX < -5){
		    		//向左划,向右移动
		    		$(_this).trigger('moveRight')
		    		// console.log("right")
		    	}
		    }else if(Math.abs(deltaY) - Math.abs(deltaX) > 10){
		    	if(deltaY > 5){
		    		//向下划,向上移动
		    		$(_this).trigger('moveTop')
		    		// console.log("top")
		    	}else if(deltaY < -5){
		    		//向上划,向下移动
		    		$(_this).trigger('moveBottom')
		    		// console.log("bottom")
		    	}
		    }
		});
	}
	//键盘事件
	this.initKeyBoardEvnet = function(){
		$(document).keydown(function(event) {
			event.preventDefault();
			var keyCode = event.keyCode;
			switch(keyCode){
				case 37:
					$(_this).trigger('moveLeft')
					break;
				case 38:
					$(_this).trigger('moveTop')
					break;
				case 39:
					$(_this).trigger('moveRight')
					break;
				case 40:
					$(_this).trigger('moveBottom')
					break;
				default:
					break;
			}
		});
	}
	//鼠标滚轮事件
	this.initMouseWheelEvent = function(){
		
		//使用自定义的事件处理函数,好兼容ff的鼠标滚轮事件
		this.addEvent(document, 'mousewheel', function(event){
			event.preventDefault();
			
			var direction = event.direction;
			switch(direction){
				case 'top':
				//向上划,向下移动
					$(_this).trigger('moveBottom')
					break;

				case 'bottom':
					//向下划,向上移动
					$(_this).trigger('moveTop')
					break;
				
				case 'left':
					//向左划,向右移动
					$(_this).trigger('moveRight')
					break;
				
				case 'right':
					//向右划,向左移动
					$(_this).trigger('moveLeft')
					break;
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

		if(isMobile){
			console.log("userAgent is Mobile")
			this.initTouchEvent();
		}
		this.initKeyBoardEvnet();
		this.initMouseWheelEvent();

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

		$(this).on('moveTop', function(event) {
			event.preventDefault();

			if(flag && arr[i][j].hasClass('active')){
				console.log("moveTop---")
				boy.walk()
				map.moveTop(i, j, options.animationTime)
				flag = false;
			}
		});
		
	}

	this.moveBottom = function(i, j){

		$(this).on('moveBottom', function(event) {
			event.preventDefault();
			if(flag && arr[i][j].hasClass('active')){
				boy.walk()
	    		map.moveBottom(i, j, options.animationTime)
	    		flag = false;
			}
		});

	}

	this.moveLeft = function(i, j){
		
		$(this).on('moveLeft', function(event) {
			event.preventDefault();
			if(flag && arr[i][j].hasClass('active')){
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

	}
	this.moveRight = function(i, j){
		
		$(this).on('moveRight', function(event) {
			 event.preventDefault();
			 if(flag && arr[i][j].hasClass('active')){
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
	}

	this.init()

}
