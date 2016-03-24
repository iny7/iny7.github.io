function Boy(){
	var boy = document.getElementById('boy');	

	this.left = 0;
	this.bottom = 0;
	//boy元素的初始高度(291)
	// boy.height = parseInt(getComputedStyle(boy).height);
	
	//该工具用于提供男孩运动需要的一些样式(left transform等)
	boy.stylee = function(){
		var style = function(){
			return boy.style.transform;
		}
		style.getWidth = function(){
			return parseInt(getComputedStyle(boy).width);
		}
		style.getHeight = function(){
			return parseInt(getComputedStyle(boy).height);	
		}
		style.getLeft = function(){
			if(!boy.left){
				return parseInt(getComputedStyle(boy)['left'])/WIDTH;
			}
			return boy.left;
		}
		style.setLeft = function(num){
			boy.left = num;
		}
		style.getBottom = function(){
			if(!boy.bottom){
				return parseInt(getComputedStyle(boy)['bottom'])/HEIGHT;
			}
			return boy.bottom;	
		}
		style.setBottom = function(num){
			boy.bottom = num;
		}

		return style;
	}

	// 男孩走路(如果只用y，x传undefined)
	this.walk = function(time, toX, toY){


		var util = this.stylee();
		//为解决性能问题,进行时间监控
		// var t = new Date()
		// console.log("男孩走路的时候 : "+t.getTime())
		//监测调用函数时男孩的transform值
		// console.log(util())
			
		var fromWhere = util.getLeft()
		var boyWidth = util.getWidth()
		
		var distance = (toX-fromWhere)/(boyWidth/WIDTH)*100;
		if (toY!=undefined) {
			boy.walkY(time,toY);
		};
		//别忘了把男孩的位置更新成最新的
		util.setLeft(toX)

		//动画
		boy.style.transition = "transform "+time+"s linear";
		boy.style.transform = util()+"translate("+distance+"%)";
		
		return boy;
		
	}
	// 男孩竖直方向移动
	this.walkY = function(time, toY){

		//创建实时获取样式用的工具类
		var util = this.stylee();

		//从哪儿来?(0-1)
		var fromWhere = util.getBottom()
		//男孩高度(px)
		var boyHeight = util.getHeight()
		//走多远?(是男孩宽度的百分之几?)
		var distance = -(toY-fromWhere)/(boyHeight/HEIGHT)*100;
		//别忘了把男孩的位置更新成最新的
		util.setBottom(toY)

		boy.style.transition = "transform "+time+"s linear";
		boy.style.transform = util()+"translateY("+distance+"%)";
		
		return boy;
	}
	// 男孩购物 = 男孩进商店 + 男孩出商店
	this.shop = function(time){
		
		//男孩进店
		boy.style.transition = "all "+time/2+"s linear";
		//我定义的stylee方法返回的是 ((获取取当前transform的方法)的名称),这么写有点绕了,详见代码
		boy.style.transform = boy.style.transform+"scale(0.4)";
		boy.style.opacity = 0;

		//男孩出店
		/*使用定时器
		1.不能设置为负数和0
		2.可能会因为计算机和浏览器的性能带来一些问题,例如:
		在1000ms的时候调用函数,time = 4 这个定时器应该在第1002ms触发,
		timeline中设定的1004ms定时器竟然先触发了(时间间隔太短),而触发时用来恢复男孩大小的scale2.5还没有设定,
		这就导致了男孩后来走位不准,临时解决方案:
		一 男孩walk时候用字符串操作剔除scale
		二 在函数入口处加判断,经过测试,time最小值为10的时候基本会正常调用(即误差5ms)*/
		setTimeout(function(){
			boy.className = "boy withFlower";
			//因为scale的追加会互相影响,如果不用字符串将原先的剔除的话,就只能用2.5来还原成一倍( 2.5*0.4 = 1)
			boy.style.transform = boy.style.transform+"scale(2.5)";
			boy.style.opacity = 1;
			
			//为解决性能问题,进行时间监控
			// var t = new Date()
			// console.log("取完花的时刻 : "+t.getTime())
		},time*1000/2);
		return boy;
	}
	// 男孩送花
	this.turnBack = function(){
		boy.className = "boy boyBack";
	}
	//此函数纯属娱乐
	this.gun = function(time){
		var style = boy.style.transform;
		boy.style.transition = "all "+time+"s linear";
		boy.style.transform = style+"rotate(-1440deg) ";
	}	
	return boy;
}