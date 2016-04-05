/*
 * 2016.3.24 iny
 * 目的:利用一个二维数组做简单的地图,地图和网页同步变化,并且
 * 根据地图中的0,1自动生成墙(网页只能在允许范围内滚动)
 * 最终抽象成为一个可复用的插件
 */
$(function(){
	
	var docEl = document.documentElement;
	var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
	var clientWidth = docEl.clientWidth;
	console.log(clientWidth)

	docEl.style.fontSize = 20 * ( clientWidth/ 320) + 'px';
	console.log(getComputedStyle(document.documentElement)['fontSize'])
	// console.log(navigator)
	// console.log(navigator.userAgent)
	// console.log(navigator.appVersion) 
	var recalc = function() {
	    var clientWidth = docEl.clientWidth;
	    docEl.style.fontSize = 20 * ( clientWidth/ 320) + 'px';
	    console.log(docEl.style.fontSize)
	    // document.body.style.height = clientWidth * (900 / 1440) + 'px';
	}
	window.addEventListener(resizeEvt, recalc, false);
	document.addEventListener('DOMContentLoaded', recalc, false);

	//请根据需要自行填充一个二维数组,元素为某一个页面
	var mapArr = [
		[$("#page-1-1")],
		[$("#page-2-1")	, $("#page-2-2")],
		[,$("#page-3-2")	, $("#page-3-3")],
		// [],
		// [],
	]

	//入口前判断,如果是移动端,delay为0,不要地图
	//给ctrl一个重置的方法,当窗口小于700的时候,
	//改他的delay等 注意取消不需要的方法 以节约内存
	//注意对事件平稳退化

	var options = {
		'animationTime' : '2',
		'animationDelay' : '1',
		'tinyMap' : true
	}



	var ctrl = new Controller(mapArr, options);



})