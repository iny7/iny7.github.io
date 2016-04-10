/**
 * 2016.3.28 iny
 * 这个对象是整个网页的地形以及小地图的抽象表示(入参为存放dom的二维数组以及配置参数
 * (如动画时间,是否需要小地图等,颜色信息应该由用户自己在css中定义))
 * 后期应该根据传入的数组动态生成小地图
 */
(function(window){

	window.myApp = window.myApp ? window.myApp : {};
	
	function Page(arr, options){
		/*事件触发的时候,Controller应该通知map(调用map提供的方法)改变,而不是由
		Controller直接操作map的dom结构,boy对象应该是map持有的一个属性,由map来控制boy因为boy和map是息息相关的
		比如boy的转身与否影响了map的动画延迟等,像现在Controller中每次都动作都要同时操作他俩实在太傻了
		*/
		this.arr = arr;
		this.options = options;
		//当一个动画正在进行的时候,不允许其他动画进行
		this.flag = true;
		this.currentPage;
		this.boy = new Boy($('#boy'));
		this.box = $("[data-map='box']");
		this.border = $("[data-map='cell-border']")


		/* 2016.4.10 iny
		 * 做缩放地图的时候这里就出现问题了,因为地图可不一定是正方形,
		 * 也可能是3X4等长方形,仅仅maxlength不能解决问题
		*/
		this.maxLength = (function(){
			//因为传入的参数arr不是规则的二维数组,所以先取到能容纳该数组的最小方形数组
			var maxLength = 0;
			var arrLength = arr.length;
			for(var i = 0 ; i < arrLength ; i ++){
				maxLength = arr[i].length > maxLength ? arr[i].length : maxLength;
			}
			maxLength = arrLength > maxLength ? arrLength : maxLength;
			return maxLength;
		})()

		this.init();

	}
	/*初始化*/
	Page.prototype.init = function(){
		var _this = this;
		this.currentPage = this.arr[0][0];
		
		var scaleBtn = $("#thumb");
		this.initProperty();
		if(this.options.tinyMap === true){
			this.generateTinyMap();
		}
		//当box触发动画结束事件时,将事件传递给$(map),从而被Controller接收到
		this.box.on('transitionend', function(event) {
			_this.flag = true;
			_this.boy.stop();
		});
		scaleBtn.on('click', function(){
			_this.thumb();
		})
	}
	Page.prototype.thumb = function(){
		var scaleBox = $('#scaleBox')
		var cp = this.getCurrentPage();

		if(scaleBox.hasClass('active')){
			scaleBox.css('transform', '');
			scaleBox.removeClass('active')

		}
		else{
			var proportion = this.options.proportion
			//缩放比例为缩放图占屏幕的比例/格子宽度
			// var scaleX = proportion / this.maxLength;
			// var scaleY = 
			var x = (1 - proportion) / 2;
			var currentPage = this.currentPage;
			var orignX = currentPage.data('i')
			var orignY = currentPage.data('j')

			scaleBox.css('transform','scale('+scale+')');
			scaleBox.css('transform-origin', '5% 95%');
			
			scaleBox.addClass('active')
			// 这样还不够,还要根据最大宽(高)动态计算transform-orign
			
			
			
		}
	}

	/** 生成小地图
	 * 2016.3.31 根据传入的数组动态生成小地图,而不是由使用者自己写
	 
	 * 2016.4.8 修复了在改变窗口到某些宽(高)时,小地图存在缝隙的bug,
	 * 出现这个bug是因为浏览器对计算出的宽度(33.333..)只取小数点后四位,
	 * 这样就导致了在除不尽的情况下每个小格子的宽高加起来也没有占满父容器(差那么一丢丢)
	 * 因此,我在计算宽高时取2位小数(不能太多,第一显示在html里很丑,第二如上所述超过4位
	 * 浏览器也不会理会),将每行(列)最后一个格子的宽高由100-前面格子的和获得
	 *   另外,因为宽高在是由maxLength计算而来,应该统一计算并保存在一个变量里
	 * 而不要每次都计算,以提高效率,节约内存
	 *  注意!这个bug不仅由这个误差引起,还有一个!那就是rem布局中动态计算的fontsize
	 * 没有取近似值,而是一大堆小数,这样就算百分比给准确了,
	 * fontsize小数位太多导致的计算舍去也会使地图产生缝隙
	 */
	Page.prototype.generateTinyMap = function(){
		console.log("generateTinyMap")
		var arr = this.arr;
		var maxLength = this.maxLength;
		//Number.toFixed(n)可以格式化n位小数,number是基本类型,所以不能像Math.random()一样调用
		var perLength = (100/maxLength).toFixed(0);
		var lastLength = 100 - perLength * (maxLength - 1);
		var tinyMap = $("[data-map='tinyMap']");
		var cellBox = $('<ol></ol>')
		var border = $("[data-map='cell-border']");
		border.css('width', 100/maxLength+'%');
		border.css('height', 100/maxLength+'%');
		for (var i = 0; i < maxLength; i ++) {
			for (var j = 0; j < maxLength; j ++) {
				var temp = $('<li class="cell"><a href="#"></a></li>')
				if(arr[i][j] !== undefined){
					temp.addClass('cell-used')
				}
				temp.css('width', perLength+'%');
				temp.css('height', perLength+'%');
				
				//对右边界和下边界的元素,宽高取剩余宽度				
				if(i == maxLength - 1){
					temp.css('height', lastLength+'%');
				}if(j == maxLength - 1){
					temp.css('width', lastLength+'%');
				}
				cellBox.append(temp);
			}			
		}
		tinyMap.append(cellBox)
		$(document.body).prepend(tinyMap)
	}
	/*初始化元素位置和属性*/
	Page.prototype.initProperty = function(){
		console.log("initProperty")
		var arr = this.arr;
		for(var i = 0 ; i < arr.length ; i ++){
			for(var j = 0 ; j < arr[i].length ; j ++){
				//首先筛选出不是墙的元素
				if(arr[i][j] === undefined){
					continue;
				}
				/* 每次点击都要遍历一遍该数组,效率太低,所以在
				 * 生成小地图那次遍历的时候,就把数组下标当做属性绑定到每个page上
				*/
				arr[i][j].data('i', i);
				arr[i][j].data('j', j);
				arr[i][j].css('top', 100*i+'%');
				arr[i][j].css('left', 100*j+'%');
				//对于非墙元素,上面有的,让他可以向上
				if(arr[i-1] && arr[i-1][j] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"上")
					arr[i][j].data('canMoveTop', true);
					// this.moveTop(i, j)
				}
				//下面有
				if(arr[i+1] && arr[i+1][j] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"下")
					arr[i][j].data('canMoveDown', true);
					// this.moveBottom(i, j)
				}
				//左边有
				if(arr[j-1] && arr[i][j-1] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"左")
					arr[i][j].data('canMoveLeft', true);
					// this.moveLeft(i, j)
				}
				//右边有
				if(arr[j+1] && arr[i][j+1] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"右")
					arr[i][j].data('canMoveRight',true);
					// this.moveRight(i, j)
				}
			}
		}
	}
	/*计算时间*/
	Page.prototype.initTime = function(needDelay){
		console.log("initTime")
		var time = this.options.animationTime;
		var delay = this.options.animationDelay

		if(needDelay){
			this.box.css('transition', 'all '+ time +'s '+delay+ 's');
			this.border.css('transition', 'all '+ time +'s '+delay+ 's');
		}
		else{
			this.box.css('transition', 'all '+ time +'s');
			this.border.css('transition', 'all '+ time +'s');
		}
	}
	/*获得当前页面*/
	Page.prototype.getCurrentPage = function(){
		console.log("getCurrentPage")
	//1. active的时候把元素下标绑定过去
		var currentPage = $(".page.active");
		return currentPage;
		
	}
	//移动动作
	Page.prototype.moveTop = function(){
		//初始化的时候为每个元素绑定classchange事件,回调函数为
		// pageSwitch(i,j)
		console.log("moveTop")
		var arr = this.arr;
		var currentPage = this.currentPage;
		var i = currentPage.data('i');
		var j = currentPage.data('j');
		//条件判断弄到canMove函数里
		//当前active变化的时候能不能触发事件呢?
		//还是用css的方式呢? 子css怎么触发父css的事件呢?

		//boy的动作(walk  turn等)用事件监听能实现吗?
		//因为每个触摸动作都会进入move函数,而每次都get计算CurrentPage又是个很
		//耗费效率的事情,所以页面会卡,怎么优化?(把currentPage保存到一个变量里,还可以监听它的变化来改变网页)
		//原先的方法是给每个元素根据i,j绑定事件,不用每次计算,
		//现在是让地图移动,每次都计算,哪个更好呢?
		if(this.flag && currentPage.data('canMoveTop')){
			this.initTime();
			this.boy.walk()
			this.box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i-1)+'00%)')
			this.border.css('transform', 'translateX('+j+'00%) translateY('+(i-1)+'00%)')
			currentPage.removeClass('active')
			this.currentPage = arr[i-1][j];
			this.currentPage.addClass('active')
			this.flag = false;
		}
	}
	Page.prototype.moveDown = function(){
		console.log("moveDown")
		
		var currentPage = this.currentPage;
		if(this.flag && currentPage.data('canMoveDown')){
			var arr = this.arr;
			var i = currentPage.data('i');
			var j = currentPage.data('j');
			this.initTime();
			this.boy.walk()
// 877230319
			this.box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i+1)+'00%)')
			this.border.css('transform', 'translateX('+j+'00%) translateY('+(i+1)+'00%)')
			
			currentPage.removeClass('active')

			this.currentPage = arr[i+1][j];

			this.currentPage.addClass('active')

			this.flag = false;
		}
	}
	Page.prototype.moveLeft = function(){
		console.log("moveLeft")
		var currentPage = this.currentPage;
		if(this.flag && currentPage.data('canMoveLeft')){
			var arr = this.arr;

			var i = currentPage.data('i');
			var j = currentPage.data('j');
			if(this.boy.direction === 'left'){
				//直接移动
				this.initTime();
				this.boy.walk()	
			}else{
				//男孩先转向,再移动,页面wait一个delayTime
				this.initTime(true);
				this.boy.turnAndWalk()
			}

			this.box.css('transform', 'translateX(-'+(j-1)+'00%) translateY(-'+i+'00%)')
			this.border.css('transform', 'translateX('+(j-1)+'00%) translateY('+i+'00%)')	
		
			currentPage.removeClass('active')

			this.currentPage = arr[i][j-1];

			this.currentPage.addClass('active')


			this.flag = false;
		}
	}
	Page.prototype.moveRight = function(){
		console.log("moveRight")
		
		var currentPage = this.currentPage;
		if(this.flag && currentPage.data('canMoveRight')){
			var arr = this.arr;
			var i = currentPage.data('i');
			var j = currentPage.data('j');
			if(this.boy.direction === 'right'){
				//直接移动
				this.initTime();
				this.boy.walk()	
			}else{
				//男孩先转向,再移动,页面wait一个delayTime
				this.initTime(true);
				this.boy.turnAndWalk()
			}

			this.box.css('transform', 'translateX(-'+(j+1)+'00%) translateY(-'+i+'00%)')
			this.border.css('transform', 'translateX('+(j+1)+'00%) translateY('+i+'00%)')			
			
			currentPage.removeClass('active')

			this.currentPage = arr[i][j+1];

			this.currentPage.addClass('active')

			this.flag = false;
		}
	}

	myApp.Page = Page;

})(window)

// /*简单的单事件模型*/
// this.Events = []
// //简单实现单事件绑定,不实用栈或者队列
// Page.prototype.addEvent = function(name, func){
// 		if(!this.Events[name]){
// 			this.Events[name] = new Array;
// 		}
// 		this.Events[name].push(func)
// }
// Page.prototype.fireEvent = function(name){
// 	var funs = this.Events[name];
// 	funs[0]();
// }
// Page.prototype.removeEvent = function(name){
// 	//清空事件队列
// 	this.Events[name] = null;
// }
	