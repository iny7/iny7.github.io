/*
 * 2016.3.24 iny
 * 目的:利用一个二维数组做简单的地图,地图和网页同步变化,并且
 * 根据地图中的0,1自动生成墙(网页只能在允许范围内滚动)
 * 最终抽象成为一个可复用的插件
 */
$(function(){
	
	//请根据需要自行填充一个二维数组,元素为某一个页面
	var mapArr = [
		[$("#first")],
		[$("#fourth")	, $("#fifth")],
		[,$("#eighth")	, $("#ninth")],
		// [],
		// [],
	]

	var options = {
		'animationTime' : '2',
		'animationDelay' : '1',
		'tinyMap' : true
	}

	var ctrl = new Controller(mapArr, options);


})