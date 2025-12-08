/*
	@Author: 请叫我马哥
	@Time: 2017-04
	@Tittle: tab
	@Description: 点击对应按钮添加新窗口
*/
var current_iframe_data_id = "";
var scroll_height = {}
var tabFilter, menu = [], liIndex, curNav, delMenu;
layui.define(["element", "jquery"], function (exports) {
	var element = layui.element(),
		$ = layui.jquery,
		layId,
		Tab = function () {
			this.tabConfig = {
				closed: true,
				openTabNum: undefined,  //最大可打开窗口数量
				tabFilter: "bodyTab",  //添加窗口的filter
				url: undefined  //获取菜单json地址
			}
		};
	function spliturlParams(url, init_params) {
		init_params = init_params.replace(/\s+/g, "");
		init_params = init_params.replace(/\r\n/g, "");
		init_params = init_params.replace(/\n/g, "");
		init_params = encodeURI(init_params);
		var pos = url.indexOf("?");
		if (pos != -1) {
			// en
			url = url + "&init_params=" + init_params
		} else {
			url = url + "?init_params=" + init_params
		}
		return url;
	}
	function transData(a, idStr, pidStr, chindrenStr,namecol) {
		var r = [],
			hash = {},
			id = idStr, pid = pidStr, children = chindrenStr, i = 0, j = 0, len = a.length;
		for (; i < len; i++) {
			hash[a[i][id]] = a[i];
		}
		for (; j < len; j++) {
			var aVal = a[j], hashVP = hash[aVal[pid]];
			if(!namecol){
				aVal.title = aVal.menu_name;
			}else{
				aVal.title = aVal[namecol];
			}
			aVal.icon = "&#xe624;";  // &#xe624; &#xe631;
			if (aVal.menu_url&&aVal.menu_url != 'undefined' && aVal.menu_url != '') {
				var url = aVal.menu_url;
				var position = url.indexOf("${");
				var param_expression = "";
				if (position != -1) {
					param_expression = url.substring(position + 2, url.length - 1);
					var value = eval(param_expression);
					url = url.replace("${" + param_expression + "}", value);
				}
				var init_params = aVal.init_params;
				if (init_params != undefined && init_params != null && init_params != "") {
					url = spliturlParams(url, init_params);
				}
				aVal.href = url;
			} else {
				var url = aVal.menu_url
				var init_params = aVal.init_params;
				if (init_params != undefined && init_params != null && init_params != "") {
					url = spliturlParams(url, init_params);
				}
				aVal.href = url;
			}
			aVal.spread = false;
			if (hashVP) {
				!hashVP[children] && (hashVP[children] = []);
				hashVP[children].push(aVal);
			} else {
				r.push(aVal);
			}
		}
		return r;
	}
	function renderEvent() {
		var dv = $(this).find(".menu_three")
		var tv = $(this).find(".menu_three")
		$(".menu_three").on("click", function () {
			console.log('二级菜单dv：', dv, this)
			var sp = $(this).find("span");
			var pr = $(this).parent().siblings()
			if (sp.hasClass("three_down_arrow")) {
				$(this).find("span").removeClass("three_down_arrow");
				$(this).find("span").addClass("layui-nav-more");
			} else if (sp.hasClass("layui-nav-more")) {
				console.log("二级菜单2", $(this).find("span"))
				$(this).find("span").removeClass("layui-nav-more");
				$(this).find("span").addClass("three_down_arrow");
			}
			$.each($(this).next("ol").find("li>a"), function (i, e) {
				$(e).removeClass('three_this');
			});
			$(this).next().toggle();
			$.each($(this).parent().siblings(), function (i, e) {
				$(e).find("ol").hide();
				if ($(e).find("span").hasClass("layui-nav-more")) {
					//修复其他展开的折叠
					$(e).find("span").removeClass('layui-nav-more')
					$(e).find("span").addClass('three_down_arrow')
				}
			});
		});
		$("ol").on("click", "li a", function () {
			$.each($(this).parent().siblings(), function (i, e) {
				$(e).find("a").removeClass('three_this')
				console.log("二级菜单3", $(e).find("a"))
			});
			$(this).addClass('three_this');                            // 添加当前元素的样式
		})
	};
	function setCurrentApp(app_no,app_name) {
		//console.log("setCurrentApp:",app_no)
		sessionStorage.setItem("current_app", app_no);
		if(app_name){
			sessionStorage.setItem("current_app_name", app_name);
		}
		top.pathConfig.application = app_no;
		top.pathConfig.app_path = top.pathConfig.gateway + "/" + app_no;
	}

	// 打开只有一个app的页面
	Tab.prototype.open_single_app = ()=>{
		const app = sessionStorage.getItem('current_app')
		const current_app_name =  sessionStorage.getItem('current_app_name')
		document.title = current_app_name
		Tab.prototype.render(app,current_app_name)
	}

	// view_mode为customize时,如果top_menu_disp为否将所有菜单渲染到侧边栏
	Tab.prototype.only_side_menu_render = (resData) => {
		var path = top.pathConfig.gateway + "/config/select/srvconfig_user_menu_select";
		var requestData = {};
		requestData.serviceName = "srvconfig_user_menu_select";
		requestData.colNames = ["*"];
		requestData.condition = []
		requestData.order = [{ "colName": "seq", "orderType": "asc" }];

		requestData.relation_condition = {
			relation: "OR",
			data: []
		}

		var data = [];
		if (resData.length > 0) {
			resData.forEach(item => {
				let cond = {
					"relation": "AND",
					"data": [{
						colName: "path",
						ruleType: "like",
						value: "/" + item.no + "/"
					},
					{
						colName: "no",
						ruleType: "ne",
						value: item.no
					}]
				}
				requestData.relation_condition.data.push(cond)
			})

			crosAjax(path, "POST", requestData, function (backdata) {
				if (backdata.data == undefined) {
					top.window.showLayer.show("", null);
				} else {
					var menuDatas = backdata.data;
					menuDatas = [...menuDatas, ...resData]

					var data = [];
					if (menuDatas.length > 0) {
						var tree = transData(menuDatas, "no", "parent_no", "children", "fk_menu_name");
						data = tree;
					}
					$(".navBar").html(cus_navBar(data)).height($(window).height() - 60);
					element.init();
					$(window).resize(function () {
						$(".navBar").height($(window).height() - 60);
					})
					// 20201130新增根据应用切换主页参数，规则是‘应用编号@main_page配置’，否则是默认页面
					var pages_attribute = JSON.parse(window.sessionStorage.getItem("pages_attribute"));
					var key_str =null
   
          var mainpage ='page/main.html';
					var app_no = top.user.application
					 key_str = pages_attribute && pages_attribute.hasOwnProperty(app_no + "@main_page") ? pages_attribute[app_no + "@main_page"] : null;
          if(top.user?.theme?.main_page){
            key_str = top.user.theme.main_page
          }
					if (key_str && key_str != undefined) {
						$('#mainpage').attr('src', key_str);
					} else {
						$('#mainpage').attr('src', mainpage);
					}
					element.tabChange("bodyTab", '');
					// 结束新增
					renderEvent();
				}
			});
		}
	}

	Tab.prototype.cus_render = function (menu_no) {
		var path = top.pathConfig.gateway + "/config/select/srvconfig_user_menu_select";
		var requestData = {};
		requestData.serviceName = "srvconfig_user_menu_select";
		requestData.colNames = ["*"];
		requestData.condition = [ {
				colName: "path",
				ruleType: "like",
				value: "/"+menu_no+"/"
			},
			{
				colName: "no",
				ruleType: "ne",
				value: menu_no
			}]
		requestData.order = [{ "colName": "seq", "orderType": "asc" }];
		crosAjax(path, "POST", requestData, function (backdata) {
			if (backdata.data == undefined) {
				top.window.showLayer.show("", null);
			} else {
				var menuDatas = backdata.data;
				var data = [];
				if (backdata.data.length > 0) {
					var tree = transData(backdata.data, "no", "parent_no", "children","fk_menu_name");
					data = tree;
				}
				var _this = this;
				$(".navBar").html(cus_navBar(data)).height($(window).height() - 60);
				element.init();
				$(window).resize(function () {
					$(".navBar").height($(window).height() - 60);
				})
				// setCurrentApp(app_no);  // 0416
				// 20201130新增根据应用切换主页参数，规则是‘应用编号@main_page配置’，否则是默认页面
				var pages_attribute = JSON.parse(window.sessionStorage.getItem("pages_attribute"));
				var key_str =null
				var mainpage ='page/main.html';
				var app_no = top.user.application
				 key_str = pages_attribute && pages_attribute.hasOwnProperty(app_no + "@main_page") ? pages_attribute[app_no + "@main_page"] : null;
         if(top.user?.theme?.main_page){
          key_str = top.user.theme.main_page
         }
				if (key_str && key_str != undefined) {
					$('#mainpage').attr('src', key_str);
				} else {
					$('#mainpage').attr('src', mainpage);
				}
				element.tabChange("bodyTab", '');
				// 结束新增
				renderEvent();
			}
		});
	}
	//获取二级菜单数据
	Tab.prototype.render = function (app_no,app_name) {
		if (app_no != undefined) {
			setCurrentApp(app_no,app_name)
			var path = top.pathConfig.gateway + "/" + app_no + "/select/srvsys_user_menu_select";
			var requestData = {};
			requestData.serviceName = "srvsys_user_menu_select";
			requestData.colNames = ["*"];
			requestData.condition = [{
				colName: "client_type",
				ruleType: "like",
				value: "PC"
			}]
			requestData.order = [{ "colName": "seq", "orderType": "asc" }];
			crosAjax(path, "POST", requestData, function (backdata) {
				if (backdata.data == undefined) {
					top.window.showLayer.show("", null);
				} else {
					var data = [];
					if (backdata.data.length > 0) {
						var tree = transData(backdata.data, "menu_no", "parent_no", "children");
						data = tree;
					}
					var _this = this;
					$(".navBar").html(navBar(data, app_no)).height($(window).height() - 60);
					element.init();
					$(window).resize(function () {
						$(".navBar").height($(window).height() - 60);
					})
					// setCurrentApp(app_no);  // 0416
					// 20201130新增根据应用切换主页参数，规则是‘应用编号@main_page配置’，否则是默认页面
					var pages_attribute = JSON.parse(window.sessionStorage.getItem("pages_attribute"));
					var key_str = pages_attribute && pages_attribute.hasOwnProperty(app_no + "@main_page") ? pages_attribute[app_no + "@main_page"] : null;
					var mainpage = pages_attribute && pages_attribute['main_page'] ? pages_attribute['main_page'] : 'page/main.html';
          // if(top.user?.theme?.main_page){
          //   key_str = top.user.theme.main_page
          //  }
					if (key_str && key_str != undefined) {
						$('#mainpage').attr('src', key_str);
					} else {
						$('#mainpage').attr('src', mainpage);
					}
					element.tabChange("bodyTab", '');
					// 结束新增
					renderEvent();
				}
			});
		}
	}
	//参数设置
	Tab.prototype.set = function (option) {
		var _this = this;
		$.extend(true, _this.tabConfig, option);
		return _this;
	};
	//通过title获取lay-id
	Tab.prototype.getLayId = function (url) {
		$(".layui-tab-title.top_tab li").each(function () {
			if ($(this).find("span").text() == url) {
				layId = $(this).attr("lay-id");
			}
		})
		return layId;
	}
	//通过title判断tab是否存在
	Tab.prototype.hasTab = function (url) {
		var tabIndex = -1;
		$(".layui-tab-title.top_tab li").each(function () {
			if ($(this).find("span").text() == url) {
				tabIndex = 1;
			}
		})
		return tabIndex;
	}
	Tab.prototype.replaceTab = function  (page) {
		let curDataId = Tab.prototype.getCurrentTab()
		if(curDataId){
			Tab.prototype.closeCurrentTab(curDataId)
		}
		Tab.prototype.addTab.bind(this)(page)
	}
	//右侧内容tab操作
	var tabIdIndex = 0;
	Tab.prototype.tabAdd = function (_this) {
		getIframeByElement();
		if (window.sessionStorage.getItem("menu")) {
			menu = JSON.parse(window.sessionStorage.getItem("menu"));
		}
		var that = this;
		var closed = that.tabConfig.closed,
			openTabNum = that.tabConfig.openTabNum;
		tabFilter = that.tabConfig.tabFilter;
		if(_this.attr('data-url')?.includes('target=_self') || _this.attr('data-url')?.includes('target=_self')){
			window.location.href = _this.attr("data-url");
		}else if (_this.attr('data-url')?.includes('target=_blank') || _this.attr("target") == "_blank") {
			window.open(_this.attr("data-url"))
		} else if (_this.attr("data-url") != undefined) {
			var app = _this.attr("app");
			var menuNo = _this.attr("menu-no");
			setCurrentApp(app);
			var title = '';
			if (_this.find("i.iconfont,i.layui-icon").attr("data-icon") != undefined) {
				if (_this.find("i.iconfont").attr("data-icon") != undefined) {
					title += '<i class="iconfont ' + _this.find("i.iconfont").attr("data-icon") + '"></i>';
				} else {
					title += '<i class="layui-icon">' + _this.find("i.layui-icon").attr("data-icon") + '</i>';
				}
			}
			var lay_id = new Date().getTime();
			//已打开的窗口中不存在
			//if(that.hasTab(_this.find("cite").text()) == -1 && _this.siblings("dl.layui-nav-child").length == 0){
			if (that.hasTab(_this.attr("data-url")) == -1 && _this.siblings("dl.layui-nav-child").length == 0) {
				if ($(".layui-tab-title.top_tab li").length == openTabNum) {
					layer.msg('只能同时打开' + openTabNum + '个选项卡哦。不然系统会卡的！');
					return;
				}
				tabIdIndex++;
				title += '<cite>' + _this.find("cite").text() + '</cite><span style="display:none">' + _this.attr("data-url") + '</span>';
				title += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + lay_id + '" app="' + app + '">&#x1006;</i>';
				
				element.tabAdd(tabFilter, {
					title: title,
					content: "<iframe src=\"" +  _this.attr("data-url") + "\" data-id=\"" + lay_id + "\" data-app=\"" + app + "\"></frame>",
					id: lay_id
				})
				//当前窗口内容
				var curmenu = {
					"icon": _this.find("i.iconfont").attr("data-icon") != undefined ? _this.find("i.iconfont").attr("data-icon") : _this.find("i.layui-icon").attr("data-icon"),
					"title": _this.find("cite").text(),
					"href": _this.attr("data-url"),
					"app": app,
					"layId": lay_id,
					"menu_no": menuNo
				}
				menu.push(curmenu);
				window.sessionStorage.setItem("menu", JSON.stringify(menu)); //打开的窗口
				window.sessionStorage.setItem("curmenu", JSON.stringify(curmenu));  //当前的窗口
				element.tabChange(tabFilter, that.getLayId(_this.attr("data-url")));
				that.tabMove(); //顶部窗口是否可滚动
			} else {
				//当前窗口内容
				var curmenu = {
					"icon": _this.find("i.iconfont").attr("data-icon") != undefined ? _this.find("i.iconfont").attr("data-icon") : _this.find("i.layui-icon").attr("data-icon"),
					"title": _this.find("cite").text(),
					"href": _this.attr("data-url"),
					"app": app,
					"menu_no": menuNo
				}
				window.sessionStorage.setItem("curmenu", JSON.stringify(curmenu));  //当前的窗口
				element.tabChange(tabFilter, that.getLayId(_this.attr("data-url")));
				that.tabMove(); //顶部窗口是否可滚动
			}
		}
	}
	Tab.prototype.closeCurrentTab = function (in_layid) {
		menu = JSON.parse(window.sessionStorage.getItem("menu"));
		var _index = 0;
		for (var i in menu) {
			if ((menu[i].layId) == in_layid) {
				_index = i;
				menu.splice((_index), 1);
				break;
			}
		}
		window.sessionStorage.setItem("menu", JSON.stringify(menu));
		element.tabDelete("bodyTab", in_layid).init();
		Tab.prototype.getCurrentTab()
	}
	function getIframeByElement() {
		var c_iframe = $(".clildFrame .layui-tab-item.layui-show").find("iframe")[0];
		if (c_iframe != undefined && c_iframe != "" && c_iframe != null) {
			current_iframe_data_id = $(c_iframe).attr("data-id");
		}
	}
	Tab.prototype.taddTab = function (app, title, url, icon) {
		var page = {};
		page.title = title;
		page.url = url;
		page.app = app;
		page.icon = icon;
		window.top.tab.addTab(page);
	}
	Tab.prototype.addTab = function (page) {
		let page_app = page.app || top.pathConfig.application;
		setCurrentApp(page_app);
		getIframeByElement();
		if (window.sessionStorage.getItem("menu")) {
			menu = JSON.parse(window.sessionStorage.getItem("menu"));
		}
		var that = this;
		var closed = that.tabConfig.closed,
			openTabNum = that.tabConfig.openTabNum;
		tabFilter = that.tabConfig.tabFilter;
		var title = '<i class="layui-icon">' + "" + '</i>';
    if(page.icon){
      title = `<i class="layui-icon">${page.icon}</i>`
    }
		//已打开的窗口中不存在
		if (that.hasTab(page.url) == -1) {
			if ($(".layui-tab-title.top_tab li").length == openTabNum) {
				layer.msg('只能同时打开' + openTabNum + '个选项卡哦。不然系统会卡的！');
				return;
			}
			var lay_id = new Date().getTime();
			tabIdIndex++;
			title += '<cite>' + page.title + '</cite><span style="display:none">' + page.url + '</span>';
			title += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + lay_id + '" app="' + page_app + '" >&#x1006;</i>';
	
			var turl=page.url

			
			element.tabAdd(tabFilter, {
				title: title,
				content: "<iframe src=\"" + turl + "\" data-id=\"" + lay_id + "\" data-app=\"" + page_app + "\"></frame>",
				id: lay_id
			})
			//当前窗口内容
			var curmenu = {
				"icon": page.icon,
				"title": page.title,
				"href": page.url,
				"app": page_app,
				"layId": lay_id
			}
			var _position = 1;
			for (var item of menu) {
				if (item.layId + "" == current_iframe_data_id) {
					break;
				}
				_position++;
			}
			menu.splice(_position, 0, curmenu);
			//menu.push(curmenu);
			window.sessionStorage.setItem("menu", JSON.stringify(menu)); //打开的窗口
			window.sessionStorage.setItem("curmenu", JSON.stringify(curmenu));  //当前的窗口
			element.tabChange(tabFilter, that.getLayId(page.url));
			that.tabMove(); //顶部窗口是否可滚动
		} else {
			//当前窗口内容
			var curmenu = {
				"icon": page.icon,
				"title": page.title,
				"href": page.url,
				"app": page_app
			}
			/**
			window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));  //当前的窗口
			element.tabChange(tabFilter, that.getLayId(page.title));
			$(".clildFrame .layui-tab-item.layui-show").find("iframe")[0].src=page.url;
			//$(".clildFrame .layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload(true);
			that.tabMove(); //顶部窗口是否可滚动
			**/
			window.sessionStorage.setItem("curmenu", JSON.stringify(curmenu));  //当前的窗口
			element.tabChange(tabFilter, that.getLayId(page.url));
			that.tabMove(); //顶部窗口是否可滚动
		}
	}
	Tab.prototype.getCurrentTab = function () {
		//根据当前tab 重载 app 和当前tab  storage
		let tabs = $("#top_tabs .layui-this")[0]
		let currentId = $(tabs).attr('lay-id')
		console.log("当前tab", $(tabs).attr('lay-id'))
		var menu = JSON.parse(window.sessionStorage.getItem("menu"));
		menu.forEach((item, index) => {
			if (item.layId == currentId) {
				window.sessionStorage.setItem("curmenu", JSON.stringify(item));
				setCurrentApp(item.app);
				console.log("--->", currentId, item, window.sessionStorage.getItem("curmenu"))
			}
		})
		return currentId
	}
	//顶部窗口移动
	Tab.prototype.tabMove = function () {
		$(window).on("resize", function () {
			var topTabsBox = $("#top_tabs_box"),
				topTabsBoxWidth = $("#top_tabs_box").width(),
				topTabs = $("#top_tabs"),
				topTabsWidth = $("#top_tabs").width(),
				tabLi = topTabs.find("li.layui-this"),
				top_tabs = document.getElementById("top_tabs");;
			if (topTabsWidth > topTabsBoxWidth) {
				if (tabLi.position().left > topTabsBoxWidth || tabLi.position().left + topTabsBoxWidth > topTabsWidth) {
					topTabs.css("left", topTabsBoxWidth - topTabsWidth);
				} else {
					topTabs.css("left", -tabLi.position().left);
				}
				//拖动效果
				var flag = false;
				var cur = {
					x: 0,
					y: 0
				}
				var nx, dx, x;
				function down() {
					flag = true;
					var touch;
					if (event.touches) {
						touch = event.touches[0];
					} else {
						touch = event;
					}
					cur.x = touch.clientX;
					dx = top_tabs.offsetLeft;
				}
				function move() {
					var self = this;
					window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
					if (flag) {
						var touch;
						if (event.touches) {
							touch = event.touches[0];
						} else {
							touch = event;
						}
						nx = touch.clientX - cur.x;
						x = dx + nx;
						if (x > 0) {
							x = 0;
						} else {
							if (x < topTabsBoxWidth - topTabsWidth) {
								x = topTabsBoxWidth - topTabsWidth;
							} else {
								x = dx + nx;
							}
						}
						top_tabs.style.left = x + "px";
						//阻止页面的滑动默认事件
						document.addEventListener("touchmove", function () {
							event.preventDefault();
						}, false);
					}
				}
				//鼠标释放时候的函数
				function end() {
					flag = false;
				}
				//pc端拖动效果
				topTabs.on("mousedown", down);
				topTabs.on("mousemove", move);
				$(document).on("mouseup", end);
				//移动端拖动效果
				topTabs.on("touchstart", down);
				topTabs.on("touchmove", move);
				topTabs.on("touchend", end);
			} else {
				//移除pc端拖动效果
				topTabs.off("mousedown", down);
				topTabs.off("mousemove", move);
				topTabs.off("mouseup", end);
				//移除移动端拖动效果
				topTabs.off("touchstart", down);
				topTabs.off("touchmove", move);
				topTabs.off("touchend", end);
				topTabs.removeAttr("style");
				return false;
			}
		}).resize();
	}
	//切换窗口
	$("body").on("click", ".top_tab li", function () {
		var cure_content = $(".clildFrame .layui-tab-item.layui-show").find("iframe")[0];
		var cure_id = cure_content.getAttribute("data-id");
		var top_ps = cure_content.contentDocument.documentElement.scrollTop;
		scroll_height[cure_id] = top_ps;
		//当前所在位置
		//切换后获取当前窗口的内容
		var curmenu = '';
		var menu = JSON.parse(window.sessionStorage.getItem("menu"));
		let tabLayId = $(this).attr('lay-id')
		curmenu = menu[$(this).index() - 1];
		for (let i = 0; i < menu.length; i++) {
			if (menu[i].layId == tabLayId) {
				curmenu = menu[i]
			}
		}
		console.log("menu：", menu, curmenu)
		if ($(this).index() == 0) {
			window.sessionStorage.setItem("curmenu", '');
		} else {
			window.sessionStorage.setItem("curmenu", JSON.stringify(curmenu));
			if (window.sessionStorage.getItem("curmenu") == "undefined") {
				//如果删除的不是当前选中的tab,则将curmenu设置成当前选中的tab
				if (curNav != JSON.stringify(delMenu)) {
					window.sessionStorage.setItem("curmenu", curNav);
				} else {
					if (liIndex == 1) {
						window.sessionStorage.setItem("curmenu", JSON.stringify(menu[liIndex - 1]));
					} else {
						window.sessionStorage.setItem("curmenu", JSON.stringify(menu[liIndex - 2]));
					}
				}
			}
		}
		var curmenu_str = sessionStorage.getItem("curmenu")
		if (curmenu_str != '' && curmenu_str != 'undefined') {
			var app = JSON.parse(curmenu_str).app;
			setCurrentApp(app);
		}
		element.tabChange(tabFilter, $(this).attr("lay-id")).init();
		var data_id = $(this).attr("lay-id");
		setTimeout(function () {
			if (scroll_height[data_id] != undefined && $("iframe[data-id='" + data_id + "']")[0]) {
				$("iframe[data-id='" + data_id + "']")[0].contentDocument.documentElement.scrollTo(0, scroll_height[data_id]);
			}
		}, 100);
		console.log("点击tab", $(this).parent("li").attr('lay-id'))
		liIndex = $(this).parent("li").index();
		menu.forEach((item, index) => {
			// 处理bug 0507- 逻辑删除 menu 数据错误的问题。造成菜单app错误
			if (item.layId == $(this).parent("li").attr('lay-id')) {
				console.log("layId:", item.layId, index)
				liIndex = index
				window.sessionStorage.setItem("curmenu", JSON.stringify(item));
				setCurrentApp(item.app);
				// console.log("--->",currentId,item,window.sessionStorage.getItem("curmenu"))
			}
		})
		// new Tab().tabMove();
	})
	//删除tab
	$("body").on("click", ".top_tab li i.layui-tab-close", function (event) {
		//删除tab后重置session中的menu和curmenu
		console.log("点击删除tab", $(this).parent("li").attr('lay-id'))
		let liIndex = $(this).parent("li").index();
		console.log(liIndex)
		var menu = JSON.parse(window.sessionStorage.getItem("menu"));
		if(!menu||!Array.isArray(menu)){
			// sessionStorage中存储的menu数据被清掉了或者menu不是数组
			const in_layid = $(this).parent("li").attr('lay-id')
			element.tabDelete("bodyTab", in_layid).init();
			new Tab().tabMove();
			event.stopPropagation();
			return
		}
		//获取被删除元素
		delMenu = menu[liIndex];
		var curmenu = window.sessionStorage.getItem("curmenu") == "undefined" ? undefined : window.sessionStorage.getItem("curmenu") == "" ? '' : JSON.parse(window.sessionStorage.getItem("curmenu"));
		let currentMenu = JSON.stringify(curmenu)
		menu.forEach((item, index) => {
			// 处理bug 0507- 逻辑删除 menu 数据错误的问题。造成菜单app错误
			if (item.layId == $(this).parent("li").attr('lay-id')) {
				console.log("layId:", item.layId, index)
				liIndex = index
			}
		})
		if (JSON.stringify(curmenu) != JSON.stringify(menu[liIndex - 1])) {  //如果删除的不是当前选中的tab
			console.log("删除其他tab", liIndex)
			// window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));
			curNav = JSON.stringify(curmenu);
		} else {
			console.log("删除当前tab", liIndex)
			if ($(this).parent("li").length > liIndex) {
				window.sessionStorage.setItem("curmenu", curmenu);
				curNav = curmenu;
			} else {
				window.sessionStorage.setItem("curmenu", JSON.stringify(menu[liIndex - 1]));
				curNav = JSON.stringify(menu[liIndex - 1]);
			}
		}
		menu.splice(liIndex, 1);
		window.sessionStorage.setItem("menu", JSON.stringify(menu));
		// element.tabDelete("bodyTab",$(this).parent("li").attr("lay-id")).init();
		Tab.prototype.closeCurrentTab($(this).parent("li").attr('lay-id'))
		new Tab().tabMove();
		event.stopPropagation();
	})
	var bodyTab = new Tab();
	exports("bodyTab", function (option) {
		return bodyTab.set(option);
	});
})