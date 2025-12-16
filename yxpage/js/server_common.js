const pagePrefix = 'yx';
//跨域ajax
function crosAjax(url, method, jsonData, succFun, asyncFlag) {

  var bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
  //如果为退出接口则清理回话数据
  if (url.endsWith("/srvuser_exit")) {
    sessionStorage.clear();
  }

  $.ajax({
    headers: {
      "bx_auth_ticket": bx_auth_ticket,
      "bx-auth-ticket": bx_auth_ticket,
    },
    url: url,
    type: method,
    dataType: "json",
    async: asyncFlag == false ? asyncFlag : true,
    contentType: "application/json;charset=utf-8",
    data: JSON.stringify(jsonData),
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,
    success: function (data, status, request) {
      if (data.state == "FAILURE" && data.resultCode == "0011") {

        if (url.endsWith("/srvauth_user_app_menu_select") || url.endsWith('/srvuser_app_tenant_swh_login')) {
          //登录后需要主页刷新
          sessionStorage.setItem("need_main_refresh", true);
        }
        //是否在主页面内超时登录 已弹框的方式打开 否则已跳转的方式打开
        let timeOut = sessionStorage.getItem("timeout_login")
        if (timeOut === '1') {
          let layer = window.layer || top.layer

          if (layer) {

            var login_page = window.location.origin + "/" + getLoginAddress();
            layer.open({
              title: false,
              type: 2,
              content: login_page,
              closeBtn: 0,
              area: ['300px', '350px'],
              shade: 0.9
            });
          }
        } else {

          var login_page = window.location.origin + "/" + getIndexAddress();

          sessionStorage.setItem("timeout_login", "1")
          layer.alert('您长时间未操作,登录信息已过期', {
            skin: 'layui-layer-molv' //样式类名
            , closeBtn: 0
          }, function () {
            window.location.href = login_page;
          });
        }
      } else {
        if (succFun != null) {
          succFun(data);
        }
      }
    },
    error: function (data) {
      console.log("error", data);
      //信息框-例2
      if (data.hasOwnProperty('status') && data.status === 429) {
        //layer.msg('当前使用人数过多，请稍后再试', {icon: 12});
        window.top.limitingTips()
      }
      console.log("请求失败:请检查后台服务器地址是否正确。", data);
    }
  });

}


//加载页面属性信息
(function () {
  //忘记密码
  // var obj = $("#forget_pwd_id");
  // if (obj) obj.hide();

  var path = top.pathConfig.gateway + "/config/select/srvconfig_page_attribute_select";
  var bxReq = { "serviceName": "srvconfig_page_attribute_select", "colNames": ["*"], "condition": [] };
  // //指定应用
  // var assignApp = sessionStorage.getItem("assignApp");
  // if (assignApp) {
  // 	bxReq.condition.push({ "colName": "application", "ruleType": "eq", "value": assignApp });
  // }
  // //指定端口
  // var assignPort = sessionStorage.getItem("assignPort");
  // if (assignPort) {
  // 	bxReq.condition.push({ "colName": "port", "ruleType": "eq", "value": assignPort + "端" });
  // }
  crosAjax(path, "POST", bxReq, function (backdata) {
    var datas = backdata.data;
    var page_attr = {};
    window.sessionStorage.setItem("childPagination", true);  // 默认子表显示分页
    for (var item of datas) {
      let attr_value;
      page_attr[item.attr_key] = item.attr_value;
      switch (item.attr_key) {
        case 'login_page_forget_pwd':
          attr_value = item.attr_value;
          if ("是" == attr_value) $("#forget_pwd_id").show();
          break;
        case 'scan_code_login':
          attr_value = item.attr_value;
          if ("否" == attr_value) $("#scan_code_login_id").hide();
          break;
        case 'copyright':
          $("#copyright>.text").text(item.attr_value);
          break;
        case 'record_no':
          $("#record_no").show();
          $("#record_no").text(item.attr_value);
          break;
        case 'title':
          if (sessionStorage.current_tenant_name) {
            document.title = sessionStorage.current_tenant_name
          } else {
            document.title = item.attr_value;
          }
          break;
        case 'statement':
          $("#statement_info").show();
          $("#statement_info").text(item.attr_value);
          break;
        case 'login_bgimg':
          var bgimgurl = "url(" + item.attr_value + ") no-repeat left bottom/cover";
          $(".video_mask").css('background', bgimgurl);
          break;
        default:
          text = "-";
      }
    }
    window.sessionStorage.setItem("pages_attribute", JSON.stringify(page_attr));
    var timeout_login = '1' // 默认需要
    window.sessionStorage.setItem("timeout_login", timeout_login)
  })
})();
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r != null) return unescape(r[2]); return null; //返回参数值
}
function getParam(name) {
  return location.href.match(new RegExp('[?#&]' + name + '=([^?#&]+)', 'i')) ? RegExp.$1 : '';
}
//重新登录
function reLogin(selectApp) {


  var port_page = getIndexAddress(selectApp);

  top.window.location.href = window.location.origin + "/" + port_page;
}


function getLoginAddress() {


  // var app = sessionStorage.getItem("assignApp");
  // //指定端口
  // var port = sessionStorage.getItem("assignPort");
  //指定租户
  var tenant = sessionStorage.getItem("assignTenant");
  //指定登录用户票据
  var bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");


  var address = pagePrefix + "/main/login.html";
  // if (app) {
  // 	address = address + "?app=" + app;
  // 	if (tenant) {
  // 		address = address + "&tenant=" + tenant;
  // 	}
  // 	if (port) {
  // 		address = address + "&port=" + port;
  // 	}
  // 	if (bx_auth_ticket) {
  // 		address = address + "&bx_auth_ticket=" + bx_auth_ticket;
  // 	}
  // }
  if (sessionStorage.getItem("loginAddress")) {
    address = sessionStorage.getItem("loginAddress")
  }
  return address;

}


function getMainAddress() {

  var address = pagePrefix + "/main/index.html";

  var app = sessionStorage.getItem("assignApp");
  //指定端口
  var port = sessionStorage.getItem("assignPort");
  //指定租户
  var tenant = sessionStorage.getItem("assignTenant");
  //指定登录用户票据
  var bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");

  // if (app) {
  // 	address = address + "?app=" + app;
  // 	if (tenant) {
  // 		address = address + "&tenant=" + tenant;
  // 	}
  // 	if (port) {
  // 		address = address + "&port=" + port;
  // 	}
  // }
  return address;

}


function getIndexAddress(selectApp) {

  var address = pagePrefix + "/index.html";

  var app = sessionStorage.getItem("assignApp");
  if (selectApp) {
    app = selectApp;
  }
  //指定端口
  // var port = sessionStorage.getItem("assignPort");
  //指定租户
  var tenant = sessionStorage.getItem("assignTenant");
  //指定登录用户票据
  var bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");

  if (app) {
    address = address + "?app=" + app;
    if (tenant) {
      address = address + "&tenant=" + tenant;
    }
    if (port) {
      address = address + "&port=" + port;
    }
  }
  return address;

}

function initUrlParams(app, tentant, port, bx_auth_ticket) {

  // //指定应用
  // var assignApp = getUrlParam("app");
  // if (assignApp) {
  // 	sessionStorage.setItem("assignApp", assignApp);
  // } else {
  // 	sessionStorage.removeItem("assignApp")
  // }
  // //指定端口
  // var port = getUrlParam("port");
  // if (port) {
  // 	sessionStorage.setItem("assignPort", port);
  // } else {
  // 	sessionStorage.removeItem("assignPort")
  // }
  //指定租户
  var tenant = getUrlParam("tenant");
  if (tenant) {
    sessionStorage.setItem("assignTenant", tenant);
  } else {
    sessionStorage.removeItem("assignTenant")
  }

  var bx_auth_ticket = getUrlParam("bx_auth_ticket");
  if (bx_auth_ticket) {
    sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
  }

  var account = getUrlParam("account");
  if (account) {
    sessionStorage.setItem("account", account);
  }

}
