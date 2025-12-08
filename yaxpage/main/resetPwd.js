$(function() {
	
	
	layui.use('form', function(){
		 
	});
	
	$("#resetPwd").on('click', function() {
		resetPwd();
	});
	
	function resetPwd() {

	

	
		var pwd=$("#pwd").val();
		var confirmPwd=$("#confirmPwd").val();
		if(pwd==""){
			layer.msg("密码不能为空");
			return;
		}
		if(pwd!=confirmPwd){
			layer.msg("两次输入密码不一致，请重新输入！");
			return;
		}

		
		
		var strJson = {};
		strJson['pwd'] = pwd;
		
		var path =  top.pathConfig.loginssoPage + "/directmodifyPwd";
		crosAjax(path, "POST", strJson, function(data){
			if(data.state=="SUCCESS"){
				layer.msg(data.resultMessage);
				reLogin();
			
			}else{
				layer.msg(data.resultMessage);
			}
			
		});
	}
	
	
	
})