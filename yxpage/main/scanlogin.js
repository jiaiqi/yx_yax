$(function () {


	//接受扫码回调参数
	var code = getUrlParam("code");
	var state = getUrlParam("state");
	if (code != null && state != null) {
		scanAuth(code, state);
	} else {
		loadScanLogin();
	}


	//用户扫码授权处理
	function scanAuth(code, state) {
		//扫码登录 页面回调

		var data = {};
		data["code"] = code;
		data["state"] = state;
		// if (sessionStorage.getItem("assignApp")) {
		// 	data["applicaiton"] = sessionStorage.getItem("assignApp");
		// }
		// if (sessionStorage.getItem("assignPort")) {
		// 	data["port"] = sessionStorage.getItem("assignPort");
		// }
		//指定租户
		var tenant = sessionStorage.getItem("assignTenant");
		if (tenant) {
			data["tenant"] = tenant;
		}
		var request = {};
		request.serviceName = "srvwx_web_scan_auth";
		request.data = [];
		request.data.push(data);
		var bxRequest = [];
		bxRequest.push(request);
		crosAjax(top.pathConfig.gateway + "/wx/operate/srvwx_web_scan_auth", "POST", bxRequest,
			function (data) {
				if (data.state == "SUCCESS") {
					var resp = data.response[0];
					if('BIND' === resp.code){
						const {unionid,openid} = resp.response||{}
						if(unionid&&openid){
							sessionStorage.setItem('BIND_UNIONID',unionid)
							sessionStorage.setItem('BIND_OPENID',openid)
							document.querySelectorAll('.right-box').forEach(item=>{
								if(item.className.indexOf('bind-right-box')>-1){
									item.style.display = 'block'
								}else{
									item.style.display = 'none'
								}
							})
						}
					}else if ("CHOOSE" == resp.code) {
						alert("扫码授权暂必须明确指定应用,请重新扫码登录");
						var data = resp.response.data;
						reLogin(data[0].applicaiton);
					} else {
						var bx_auth_ticket = resp.response.bx_auth_ticket;
						var current_login_user = resp.response.login_user_info;
						sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
						sessionStorage.setItem("current_login_user", JSON.stringify(current_login_user));
						top.user = current_login_user;
						var indexpage=getMainAddress();
						window.location.href = "/"+indexpage;
					}
				} else {
					alert(data.resultMessage);
				}
			}
		);
	}
	//加载登录二维码信息
	function loadScanLogin() {
		//扫码回调页面(扫码的时候已限制指定应用)
		var callpageaddres=getLoginAddress();
		
		var callbackurl = window.location.origin + "/"+callpageaddres;
		//加载扫码登录配置显示二维码
		var request = {};
		request.serviceName = "srvwx_web_scan_cfg_select";
		request.colNames = ["*"];
		request.condition = [{ "colName": "callbackurl", "value": callbackurl }];
		crosAjax(top.pathConfig.gateway + "/wx/select/srvwx_web_scan_cfg_select", "POST", request,
			function (rsp) {
				var data = rsp.data[0];
				if(data.bx_auth_ticket){
					sessionStorage.setItem("bx_auth_ticket", data.bx_auth_ticket)
				}
				var obj = new WxLogin({
					self_redirect: false,
					id: "login_container",
					appid: data.appid,
					scope: "snsapi_login",
					redirect_uri: data.callbackurl,
					state: data.state,
					style: "black",
					href: window.location.origin + "/main/css/loginqrcode.css"
				});
			});
	}
	
})
