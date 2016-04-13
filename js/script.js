// bill应用里的数据这里也能访问到,说明localStorage是所有页面共享的,更要注意防止命名冲突
// console.log(localStorage.bill)


/*
 * 2016.3.24 iny
 * 目的:利用一个二维数组做简单的地图,地图和网页同步变化,并且
 * 根据地图中的0,1自动生成墙(网页只能在允许范围内滚动)
 * 最终抽象成为一个可复用的插件
 */
$(function(){
	//请根据需要自行填充一个二维数组,元素为某一个页面

	var arr = [
		[$("#page-1-1")],
		[$("#page-2-1")	, $("#page-2-2")],
		[,$("#page-3-2")	, $("#page-3-3")],
		[],
		[],
	]

	//入口前判断,如果是移动端,delay为0,不要地图
	//给ctrl一个重置的方法,当窗口小于700的时候,
	//改他的delay等 注意取消不需要的方法 以节约内存
	//注意对事件平稳退化
	var options = {
		'animationTime' : '2',
		'animationDelay' : '1',
		'tinyMap' : true,
		'proportion' : 0.9
	}

	// if(!isMobile){
	// 	$('#demos-box').hover(function() {
	// 		$(this).css('animation-play-state', 'paused');
	// 	}, function() {
	// 		$(this).css('animation-play-state', 'running');
	// 	});
	// }
	
	//Map是内建的对象!注意命名!
	var page = new myApp.Page(arr, options)
	window.page = page;
	$(page).seven();
	// $(page).seven();
	

	//有监听功能的是seven,要不在监听里写this.elem.trigger
	// seven.remFont();
	$(page).on('topEvent', function(event) {
		event.preventDefault();
		//包装后原先的方法竟然不能用了!要注意seven的返回值
		page.moveTop()
	});

	$(page).on('downEvent', function(event) {
		event.preventDefault();
		page.moveDown()
	});

	$(page).on('leftEvent', function(event) {
		event.preventDefault();
		page.moveLeft();
	});

	$(page).on('rightEvent', function(event) {
		page.moveRight();
		event.preventDefault();
	});

})