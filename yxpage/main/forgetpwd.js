$(function() {

	//Demo
	layui.use('form', function(){
	 
	});
	
	
	var countdown=60;   //倒计时长
	function settime() { 
		if (countdown == 0) { 
			$("#send").removeClass("layui-btn-disabled");    
			$("#send").text("发送验证码"); 
			countdown = 60; 
			return;
		} else { 
			$("#send").addClass("layui-btn-disabled"); 
			var textOld = "重新发送(" + countdown + ")";
			$("#send").text(textOld);
			countdown--; 
		} 
		setTimeout(function() { 
			settime()}
			,1000) 
	};
	$("#send").on('click', function() {
		
		
	      sendcode();
		
	});

	
	
	
	
	
	function sendcode() {

		var mobile_phone = $("#mobile_phone").val();

		if(mobile_phone==""){
			
			layer.msg("手机号码不能为空");
			return false;
		}
		
	    if(!(/^1(3|4|5|7|8)\d{9}$/.test(mobile_phone))){ 
	        layer.msg("手机号码有误，请重填");
	        return false; 
	    }
		
		var strJson = {};
		strJson.phone = mobile_phone;
		
		
		var result = false;
		
		var path = top.pathConfig.loginssoPage +"/sendCode";
		crosAjax(path, "POST", strJson, function(data){
			if(data.state=="SUCCESS"){
				result=true;
				settime();
			}
			layer.msg(data.resultMessage);
			
		},true);
		
		return result;

	}
	
	$("#validateCode").on('click', function() {
		validateCode();
	});
	
	
	function validateCode() {

		var code = $("#code").val();

		if(code==""){
			layer.msg("验证码不能为空");
			return;
		}
	    
		var strJson = {};
		strJson.code = code;
		
		var path = top.pathConfig.loginssoPage + "/validateCode";
		crosAjax(path, "POST", strJson, function(data){
			if(data.state=="SUCCESS"){
			

				window.location.href="resetPwd.html"
			}else{
				layer.msg(data.resultMessage);
			}
			
		});

	}
	
	
})