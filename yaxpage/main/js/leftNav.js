function navBar(strData,app_no) {
	console.log('navBar',strData)
	var data;
	if (typeof (strData) == "string") {
		var data = JSON.parse(strData); //部分用户解析出来的是字符串，转换一下
	} else {
		data = strData;
	}
	var ulHtml = '<ul class="layui-nav layui-nav-tree">';
	//一级菜单循环
	for (var i = 0; i < data.length; i++) {
		ulHtml += '<li class="layui-nav-item">';
		if (data[i].children != undefined && data[i].children.length > 0) {
			ulHtml += '<a class="" href="javascript:;"><i class="layui-icon" data-icon="' + data[i].icon + '">&#xe624;</i><cite>' + data[i].title +'</cite>'+(data[i].wait_tip_service !== null ? '<span class="layui-badge">' + data[i].wait_tip_service +'</span>' : '' )+'<span class="layui-nav-more"></span></a>'
			//二级菜单循环
			var secondData = data[i].children;
				ulHtml += '<dl class="layui-nav-child">';
			for (var j = 0; j < secondData.length; j++) {
				if (secondData[j].children != undefined && secondData[j].children.length > 0) {
					ulHtml += '<dd>';
					ulHtml += '<a href="javascript:;" class="menu_three "><i class="layui-icon" data-icon="' + secondData[j].icon + '">&#xe624;</i><cite>' + secondData[j].title + '</cite><span class="three_down_arrow"></span></a>';
					//三级菜单循环
					var thirdData = secondData[j].children;
					ulHtml += '<ol class="layui-nav-child" style="display: none;">';
					for (var k = 0; k < thirdData.length; k++) {
						ulHtml += '<li><a href="javascript:;"  style="padding-left:45px" app="'+app_no+'"  menu-no="'+data[i].menu_no+'" data-url="' + thirdData[k].href + '"><i class="layui-icon" data-icon="' + thirdData[k].icon + '">' + thirdData[k].icon + '</i><cite>' + thirdData[k].title + '</cite>'+ (thirdData[k].wait_tip_service !== null ? '<span class="layui-badge">' + thirdData[k].wait_tip_service +'</span>' : '' )+'</a></li>';
					}
					ulHtml += '</ol>';
					ulHtml += "</dd>";
				} else {
					ulHtml += '<dd><a href="javascript:;" app="'+app_no+'"  menu-no="'+data[i].menu_no+'" data-url="'  + secondData[j].href + '" ><i class="layui-icon" data-icon="' + secondData[j].icon + '">' + secondData[j].icon + '</i><cite>' + secondData[j].title +'</cite>'+(secondData[j].wait_tip_service !== null ? '<span class="layui-badge">' + secondData[j].wait_tip_service +'</span>' : '' )+'</a></dd>';
				}
			}
					ulHtml += '</dl>';
			ulHtml += '</li>';
		} else {
			ulHtml += '<a href="javascript:;" app="'+app_no+'" menu-no="'+data[i].menu_no+'" data-url="' + data[i].href + '"><i class="layui-icon" data-icon="' + data[i].icon + '">' + data[i].icon + '</i>';
			ulHtml += '<cite>' + data[i].title  +'</cite>'+(data[i].wait_tip_service !== null ? '<span class="layui-badge">' + data[i].wait_tip_service +'</span>' : '' );
			ulHtml += '</a>';
			ulHtml += '</li>';
		}
		
	}
	ulHtml += '</ul>';
	return ulHtml;
}
// function cus_navBar(strData) {
// 	console.log('cus_navBar',strData)
// 	var data;
// 	if (typeof (strData) == "string") {
// 		var data = JSON.parse(strData); //部分用户解析出来的是字符串，转换一下
// 	} else {
// 		data = strData;
// 	}
// 	var ulHtml = '<ul class="layui-nav layui-nav-tree">';
// 	//一级菜单循环
// 	for (var i = 0; i < data.length; i++) {
// 		ulHtml += '<li class="layui-nav-item">';
// 		if (data[i].children != undefined && data[i].children.length > 0) {
// 			ulHtml += '<a class="" href="javascript:;"><i class="layui-icon" data-icon="' + data[i].icon + '">&#xe624;</i><cite>' + data[i].title +'</cite>'+(data[i].wait_tip_service !== null ? '<span class="layui-badge">' + data[i].wait_tip_service +'</span>' : '' )+'<span class="layui-nav-more"></span></a>'
// 			//二级菜单循环
// 			var secondData = data[i].children;
// 				ulHtml += '<dl class="layui-nav-child">';
// 			for (var j = 0; j < secondData.length; j++) {
// 				if (secondData[j].children != undefined && secondData[j].children.length > 0) {
// 					ulHtml += '<dd>';
// 					ulHtml += '<a href="javascript:;" class="menu_three "><i class="layui-icon" data-icon="' + secondData[j].icon + '">&#xe624;</i><cite>' + secondData[j].title + '</cite><span class="three_down_arrow"></span></a>';
// 					//三级菜单循环
// 					var thirdData = secondData[j].children;
// 					ulHtml += '<ol class="layui-nav-child" style="display: none;">';
// 					for (var k = 0; k < thirdData.length; k++) {
// 						ulHtml += '<li><a href="javascript:;"  style="padding-left:45px" app="'+app_no+'"  menu-no="'+data[i].menu_no+'" data-url="' + thirdData[k].href + '"><i class="layui-icon" data-icon="' + thirdData[k].icon + '">' + thirdData[k].icon + '</i><cite>' + thirdData[k].title + '</cite>'+ (thirdData[k].wait_tip_service !== null ? '<span class="layui-badge">' + thirdData[k].wait_tip_service +'</span>' : '' )+'</a></li>';
// 					}
// 					ulHtml += '</ol>';
// 					ulHtml += "</dd>";
// 				} else {
// 					ulHtml += '<dd><a href="javascript:;" app="'+app_no+'"  menu-no="'+data[i].menu_no+'" data-url="'  + secondData[j].href + '" ><i class="layui-icon" data-icon="' + secondData[j].icon + '">' + secondData[j].icon + '</i><cite>' + secondData[j].title +'</cite>'+(secondData[j].wait_tip_service !== null ? '<span class="layui-badge">' + secondData[j].wait_tip_service +'</span>' : '' )+'</a></dd>';
// 				}
// 			}
// 					ulHtml += '</dl>';
// 			ulHtml += '</li>';
// 		} else {
// 			ulHtml += '<a href="javascript:;" app="'+app_no+'" menu-no="'+data[i].menu_no+'" data-url="' + data[i].href + '"><i class="layui-icon" data-icon="' + data[i].icon + '">' + data[i].icon + '</i>';
// 			ulHtml += '<cite>' + data[i].title  +'</cite>'+(data[i].wait_tip_service !== null ? '<span class="layui-badge">' + data[i].wait_tip_service +'</span>' : '' );
// 			ulHtml += '</a>';
// 			ulHtml += '</li>';
// 		}
// 	}
// 	ulHtml += '</ul>';
// 	return ulHtml;
// }
function cus_navBar(strData) {
	console.log('cus_navBar',strData)
	var data;
	if (typeof (strData) == "string") {
		var data = JSON.parse(strData); //部分用户解析出来的是字符串，转换一下
	} else {
		data = strData;
	}
	var ulHtml = '<ul class="layui-nav layui-nav-tree">';
	//一级菜单循环
	for (var i = 0; i < data.length; i++) {
		ulHtml += '<li class="layui-nav-item">';
		console.log('data[i].icon',data[i].title,data[i].icon,data[i].icon =='&#xe624;')
		var count =0;
		if (data[i].children != undefined && data[i].children.length > 0) {
			//先计算所有二级菜单的wait_tip_service之和
			var secondData = data[i].children;
			for (var j = 0; j < secondData.length; j++) {
				if(secondData[j].wait_tip_service !== null){
					count+=Number(secondData[j].wait_tip_service);
				}
			}
			//再构建一级菜单HTML
			ulHtml += '<a class="" href="javascript:;"><i class="layui-icon aa" data-icon="' + data[i].icon + '">&#xe624;</i><cite>' + data[i].title +'</cite>'+(count > 0 ? '<p class="layui-badge">' + count +'</p>' : '' )+'<span class="layui-nav-more"></span></a>'
			ulHtml += '<dl class="layui-nav-child">';
			//重新遍历二级菜单构建HTML
			for (var j = 0; j < secondData.length; j++) {
				if (secondData[j].children != undefined && secondData[j].children.length > 0) {
					ulHtml += '<dd>';
					ulHtml += '<a href="javascript:;" class="menu_three "><i class="layui-icon" data-icon="' + '&#xe631;' + '">&#xe631;</i><cite>' + secondData[j].title+ '</cite>'  +(secondData[j].wait_tip_service !== null ? '<p class="layui-badge">' + secondData[j].wait_tip_service +'</p>' : '' )+'<span class="three_down_arrow"></span></a>';
					//三级菜单循环
					var thirdData = secondData[j].children;
					ulHtml += '<ol class="layui-nav-child" style="display: none;">';
					for (var k = 0; k < thirdData.length; k++) {
						ulHtml += '<li><a href="javascript:;"  style="padding-left:45px" app="'+data[i].app+'"  menu-no="'+data[i].no+'" data-url="' + thirdData[k].href + '"><i class="layui-icon" data-icon="' + thirdData[k].icon + '"></i><cite>' + thirdData[k].title + '</cite>'+ (thirdData[k].wait_tip_service !== null ? '<span class="layui-badge">' + thirdData[k].wait_tip_service +'</span>' : '' )+'</a></li>';
					}
					ulHtml += '</ol>';
					ulHtml += "</dd>";
				} else {
					ulHtml += '<dd><a href="javascript:;" app="'+data[i].app+'"  menu-no="'+data[i].no+'" data-url="'  + secondData[j].href + '" ><i class="layui-icon" data-icon="' + '&#xe631;' + '">' + '&#xe631;' + '</i><cite>' + secondData[j].title +'</cite>'+(secondData[j].wait_tip_service !== null ? '<span class="layui-badge">' + secondData[j].wait_tip_service +'</span>' : '' )+'</a></dd>';
				}
			}
					ulHtml += '</dl>';
			ulHtml += '</li>';
		} else {
			ulHtml += '<a href="javascript:;" app="'+data[i].app+'" menu-no="'+data[i].no+'" data-url="' + data[i].href + '"><i class="layui-icon" data-icon="' + data[i].icon + '">' + data[i].icon + '</i>';
			ulHtml += '<cite>' + data[i].title  +'</cite>'+(data[i].wait_tip_service !== null ? '<span class="layui-badge">' + data[i].wait_tip_service +'</span>' : '' );
			ulHtml += '</a>';
			ulHtml += '</li>';
		}
	}
	ulHtml += '</ul>';
	return ulHtml;
}