var setLoginUserInfo;
var bxLoading;
var limitingTips; // 限流
var bxLoading_index;
var $, tab, skyconsWeather;
layui.config({
  base: "js/"
}).use(['bodyTab', 'form', 'element', 'layer', 'jquery'], function () {
  var path = top.pathConfig.gateway + "/auth/select/srvauth_user_app_menu_select";
  var bxReq = {};
  bxReq.serviceName = "srvauth_user_app_menu_select";
  bxReq.colNames = ["*"];
  var app_class = getParam("app_class");
  var pre_appclass = sessionStorage.getItem("app_class");
  let is_clean_pre_menu = true;
  if (pre_appclass == app_class || pre_appclass == null || pre_appclass == 'null') {
    is_clean_pre_menu = false
  }
  sessionStorage.setItem("app_class", app_class);
  bxReq.condition = [{ "colName": "menu_view_model", "ruleType": "eq", "value": sessionStorage.getItem("menu_view_model") }];
  if (app_class) {
    bxReq.condition.push({ "colName": "app_class", "ruleType": "eq", "value": app_class });
  }
  //查询完整应用列表
  crosAjax(`${top.pathConfig.gateway}/config/select/srvconfig_app_list_select`, "POST", {
    "serviceName": "srvconfig_app_list_select",
    "colNames": [
      "*"
    ],
    "condition": [],
    "relation_condition": {},
    "page": {
      "pageNo": 1,
      "rownumber": 999
    },
    "order": []
  }, function (backdata) {
    if (backdata.data != undefined && Array.isArray(backdata.data) && backdata.data.length > 0) {
      window.sessionStorage.setItem('applications', JSON.stringify(backdata.data)) // 保存应用
    }
  })

  /**
   * 渲染顶部应用
   * @param {Array} datas
   */
  function renderTopApps(datas) {
    if (Array.isArray(datas) && datas.length) {
      window.sessionStorage.setItem("applications", JSON.stringify(datas)); // 保存应用
      let init_app_no = datas[0].app_no;
      let htmlStr = ''
      if (datas.length > 1) {
        htmlStr = datas.reduce((acc, cur) => {
          acc += `
					<li class="" style="margin:0px 0px 0px 0px">
						<a href="javascript:tab.render('${cur.app_no}');" id="app_tip_${cur.app_no}">
						<img  class="img-responsive" src="${cur.app_icon}"/>
						<h6 class="">${cur.app_name}</h6>
						</a>
					</li>
					`;
          return acc;
        }, "");
        $("#apps").append(htmlStr);
        $("body").appboxs();
      }
      tab.render(init_app_no);

    }
  }
  crosAjax(path, "POST", bxReq, function (backdata) {
    var pages_attribute_str = sessionStorage.getItem('pages_attribute')
    if (pages_attribute_str) {
      try {
        pages_attribute_str = JSON.parse(pages_attribute_str)
      } catch (error) {

      }
      if (pages_attribute_str && pages_attribute_str.home_page_title) {
        document.querySelector("#top_tabs li.layui-this cite").innerText = pages_attribute_str.home_page_title
      }
      if (pages_attribute_str && pages_attribute_str['后台首页标题']) {
        document.querySelector("#top_tabs li.layui-this cite").innerText = pages_attribute_str['后台首页标题']
      }
    }

    if (backdata.data != undefined) {
      window.sessionStorage.setItem("top_menu", "yes");
      var view_mode = backdata["view_mode"];
      if (view_mode && "customize" == view_mode) {
        var htmlStr = "";
        var data = [];
        // 将全部菜单渲染到侧边栏
        var pages_attribute_str = sessionStorage.getItem('pages_attribute')
        if (pages_attribute_str) {
          pages_attribute_str = JSON.parse(pages_attribute_str)
          if (pages_attribute_str.top_menu_disp === "否") {
            return tab.only_side_menu_render(backdata.data)
          }
        }
        if (backdata.data.length > 0) {
          var init_menu_no = "";
          $.each(backdata.data, function (index, value) {
            var is_leaf = value.is_leaf;
            //判断是否默认加载左侧菜单 如果第一个是父菜单 需要加载
            if (index == 0 && is_leaf == '否') {
              init_menu_no = value.no;
            }
            //默认图标
            var menu_icon = value.menu_icon;
            if (!menu_icon) {
              menu_icon = "images/appicon/zichan.png";
            } else {
              menu_icon = top.pathConfig.gateway + "/file/download?bx_auth_ticket=" + sessionStorage.getItem("bx_auth_ticket") + "&fileNo=" + menu_icon;
            }
            htmlStr += '<li class="" style="margin:0px 0px 0px 0px">';
            if (is_leaf == '是') {
              htmlStr += '<a href="javascript:tab.taddTab(\'' + value.app + '\',\'' + value.fk_menu_name + '\',\'' + value.menu_url + '\',\'' + value.icon + '\');" id="app_tip_' + value.no + '" class="">';
            } else {
              htmlStr += '<a href="javascript:tab.cus_render(\'' + value.no + '\');" id="app_tip_' + value.no + '" class="">';
            }
            htmlStr += '<img  class="img-responsive" src="' + menu_icon + '">';
            htmlStr += '<h6 class="">' + value.fk_menu_name + '</h6>';
            if (value.wait_num > 0) {
              htmlStr += '<span class="badge-danger">' + value.wait_num + '</span>';
            }
            htmlStr += '</a>';
            htmlStr += '</li>';
          })
          $("#apps").append(htmlStr);
          $("body").appboxs();
          if (init_menu_no) {
            tab.cus_render(init_menu_no);
          }
        }
      } else {
        var htmlStr = "";
        var data = [];
        if (backdata.data.length > 0) {
          renderTopApps(backdata.data)
        }
      }
    } else {
      window.sessionStorage.setItem("top_menu", "");
    }
  });
  var form = layui.form(),
    layer = layui.layer,
    element = layui.element();
  $ = layui.jquery;
  tab = layui.bodyTab({
    openTabNum: "50",  //最大可打开窗口数量
    url: "json/navs.json" //获取菜单json地址
  });
  bxLoading = function (opts) {
    if (opts.mask) {
      bxLoading_index = layer.msg('努力中...',
        { icon: 16, shade: [0.5, '#f5f5f5'], scrollbar: false, offset: 'auto', time: 10000000 }
      );
      setTimeout(() => {
        if (bxLoading_index) {
          layer.close(bxLoading_index);
        }
      }, 20 * 1000);
    } else {
      if (bxLoading_index) {
        layer.close(bxLoading_index);
      }
    }
  }
  limitingTips = function () {
    layer.msg('当前使用人数过多，请稍后再试', { icon: 12 });
  }
  function getParam(name) {
    return location.href.match(new RegExp('[?#&]' + name + '=([^?#&]+)', 'i')) ? RegExp.$1 : '';
  }
  //更换皮肤
  function skins() {
    var skin = window.sessionStorage.getItem("skin");
    if (skin) {  //如果更换过皮肤
      if (window.sessionStorage.getItem("skinValue") != "自定义") {
        $("body").addClass(window.sessionStorage.getItem("skin"));
      } else {
        $(".layui-layout-admin .layui-header").css("background-color", skin.split(',')[0]);
        $(".layui-bg-black").css("background-color", skin.split(',')[1]);
        $(".hideMenu").css("background-color", skin.split(',')[2]);
      }
    }
  }
  skins();
  $(".changeSkin").click(function () {
    layer.open({
      title: "更换皮肤",
      area: ["310px", "280px"],
      type: "1",
      content: '<div class="skins_box">' +
        '<form class="layui-form">' +
        '<div class="layui-form-item">' +
        '<input type="radio" name="skin" value="默认" title="默认" lay-filter="default" checked="">' +
        '<input type="radio" name="skin" value="橙色" title="橙色" lay-filter="orange">' +
        '<input type="radio" name="skin" value="蓝色" title="蓝色" lay-filter="blue">' +
        '<input type="radio" name="skin" value="自定义" title="自定义" lay-filter="custom">' +
        '<div class="skinCustom">' +
        '<input type="text" class="layui-input topColor" name="topSkin" placeholder="顶部颜色" />' +
        '<input type="text" class="layui-input leftColor" name="leftSkin" placeholder="左侧颜色" />' +
        '<input type="text" class="layui-input menuColor" name="btnSkin" placeholder="顶部菜单按钮" />' +
        '</div>' +
        '</div>' +
        '<div class="layui-form-item skinBtn">' +
        '<a href="javascript:;" class="layui-btn layui-btn-small layui-btn-normal" lay-submit="" lay-filter="changeSkin">确定更换</a>' +
        '<a href="javascript:;" class="layui-btn layui-btn-small layui-btn-primary" lay-submit="" lay-filter="noChangeSkin">我再想想</a>' +
        '</div>' +
        '</form>' +
        '</div>',
      success: function (index, layero) {
        var skin = window.sessionStorage.getItem("skin");
        if (window.sessionStorage.getItem("skinValue")) {
          $(".skins_box input[value=" + window.sessionStorage.getItem("skinValue") + "]").attr("checked", "checked");
        };
        if ($(".skins_box input[value=自定义]").attr("checked")) {
          $(".skinCustom").css("visibility", "inherit");
          $(".topColor").val(skin.split(',')[0]);
          $(".leftColor").val(skin.split(',')[1]);
          $(".menuColor").val(skin.split(',')[2]);
        };
        form.render();
        $(".skins_box").removeClass("layui-hide");
        $(".skins_box .layui-form-radio").on("click", function () {
          var skinColor;
          if ($(this).find("span").text() == "橙色") {
            skinColor = "orange";
          } else if ($(this).find("span").text() == "蓝色") {
            skinColor = "blue";
          } else if ($(this).find("span").text() == "默认") {
            skinColor = "";
          }
          if ($(this).find("span").text() != "自定义") {
            $(".topColor,.leftColor,.menuColor").val('');
            $("body").removeAttr("class").addClass("main_body " + skinColor + "");
            $(".skinCustom").removeAttr("style");
            $(".layui-bg-black,.hideMenu,.layui-layout-admin .layui-header").removeAttr("style");
          } else {
            $(".skinCustom").css("visibility", "inherit");
          }
        })
        var skinStr, skinColor;
        $(".topColor").blur(function () {
          $(".layui-layout-admin .layui-header").css("background-color", $(this).val());
        })
        $(".leftColor").blur(function () {
          $(".layui-bg-black").css("background-color", $(this).val());
        })
        $(".menuColor").blur(function () {
          $(".hideMenu").css("background-color", $(this).val());
        })
        form.on("submit(changeSkin)", function (data) {
          if (data.field.skin != "自定义") {
            if (data.field.skin == "橙色") {
              skinColor = "orange";
            } else if (data.field.skin == "蓝色") {
              skinColor = "blue";
            } else if (data.field.skin == "默认") {
              skinColor = "";
            }
            window.sessionStorage.setItem("skin", skinColor);
          } else {
            skinStr = $(".topColor").val() + ',' + $(".leftColor").val() + ',' + $(".menuColor").val();
            window.sessionStorage.setItem("skin", skinStr);
            $("body").removeAttr("class").addClass("main_body");
          }
          window.sessionStorage.setItem("skinValue", data.field.skin);
          layer.closeAll("page");
        });
        form.on("submit(noChangeSkin)", function () {
          $("body").removeAttr("class").addClass("main_body " + window.sessionStorage.getItem("skin") + "");
          $(".layui-bg-black,.hideMenu,.layui-layout-admin .layui-header").removeAttr("style");
          skins();
          layer.closeAll("page");
        });
      },
      cancel: function () {
        $("body").removeAttr("class").addClass("main_body " + window.sessionStorage.getItem("skin") + "");
        $(".layui-bg-black,.hideMenu,.layui-layout-admin .layui-header").removeAttr("style");
        skins();
      }
    })
  })
  //退出
  $(".signOut").click(function () {

    var login_page = getIndexAddress();
    if (sessionStorage.loginAddress) {
      login_page = '/' + sessionStorage.loginAddress;
    }
    var strJson = [{ "serviceName": "srvuser_exit" }];
    var path = top.pathConfig.gateway + "/" + top.pathConfig.sso_app + "/operate/srvuser_exit";
    crosAjax(path, "POST", strJson, function (data) {

      localStorage.clear()
      window.location.href = login_page;
    });
  })
  $("#lock").on("click", function () {
    window.location.href = "/chart/#/navs";
  })
  //隐藏左侧导航
  $(".hideMenu").click(function () {
    $(".layui-layout-admin").toggleClass("showMenu");
    $("#menu-hide-icon").toggleClass("fa-outdent fa-indent");
    //渲染顶部窗口
    tab.tabMove();
  })
  //手机设备的简单适配
  var treeMobile = $('.site-tree-mobile'),
    shadeMobile = $('.site-mobile-shade')
  treeMobile.on('click', function () {
    $('body').addClass('site-mobile');
  });
  shadeMobile.on('click', function () {
    $('body').removeClass('site-mobile');
  });
  // 添加新窗口
  $("body").on("click", ".layui-nav .layui-nav-item a", function () {
    //如果不存在子级
    if ($(this).siblings().length == 0) {
      var id = $(this).attr("id");
      if (id == "lock") {
      } else {
        addTab($(this));
        $('body').removeClass('site-mobile');  //移动端点击菜单关闭菜单层
      }
    }
    $(this).parent("li").siblings().removeClass("layui-nav-itemed");
  })
  //刷新后还原打开的窗口
  if (window.sessionStorage.getItem("menu") != null && window.sessionStorage.getItem("menu") != '') {
    if (window.sessionStorage.getItem("menu") != '') {
      if (pre_appclass == app_class || pre_appclass == null || pre_appclass == 'null') {
        is_clean_pre_menu = false
      }
      if (is_clean_pre_menu) {
        menu = [];
      } else {
        let menus = JSON.parse(window.sessionStorage.getItem("menu"));
        for (let i = 0; i < menu.length; i++) {
          if (window.sessionStorage.getItem("current_app") == menu[i].app) {
            menu.push(menu[i])
          }
        }
      }
    } else {
      menu = [];
    }
    /* menu=[];
    window.sessionStorage.setItem("menu",''); */
    curmenu = window.sessionStorage.getItem("curmenu");
    var openTitle = '';
    for (var i = 0; i < menu.length; i++) {
      openTitle = '';
      if (menu[i].icon) {
        if (menu[i].icon.split("-")[0] == 'icon') {
          openTitle += '<i class="iconfont ' + menu[i].icon + '"></i>';
        } else {
          openTitle += '<i class="layui-icon">' + menu[i].icon + '</i>';
        }
      }
      openTitle += '<cite>' + menu[i].title + '</cite></cite><span style="display:none">' + menu[i].href + '</span>';
      openTitle += '<i class="layui-icon layui-unselect layui-tab-close" app="' + menu[i].app + '" data-id="' + menu[i].layId + '">&#x1006;</i>';
      element.tabAdd("bodyTab", {
        title: openTitle,
        content: "<iframe src='" + menu[i].href + "' data-app='" + menu[i].app + "' data-id='" + menu[i].layId + "'></frame>",
        id: menu[i].layId
      })
      //定位到刷新前的窗口
      if (curmenu != "undefined") {
        if (curmenu == '' || curmenu == "null") {  //定位到后台首页
          element.tabChange("bodyTab", '');
        } else if (JSON.parse(curmenu).title == menu[i].title) {  //定位到刷新前的页面
          element.tabChange("bodyTab", menu[i].layId);
        }
      } else {
        element.tabChange("bodyTab", menu[menu.length - 1].layId);
      }
    }
    //渲染顶部窗口
    tab.tabMove();
  }
  //刷新当前
  $(".refresh").on("click", function () {  //此处添加禁止连续点击刷新一是为了降低服务器压力，另外一个就是为了防止超快点击造成chrome本身的一些js文件的报错(不过貌似这个问题还是存在，不过概率小了很多)
    console.log("刷新")
    if ($(this).hasClass("refreshThis")) {
      $(this).removeClass("refreshThis");
      $(".clildFrame .layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload(true);
      setTimeout(function () {
        $(".refresh").addClass("refreshThis");
      }, 2000)
    } else {
      layer.msg("您点击的速度超过了服务器的响应速度，还是等两秒再刷新吧！");
    }
  })
  $(".cutover_menu").on("click", function () {
    if (sessionStorage.getItem("menu_view_model") == 'classic') {
      sessionStorage.setItem("menu_view_model", "");
    } else {
      sessionStorage.setItem("menu_view_model", "classic");
    }
    window.location.reload();
  })
  $(".hot_reload_btn").on('click', function () {
    let apps = window.sessionStorage.getItem('applications')
    // console.log(apps)
    let currentApp = window.sessionStorage.getItem('current_app') || ''
    if (apps && apps.length > 0) {
      apps = JSON.parse(apps)
      console.log(apps)
    }
    let checkAppVal = ''
    let content = `<div class="apps_box">
				<form class="layui-form">
				<div class="layui-form-item">`

    for (let app of apps) {
      let checked = ''
      if (currentApp && app.app_no == currentApp) {
        checked = true  // 选中当前app

        content += `<input type="radio" name="appName" value="${app.app_no}" title="${app.app_name}" checked lay-filter="${app.app_no}">`
      } else {

        content += `<input type="radio" name="appName" value="${app.app_no}" title="${app.app_name}"  lay-filter="${app.app_no}">`
      }

    }
    content += `</div>
				<div class="layui-form-item">
				<a href="javascript:;" class="layui-btn layui-btn-small layui-btn-normal" lay-submit="" lay-filter="changeApp">确定</a>
				<a href="javascript:;" class="layui-btn layui-btn-small layui-btn-normal" lay-submit="" lay-filter="noChangeApp">取消</a>
				</div>
				<form>
				<div>`

    layer.open({
      title: "选择应用",
      area: ["460px", "280px"],
      type: "1",
      resize: false,
      move: false,
      content: content,
      success: function (index, layero) {
        form.render();
        // $(".apps_box .layui-form-radio").on("click", function (e) {
        // 	 console.log($(".apps_box input").attr("checked"),$('.apps_box input[name="appName"]:checked').val())
        // })

        form.on("submit(changeApp)", function (data) {
          console.log($(".apps_box input").attr("checked"), $('.apps_box input[name="appName"]:checked').val())
          console.log('点击了确认')
          var path = `${top.pathConfig.gateway}/${$('.apps_box input[name="appName"]:checked').val()}/operate/srvsys_hot_reload_data`;
          var requestDatas = [];
          var requestData = {};
          requestData.serviceName = "srvsys_hot_reload_data";
          requestDatas[0] = requestData;
          window.top.bxLoading({ mask: true });
          top.crosAjax(path, "POST", requestDatas, function (data) {
            window.top.bxLoading({ mask: false });
            layer.closeAll("page");
            if (data.state == "SUCCESS") {
              top.layer.msg("热加载数据同步成功");
            } else {
              top.layer.msg(data.resultMessage);
            }

          }, true);

        });
        form.on("submit(noChangeApp)", function () {

          layer.closeAll("page");
        });
      },
      cancel: function () {
        // $("body").removeAttr("class").addClass("main_body " + window.sessionStorage.getItem("skin") + "");
        // $(".layui-bg-black,.hideMenu,.layui-layout-admin .layui-header").removeAttr("style");
        // skins();
      }
    })
  })
  //刷新当前 热加载
  $(".hot_reload").on("click", function () {
    var path = top.pathConfig.app_path + "/operate/srvsys_hot_reload_data";
    var requestDatas = [];
    var requestData = {};
    requestData.serviceName = "srvsys_hot_reload_data";
    requestDatas[0] = requestData;
    window.top.bxLoading({ mask: true });
    top.crosAjax(path, "POST", requestDatas, function (data) {
      window.top.bxLoading({ mask: false });
      if (data.state == "SUCCESS") {
        top.layer.msg("热加载数据同步成功");
      } else {
        top.layer.msg(data.resultMessage);
      }
    }, true);
  })
  //关闭其他
  $(".closePageOther").on("click", function () {
    if ($("#top_tabs li").length > 2 && $("#top_tabs li.layui-this cite").text() != "后台首页") {
      var menu = JSON.parse(window.sessionStorage.getItem("menu"));
      $("#top_tabs li").each(function () {
        if ($(this).attr("lay-id") != '' && !$(this).hasClass("layui-this")) {
          element.tabDelete("bodyTab", $(this).attr("lay-id")).init();
          //此处将当前窗口重新获取放入session，避免一个个删除来回循环造成的不必要工作量
          for (var i = 0; i < menu.length; i++) {
            if ($("#top_tabs li.layui-this cite").text() == menu[i].title) {
              menu.splice(0, menu.length, menu[i]);
              window.sessionStorage.setItem("menu", JSON.stringify(menu));
            }
          }
        }
      })
    } else if ($("#top_tabs li.layui-this cite").text() == "后台首页" && $("#top_tabs li").length > 1) {
      $("#top_tabs li").each(function () {
        if ($(this).attr("lay-id") != '' && !$(this).hasClass("layui-this")) {
          element.tabDelete("bodyTab", $(this).attr("lay-id")).init();
          window.sessionStorage.removeItem("menu");
          menu = [];
          window.sessionStorage.removeItem("curmenu");
        }
      })
    } else {
      layer.msg("没有可以关闭的窗口了@_@");
    }
    //渲染顶部窗口
    tab.tabMove();
  })
  //关闭全部
  $(".closePageAll").on("click", function () {
    if ($("#top_tabs li").length > 1) {
      $("#top_tabs li").each(function () {
        if ($(this).attr("lay-id") != '') {
          element.tabDelete("bodyTab", $(this).attr("lay-id")).init();
          window.sessionStorage.removeItem("menu");
          menu = [];
          window.sessionStorage.removeItem("curmenu");
        }
      })
    } else {
      layer.msg("没有可以关闭的窗口了@_@");
    }
    //渲染顶部窗口
    tab.tabMove();
  })
  // 点击通知按钮 跳转到通知列表
  $("#showNotice").on("click", function () {
    addTab($(this))
  })
  // 读取storage中存储的消息数量
  let unreadNum = sessionStorage.getItem("unread_num")
  if (unreadNum) {
    changeNoticeNum(unreadNum)
  }
  let wsServer = top.pathConfig.ws_gateway;
  if (wsServer) {
    connectWebSocket(wsServer);
  }
})
//打开新窗口
function addTab(_this) {
  var logincookie = sessionStorage.getItem("bx_auth_ticket");
  if ((logincookie == null || logincookie == undefined || logincookie == 'logincookie') && top.window.showLayer) {
    top.window.showLayer.show("", null);
  } else {
    tab.tabAdd(_this);
  }
}
//切换登录
function switchLogin(user_no) {
  var bxReqs = [];
  var bxReq = {};
  bxReq.serviceName = "srvuser_login_account_switch";
  bxReq.data = [{ "authorized_user": user_no }];
  bxReqs.push(bxReq);

  var path = top.pathConfig.gateway + "/" + top.pathConfig.sso_app + "/operate/srvuser_login_account_switch";
  var callBack = function (data) {
    if (data.state == "SUCCESS") {
      sessionStorage.clear();
      var resp = data.response[0];
      var bx_auth_ticket = resp.response.bx_auth_ticket;
      var current_login_user = resp.response.login_user_info;
      sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
      sessionStorage.setItem("current_login_user", JSON.stringify(current_login_user));
      top.user = current_login_user;

      var indexpage = getMainAddress();
      window.location.href = "/" + indexpage;
    } else {
      alert(data.resultMessage);
    }
  }
  crosAjax(path, "POST", bxReqs, callBack);
}
//切换租户
function switchTenant(tenant_no) {
  var tenantList = top.user.otherTenantInfos;
  var tenant_name = "";
  var application = "";
  var application_name = "";
  for (var item of tenantList) {
    if (item["tenant_no"] == tenant_no) {
      tenant_name = item["tenant_name"];
      application = item["application"];
      application_name = item["application_name"];
      break;
    }
  }

  // 新代码 切换租户时将当前页面在新窗口打开 将租户信息保存到新打开页面的sessionStorage中
  const switchTenantReq = [
    {
      serviceName: "srvuser_app_tenant_swh_login",
      data: [
        {
          tenant_no: tenant_no,
          tenant_name: tenant_name,
          application: application,
          application_name: application_name,
        },
      ],
    },
  ];
  const _target = window.open(location.href);
  _target.sessionStorage.setItem(
    "switchTenantReq",
    JSON.stringify(switchTenantReq)
  );

  // 旧代码 发送更新租户请求后重载页面
  // let bxReq = [{
  // 	"serviceName": "srvuser_app_tenant_swh_login",
  // 	"data": [{
  // 		"tenant_no": tenant_no,
  // 		"tenant_name":tenant_name,
  // 		"application":application,
  // 		"application_name":application_name
  // 	}]
  // }]

  // var callBack = function(data) {
  // 		if (data.state == "SUCCESS") {
  // 			var res = data.response;
  // 			if (res.length > 0) {
  // 					var resList = res[0].response;
  // 					window.sessionStorage.setItem('bx_auth_ticket',resList.bx_auth_ticket)
  // 					window.sessionStorage.setItem('current_login_user',JSON.stringify(resList.login_user_info) )
  // 					top.window.location.reload()

  // 			}
  // 		}
  // }

  // var path = top.pathConfig.gateway + "/sso/operate/srvuser_app_tenant_swh_login";
  // crosAjax(path, "POST", bxReq, callBack);
}
// 改变通知数量显示
function changeNoticeNum(num = '') {
  if (num) {
    $("#notice-badge").addClass("notice-badge");
  } else {
    $("#notice-badge").removeClass("notice-badge");
  }
  $("#notice-badge").text(num)
}
// 通知提示
function showToast(content) {
  let type = 'auto'
  layer.open({
    type: 1
    , offset: type //具体配置参考：https://www.layuiweb.com/doc/modules/layer.html#offset
    , id: 'layerDemo' + type //防止重复弹出
    , content: '<div style="padding: 20px 100px;">' + content + '</div>'
    , btn: '知道了'
    , btnAlign: 'c' //按钮居中
    , shade: 0 //不显示遮罩
    , yes: function () {
      layer.closeAll();
    }
  });
}
function playAudio(src) {
  var audioContainer = $('.audio-container');
  function createAudioElement(src) {
    // 创建 audio 标签来播放选择的音频
    var audioElement = $('<audio src="' + src + '"></audio>');
    $('.audio-container').empty().append(audioElement);
    audioElement[0].play();
    //音频结束停止播放
    audioElement[0].addEventListener('ended',
      function () {
        stopAudio();
      });
  }
  // 音频视图全部设为静态
  function stopAudio() {
    // 清掉 audio 标签
    var audioElement = audioContainer.children('audio');
    if (audioElement.length !== 0) {
      audioElement[0].pause();
      audioContainer.empty();
    }
  }
  createAudioElement(src)
}
// 连接websocket
function connectWebSocket(wsServer) {
  //1.创建websocket客户端
  var limitConnect = 3;  // 断线重连次数
  var timeConnect = 0;
  webSocketInit(wsServer);
  //socket初始化
  function webSocketInit(service) {
    var ws = new WebSocket(service);
    ws.onopen = function () {
      console.log("已连接TCP服务器");
      ws.send(`{"srv":"ws_login","value":"${sessionStorage.getItem('bx_auth_ticket')}"}`);
    };
    ws.onmessage = function (event) {
      console.log('Message from server: ', event.data);
      try {
        var data = JSON.parse(event.data);
        console.log('socket-message:', data);
        if (data.code === "SUCCESS") {
          if (data.data) {
            if (data.data.content) {
              // 显示消息弹框
              var content = data.data.content;
              showToast(content);
            }
            if (data.data.unread_num) {
              // 消息数量存储到storage中
              sessionStorage.setItem('unread_num', data.data.unread_num)
              // 更改消息数量
              changeNoticeNum(data.data.unread_num)
            }
            if (data.data.more_config && data.data.more_config.broadcast) {
              // 播放消息语音
              playAudio(data.data.more_config.broadcast)
            }
          }
        }
      } catch (error) {
        console.log('socket-error:', error)
      }
    };
    ws.onclose = function () {
      console.log('socket服务器已经断开');
      reconnect(service);
    };
    // 重连
    function reconnect(service) {
      if (limitConnect > 0) {
        limitConnect--;
        timeConnect++;
        console.log("socket:第" + timeConnect + "次重连");
        // 进行重连
        setTimeout(function () {
          webSocketInit(service);
        }, 2000);
      } else {
        console.log("TCP连接已超时");
      }
    }
  }
}
