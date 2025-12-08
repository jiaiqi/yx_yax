//应用入口按钮区域处理
//####1.超出宽度个数自动隐藏并添加其他按钮
//####2.鼠标悬停显示全部,
//####3.标记隐藏按钮的选中效果,
;
(function($) {
	$.fn.appboxs = function() {
		//var leftWidth = 520; //左侧logo占用宽度
		//var leftWidth = $('.weather').width() + $('.logo').width() + $('.hideMenu').width(); //左侧logo占用宽度
		var leftWidth = 450; //左侧logo占用宽度
		var rightWidth = 400; //通讯录区域占用宽度
		var appIconWidth = 78; //一个app占用的宽度
		//先计算出App数量
		var appNums = $(".applications li").length;
		//计算合适的左侧宽度和右侧宽度
		var appShowWidth = ($(top.window).width() - leftWidth - rightWidth );
		var appShowNum = Math.floor(appShowWidth / appIconWidth);   //当前视口最多放置应用数量
		var isAppMenuShow = false
		appWidth = appShowWidth;
		appboxsWidth = appShowWidth;
		var leftStr  = '';
		var rightStr = '';
		var appTmpWidth = $(top.window).width() - leftWidth - rightWidth;  //获取应用区域最大宽度
		if (appShowNum >= appNums) {
			//appNums = appShowNum;
			var tmp = appIconWidth * appNums;
			leftStr = leftWidth + (appTmpWidth  - appIconWidth * appNums) / 2 + 'px';
			rightStr = rightWidth + (appTmpWidth  - appIconWidth * appNums) / 2	+ 'px';
			$(".applications").css('left', leftStr);
			$(".applications").css('right', rightStr);
			var appFixWidth = appNums*appIconWidth;
			if(appFixWidth<appIconWidth){
				$(".applications").width(appIconWidth);
			}else{
				$(".applications").width(appFixWidth);
			}
		} else {
			leftStr = leftWidth + (appTmpWidth - appIconWidth * appShowNum) / 2 + 'px';
			rightStr = rightWidth + (appTmpWidth - appIconWidth * appShowNum) / 2 + 'px';
			$(".applications").css('left', leftStr);
			$(".applications").css('right', rightStr);
			appNums = appShowNum-1 ;
			var appFixWidth = appShowNum*appIconWidth;
			if(appFixWidth<appIconWidth){
				$(".applications").width(appIconWidth);
			}else{
				$(".applications").width(appFixWidth);
			}
		}
		$(".applications").css('left', leftStr);
		var allBtn = $("<button id='app-plus' type='button' class='' style='border-width:0;'><img alt='' class='img-responsive' src='images/appicon/gengduo.png'><h6>更多</h6></button>");
		$(".applications li").each(function apphide(index) {
			if (index >= appNums) {
				$(this).addClass('overtop');
				$(this).hide();
				if ($("#app-plus").length <= 0) {
					$(".applications").append(allBtn);
				}
			} else {
				$('#app-plus').remove();
				$(this).show().removeClass('overtop');
			}
		});
		/*$(".applications").mousemove(function() {
		}).mouseout(function() {
		});*/
		$(".applications").hover(function(event){
            if(!isAppMenuShow){
					isAppMenuShow = true
			timer = setTimeout(function() {
				//timer = 0;
				//$(".applications").css('left', leftStr);
				$("#app-plus").hide(100);
				$(".applications li:hidden").show(200);
				$(".applications").css('background-color', 'rgba(0,0,0,0.6)');
				$(".applications").css('border-radius', '0 0 0px 0px');
				console.log('显示')
				 event.stopPropagation();
				return false;    
			}, 200);}
        },function(){
            if(isAppMenuShow){
				isAppMenuShow = false
			timer = setTimeout(function() {
				//timer = 0;
				//$(".applications").css('left', leftStr);
				$("li.overtop").hide(100);
				$("#app-plus").show(200);
				//$(".applications").css('left', leftStr);
				$(".applications").css('background-color', 'rgba(0,0,0,0)');
				console.log('隐藏')
			}, 200);
			}
        })
		$(".applications li").click(function() {
		    setTimeout(function() {
			$("li.overtop").hide(200);
			$("#app-plus").show(300);
			//$(".applications").css('left', leftStr);
			$(".applications").css('background-color', 'rgba(0,0,0,0)');
			},500);
			$(this).siblings('li').removeClass('active'); // 删除其他兄弟元素的样式
			$(this).addClass('active');
			//判断是否是标记li\
			if ($(this).hasClass('overtop')) {
				$("#app-plus").addClass('app-plus-a')
			} else {
				$("#app-plus").removeClass('app-plus-a')
			}
		});
		//个人快捷入口按钮区域
		var toolBoxWidth = $(".tool-box").width();
		var toolNums = Math.floor(((toolBoxWidth - 100) / 60) - 2);
		var toolPlusBtn = $('<li class="" id="more-btn"><a href="#"><i class="layui-icon layui-icon-spread-left"></i><span class="tool-name gray">更多</span></a></li>');
		$(".tool-box li").each(function toolBox(index) {
			if (index > toolNums) {
				$(this).addClass("tool-more");
				$(this).hide();
				//$(".tool-box ul li.more-btn").show();
				if ($("#more-btn").length == 0)
					$(".tool-box ul").append(toolPlusBtn);
			} else {
				$(this).show().removeClass("tool-more");
				$('#more-btn').remove();
			}
		});
		//限制字符个数
		// $(".main-left .nav-list li a").each(function(){
		// //var toolText = $(".tool-box li>a>.tool-name").text();
		// var maxWidthNums=6;
		// if($(this).text().length> maxWidthNums){
		// $(this).text($(this).text().substring(5,maxWidthNums));
		// $(this).text($(this).text()+'…');
		// //$(this).parent('a').attr('title',toolText);
		// }
		// });
		$(".tool-box li>a>span.tool-name").each(function() {
			//var toolText = $(".tool-box li>a>.tool-name").text();
			var maxWidthNums = 4;
			if ($(this).text().length > maxWidthNums) {
				$(this).text($(this).text().substring(0, maxWidthNums));
				$(this).html($(this).html() + '…');
				//$(this).parent('a').attr('title',toolText);
			}
		});
		// $(".home-pager tr td").each(function(){
		// //var toolText = $(".tool-box li>a>.tool-name").text();
		// var maxWidthNums=20;
		// if($(this).text().length> maxWidthNums){
		// $(this).text($(this).text().substring(0,maxWidthNums));
		// $(this).html($(this).html()+'…');
		// //$(this).parent('a').attr('title',toolText);
		// }
		// });
		$(".tool-box ul").hover(function() {
			timer = setTimeout(function() {
				timer = 0;
				$(".tool-box li:hidden").show(200);
				$("#more-btn").hide(300);
			}, 500);
		}, function() {
			if (timer) {
				clearTimeout(timer);
				timer = 0;
				return;
			}
			;
			//alert("end");
			$("li.tool-more").hide(200);
			$("#more-btn").show(300);
		});
		//var tab-content = $("");
		// $("ul[role='tablist'] li a").click(function(){
		// var taba = $(this)[data-addtab].val();
		// })
	}
	$(window).resize(function() {
		$(this).appboxs();
	})
})(jQuery)
