$(function(){
	var box = $("#box");
	var map = $("#cell-border")
	box.css('transition', 'all 1s');
	map.css('transition', 'all 1s');
	var flag = true;
	
	//当前动画未结束时不能进行其他动画
	box.on('transitionend', function(event) {
		console.log("可用了!")
		flag = true;
	});

	$("#first").on('mousewheel', function(event) {
		if(!flag)
			return false;
		var data = event.originalEvent;
		var x = data.deltaX;
		var y = data.deltaY;
		//向下
		if(Math.abs(x) < Math.abs(y) && y > 0){
			box.css('transform', 'translateY(-100%)')
			map.css('transform', 'translateY(100%)')
			flag = false;
		}
	});

	$("#fourth").on('mousewheel', function(event) {
		console.log(flag)
		if(!flag)
			return false;
		var data = event.originalEvent;
		var x = data.deltaX;
		var y = data.deltaY;
		//上
		if(Math.abs(y) - Math.abs(x) > 30 && y < 0){
			box.css('transform', 'translateY(0)')
			map.css('transform', 'translateY(0)')
			flag = false;
		}
		//右
		else if(Math.abs(x) - Math.abs(y) > 30 && x > 0){
			box.css('transform', 'translateY(-100%) translateX(-100%)')
			map.css('transform', 'translateY(100%) translateX(100%)')
			flag = false;
		}
	});
	$("#fifth").on('mousewheel', function(event) {
		if(!flag)
			return false;
		
		var data = event.originalEvent;
		var x = data.deltaX;
		var y = data.deltaY;
		//下
		if(Math.abs(y) - Math.abs(x) > 30 && y > 0){
			box.css('transform', 'translateY(-200%) translateX(-100%)')
			map.css('transform', 'translateY(200%) translateX(100%)')
			flag = false;
		}
		//左
		else if(Math.abs(x) - Math.abs(y) > 30 && x < 0){
			box.css('transform', 'translateY(-100%) translateX(0)')
			map.css('transform', 'translateY(100%) translateX(0)')
			console.log("向右滑动")	
			flag = false;
		}
	})

	$("#eighth").on('mousewheel', function(event) {
		if(!flag)
			return false;

		var data = event.originalEvent;
		var x = data.deltaX;
		var y = data.deltaY;
		//上
		if(Math.abs(y) - Math.abs(x) > 30 && y < 0){
			box.css('transform', 'translateY(-100%) translateX(-100%)')
			map.css('transform', 'translateY(100%) translateX(100%)')
			flag = false;
		}
		//右
		else if(Math.abs(x) - Math.abs(y) > 30 && x > 0){
			box.css('transform', 'translateY(-200%) translateX(-200%)')
			map.css('transform', 'translateY(200%) translateX(200%)')
			flag = false;
		}
	});
	$("#ninth").on('mousewheel', function(event) {
		if(!flag)
			return false;

		var data = event.originalEvent;
		var x = data.deltaX;
		var y = data.deltaY;
		//左
		if(Math.abs(x) - Math.abs(y) > 30 && x < 0){
			box.css('transform', 'translateY(-200%) translateX(-100%)')
			map.css('transform', 'translateY(200%) translateX(100%)')
			flag = false;
		}
	});
})