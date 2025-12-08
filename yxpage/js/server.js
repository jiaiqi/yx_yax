//微服务地址
var pathConfig;
(function () {
  var obj = {};
  // 生产环境
  obj.gateway_protocol = 'http'; //协议
  obj.gateway_ip = "yxsj.sneducloud.com"; //ip
  obj.port = ""; //端口号
  obj.suffix = "/yxapi"; //后缀 拼在协议://ip:端口之后

  // dev环境
  // obj.gateway_protocol='http'; //协议
  // obj.gateway_ip="192.168.0.196"; //ip
  // obj.port = ""; //端口号
  // obj.suffix = "/yxapi"; //后缀 拼在协议://ip:端口之后

  //网关地址
  obj.gateway =
    obj.gateway_protocol + "://" + obj.gateway_ip + ":" + obj.port + obj.suffix + "";
  // obj.ws_protocol = "ws";
  // obj.ws_ip = "192.168.0.157";
  // obj.ws_port = "55555";
  // obj.ws_gateway = obj.ws_protocol + "://" + obj.ws_ip + ":" + obj.ws_port + "";
  obj.sso_app = "sso";
  var current_app = sessionStorage.getItem("current_app");
  if (current_app == null) {
    obj.application = "sso";
  } else {
    obj.application = current_app;
  }
  obj.app_path = obj.gateway + "/" + obj.application;
  top.window.pathConfig = obj;
  console.log("pathConfig", obj);
  sessionStorage.setItem("pathConfig", JSON.stringify(obj)); // 改进多层嵌套前端浏览器统一保存

  var siteName = '站点1'
  sessionStorage.setItem("siteName", siteName);


  let loginUser = sessionStorage.getItem("current_login_user");
  if (loginUser) {
    top.user = JSON.parse(loginUser);
  }
  let flag = true;
  let nav = navigator.userAgent;
  if (nav.indexOf("Firefox") !== -1) {
    fiag = true;
  } else {
    fiag = false;
  }
  window.onunload = function () {
    if (flag) {
      console.log("关闭操作");
    } else {
      console.log("刷新操作1");
      let menu = [];
      window.sessionStorage.setItem("menu", JSON.stringify(menu));
    }
  };
  window.onbeforeunload = function () {
    if (!flag) {
      console.log("关闭操作");
    } else {
      console.log("刷新操作2");
      let menu = [];
      window.sessionStorage.setItem("menu", JSON.stringify(menu));
    }
  };
})();
