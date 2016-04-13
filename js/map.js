/**
 * 2016.3.28 iny
 * 这个对象是整个网页的地形以及小地图的抽象表示(入参为存放dom的二维数组以及配置参数
 * (如动画时间,是否需要小地图等,颜色信息应该由用户自己在css中定义))
 * 后期应该根据传入的数组动态生成小地图
 */
 /*事件触发的时候,Controller应该通知map(调用map提供的方法)改变,而不是由
	Controller直接操作map的dom结构,boy对象应该是map持有的一个属性,由map来控制boy因为boy和map是息息相关的
	比如boy的转身与否影响了map的动画延迟等,像现在Controller中每次都动作都要同时操作他俩实在太傻了
	*/
/* 2016.4.10 iny
	 * 做缩放地图的时候之前用的maxLength就出现问题了,因为地图可不一定是正方形,
	 * 也可能是3X4等长方形,仅仅maxlength不能解决问题,要给数组添加宽高
	 */ 
(function($){

	window.myApp = window.myApp ? window.myApp : {};
	
	function Page(arr, options){
		
		this.arr = arr;
		//因为传入的参数arr不是规则的二维数组,所以先取到能容纳该数组的最小方形数组
		//干脆对实参数组进行预处理,去掉不符合标准的元素,提高安全性
		//对传入的数组参数进行筛选和初始化
		
		/*写着写着发现maxlength也是有用的,maxlength是用户传入的数组的最大值,它表示了用户期望的地图的宽高,
		 *而arr2是存放元素用的,它表示的是实际使用的元素,这两者都需要!
		 *maxLength用来生成大地图,宽高用来做实际使用的元素和缩略图?
		 */
		this.options = options;
		//当一个动画正在进行的时候,不允许其他动画进行
		this.flag = true;
		this.currentPage;
		this.boy = new Boy($('#boy'));
		this.box = $("[data-map='box']");
		this.border = $("[data-map='cell-border']")
		this.scaleBox = $('#scaleBox')
		this.init();
	}
	/*初始化*/
	Page.prototype.init = function(){
		var _this = this;
		
		this.initArray();
		this.initEvent();
		this.initProperty();

		if(this.options.tinyMap === true){
			this.generateTinyMap();
		}
		this.currentPage = this.arr[0][0];
	}
	Page.prototype.initArray = function(){
		//首先根据传入的数组计算出用户期望的小地图宽高
		var arr = $(this.arr).seven();
		this.maxLength = arr.arrMaxLength;

		//然后对用数组进行筛选,找出有用的元素组成的最小矩阵(用作缩略图)
		var arr2 = [];
		var arrWidth = 0;
		var arrHeight = 0;
		for(var i = 0 ; i < arr.length ; i ++){
			//如果当前行不为空
			if(arr[i].length != 0){
				arrHeight ++;
			}
			arr2[i] = [];
			for(var j = 0 ; j < arr[i].length ; j ++){
				//判断是不是jquery对象
				if(arr[i][j] instanceof jQuery && arr[i][j].hasClass('page')){
					arr2[i][j] = arr[i][j];
				}
			}
			arrWidth = arrWidth > arr2[i].length ? arrWidth : arr2[i].length;
		}
		this.arrHeight = arrHeight;
		console.log(this.arrHeight)
		this.arrWidth = arrWidth;
		console.log(this.arrWidth)
	}
	/*初始化元素位置和属性*/
	Page.prototype.initProperty = function(){
		var _this = this;
		//缩放用到的属性
		var proportion = this.options.proportion;
		this.scaleX = proportion / this.arrWidth;
		this.scaleY = proportion / this.arrHeight;
		this.perX = proportion / (this.arrWidth - 1);
		this.perY = proportion / (this.arrHeight - 1);
		this.orign = (100 - proportion * 100) / 2;
		var arr = this.arr;
		for(var i = 0 ; i < this.arrHeight ; i ++){
			for(var j = 0 ; j < this.arrWidth ; j ++){
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

				(function(){
					arr[i][j].on('click', function(event) {
						event.preventDefault();
						if(_this.scaleBox.hasClass('active')){
							_this.moveTo($(this))
						}
					});	
				})()
				var siblings = [];
				//对于非墙元素,上面有的,让他可以向上
				if(arr[i-1] && arr[i-1][j] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"上")
					arr[i][j].data('canMoveTop', true);
					siblings.push(arr[i-1][j]);
				}
				//下面有
				if(arr[i+1] && arr[i+1][j] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"下")
					arr[i][j].data('canMoveDown', true);
					siblings.push(arr[i+1][j])
				}
				//左边有
				if(arr[j-1] && arr[i][j-1] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"左")
					arr[i][j].data('canMoveLeft', true);
					siblings.push(arr[i][j-1])
				}
				//右边有
				if(arr[j+1] && arr[i][j+1] != undefined){
					// console.log(i+"-"+j+":"+arr[i][j]+"右")
					arr[i][j].data('canMoveRight',true);
					siblings.push(arr[i][j+1])
				}
				arr[i][j].data('neighbourNode', siblings);
			}
		}
	}
	Page.prototype.initEvent = function(){
		var _this = this;
		var scaleBtn = $("#thumb");
		scaleBtn.on('click', function(){
			_this.thumb();
		})

		//当box动画结束事件,释放动画锁flag
		this.box.on('transitionend', function(e) {
			e.stopPropagation();
			if(e.target == this){
				_this.flag = true;
				_this.boy.stop();
			}
		});

		this.scaleBox.on('transitionend', function(e) {
			
			if(!$(this).hasClass('active')){
				console.log("退出缩放,释放动画锁")
				_this.flag = true;
			}
		});

		$("#detail").on('click', function(event){
			event.stopPropagation();
			if(page.flag){
				page.moveDown()
				page.flag = false;
				//这玩意必须由用户行为来触发,
				// launchFullScreen(document.documentElement); // the whole page  
			}
		})
		$('#demos-box').on('click', function(event) {
			event.stopPropagation();
			var me = $(this)
			if(me.hasClass('stop')){
				me.removeClass('stop')
			}else{
				me.addClass('stop');
			}
		});
		
	}
	/*生成小地图*/
	/* 2016.3.31 根据传入的数组动态生成小地图,而不是由使用者自己写
	 
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
		var _this = this;
		var arr = this.arr;

		var maxLength = this.maxLength;
		var perLength = (100/maxLength).toFixed(0);
		var lastLength = 100 - perLength * (maxLength - 1);
		//小地图应该是方的!!用maxlength
		// var maxWidth = this.maxWidth;
		// var maxHeight = this.maxHeight;
		// //Number.toFixed(n)可以格式化n位小数,number是基本类型,所以不能像Math.random()一样调用
		// var perWidth = (100/maxWidth).toFixed(0);
		// var lastWidth = 100 - perWidth * (maxWidth - 1);
		
		// var perHeight = (100/maxHeight).toFixed(0);
		// var lastHeight = 100 - perHeight * (maxHeight - 1);
		
		var tinyMap = $("[data-map='tinyMap']");
		var cellBox = $('<ol></ol>')
		var border = $("[data-map='cell-border']");
		border.css('width', perLength+'%');
		border.css('height', perLength+'%');

		//果然,当数组是长方形的时候,y方向会存在溢出问题,maxLength不能满足需求
		for (var i = 0; i < maxLength; i ++) {
			for (var j = 0; j < maxLength; j ++) {
				var temp = $('<li class="cell"></li>')
				if(arr[i] && arr[i][j] !== undefined){
					// console.log(i+'+'+j+':'+arr[i][j].addClass())
					temp.addClass('cell-used');
					(function(i, j){
						temp.on('click', function(event) {
							event.preventDefault();
							_this.moveTo(arr[i][j])
						});	
					})(i, j)
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
	/*控制缩放*/
	Page.prototype.thumb = function(){

		//缩略图状态下点击,boy直接转身,然后在另一个格子出现,是不是很酷(animation连续很近的两帧之间改变boy的位置让他迅速在其他格子出现)

		var _this = this;
		
		var scaleBox = this.scaleBox;
		
		var cp = this.currentPage;

		if(scaleBox.hasClass('active')){
			scaleBox.css('transform', '');
			scaleBox.removeClass('active');
		}
		else{
			this.flag = false;
			//这么多变量,一大堆计算,很明显感觉到页面会卡
			//应该在初始化的时候把固定的作为属性保存起来,每次引用
			var scaleX = this.scaleX;
			var scaleY = this.scaleY;
			var perX = this.perX;
			var perY = this.perY;
			var orign = this.orign;
			//缩放比例为缩放图占屏幕的比例/格子宽度
			var currentPage = this.currentPage;
			var orignX = orign + currentPage.data('j')*perX*100;
			var orignY = orign + currentPage.data('i')*perY*100;
			
			scaleBox.css('transform','scale('+scaleX+','+scaleY+')');
			scaleBox.css('transform-origin', orignX+'% '+orignY+'%');
			scaleBox.addClass('active');
			
			//addClass导致爆卡
			//测试发现是因为addClass后需要对新的css样式进行渲染,如何避免呢?
			// BUG:如果立即增加active,会运动的同时不断渲染boxshadow,导致特别卡
			// 解决:1.不要boxshadow的动画或hover时才有
			//	 √ 2.设置监听,运动完以后再加active(会触发多次事件,还要闭包,想想七夕那个就有点烦)
			
			// 这样还不够,还要根据最大宽(高)动态计算transform-orign
		}
		console.log("after:"+this.flag)
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
		if(this.flag){
			var currentPage = this.currentPage;
			if(currentPage.data('canMoveDown')){
				var arr = this.arr;
				var i = currentPage.data('i');
				var j = currentPage.data('j');
				this.initTime();
				this.boy.walk()
	
				this.box.css('transform', 'translateX(-'+j+'00%) translateY(-'+(i+1)+'00%)')
				this.border.css('transform', 'translateX('+j+'00%) translateY('+(i+1)+'00%)')
				
				currentPage.removeClass('active')

				this.currentPage = arr[i+1][j];

				this.currentPage.addClass('active')

				this.flag = false;
			}
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

	function F(desNode, orignNode){
		return G(desNode, orignNode) + H(desNode, orignNode);
	}
	function G(desNode, orignNode){
		//计算路径的权重 惯例:直10 斜14 这里因为我没用斜,所以直接用1即可
		return 1;
	};
	function H(desNode, orignNode){
		var ox = orignNode.data('i');
		var oy = orignNode.data('j');	
		var dx = desNode.data('i');
		var dy = desNode.data('j');
		var h = Math.abs(ox-dx)+Math.abs(oy-dy);
		return h;
	}

	/* A*寻路(曼哈顿) */
	Page.prototype.getPath = function(desNode, orignNode){
		if(!this.path){
			this.path = [];
		}
		var arr = this.arr;
		var i = orignNode.data('i');
		var j = orignNode.data('j');	
		var dx = desNode.data('i');
		var dy = desNode.data('j');
		
		console.log("=============开始寻路=================")
		console.log('起始节点'+i+','+j)
		console.log('目标节点'+dx+','+dy)
		if(i == dx && j == dy){
			console.log('到达节点'+desNode.data('i')+','+desNode.data('j'))
			console.log("=============寻路结束=================")
			var path = this.path
			delete this.path;
			return path;
		}
		
		var bestNode;
		var min = 0;
		var temp;
		//√ 应该在初始化时把兄弟节点保存到本节点的属性中,就不用这么麻烦地取了(如 if(node.left) arr.push(node.left))
		//js对象是引用传递的,这样删除会直接改变原数组,明显是不期望的,简单的解决办法 arr2 = arr1.slice(0) 或 arr2 = arr1.concat()!
		var neighbours = orignNode.data('neighbourNode').concat();
		console.log('当前节点共有兄弟节点:'+neighbours.length+'个')
		while(temp = neighbours.pop()){
			console.log('对于某一兄弟节点:'+temp.data('i')+','+temp.data('j'))
			var f = F(desNode, temp)
			console.log('曼哈顿估测寻路路径长度为'+f)
			if(f == 1){
				bestNode = temp;
				break;
			}
			if(min == 0 || f < min){
				min = f;
				bestNode = temp;
			}
		}
		this.path.push(bestNode)
		console.log('所选择的最优兄弟节点为:'+bestNode.data('i')+','+bestNode.data('j'))
		// if(bestNode == desNode){
		// 	console.log('到达节点'+bestNode.data('i')+','+bestNode.data('j'))
		// 	console.log("=============寻路结束=================")
		// }else{
		return this.getPath(desNode, bestNode);
			// arguments.callee(desNode, bestNode)
		// }
		//√ 应该每次寻路时新建一个临时数组维护已经遍历的节点,这样最后还能直接取到最佳路径,如果图代码简单,像现在这样,千万别忘了每次寻路后将所有hasfind置为false
	}

	Page.prototype.moveTo = function(desNode){
		var p = this.currentPage.data('neighbourNode');
		console.log(p)
		console.log(p.length)
		var path = this.getPath(desNode, this.currentPage)
		for(var i = 0 ; i < path.length ; i ++){
			console.log(path[i].data('i')+','+path[i].data('j'))
		}
	}
	
	myApp.Page = Page;

})(jQuery)

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
	