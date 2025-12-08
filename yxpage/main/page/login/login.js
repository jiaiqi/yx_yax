$(function() {

    $("#loginbtn").on('click', function() {
        loginProc();
       
    });

    //加载主页页面的数据
    function loadMainData(){
        var path = top.pathConfig.loginServer + "bxsys/select";
        var strJson = {
            "serviceName": "srvsys_view_cfg_select",
            "colNames": ["*"]
        };
		
		var sys_module=localStorage.getItem("sys_module");
		
		
		if(sys_module==''||sys_module==null||sys_module==undefined){
			
			strJson.condition=[{ "colName": "module", "value": "sys", "ruleType": "eq"}]
		}else{
			
			var cMap = { "colName": "module", "ruleType": "eq"}
			cMap.value=sys_module;
			strJson.condition=[cMap]
			
		}
		
        var callBack = function(res) {
            if(res.state == 'FAILURE'){
                console.log(res);
            }else{
                $("#main_login_title").html(res.data[0].main_login_title);
            }
        }
        crosAjax(path, "POST", strJson, callBack);
    }
	 loadMainData();

    function loginProc() {

	
	
	
	    var lockuser = $.cookie("lockUser");
	
	
        var user_no = $("#user_no").val();
        var pwd = $("#pwd").val();
	
		if(lockuser!=user_no&&lockuser!="undefined"&&!lockuser&&lockuser!='null'&&lockuser!=null){
			
			   parent.layer.open({
                    content: "账号错误"
                });
				return;
		}


        var strJson = {};
        strJson.user_no = user_no;
        strJson.pwd = pwd;

        var path = top.window.pathConfig.loginssoPage + '/bxsyslogin'


        var callBack = function(data) {
            if (data.state == retStatus.sucess) {
				
				var myframe=$('#checkcookie');
				myframe.attr('src',top.window.pathConfig.loginServer+"setssldomiancookie?BXSSOCOOKIEID="+data.bxssocookieid)
				myframe.load(function(){
					  parent.layer.closeAll();
					  top.setLoginUserInfo();
					  parent.location.reload();
				});
              
            } else {

                parent.layer.open({
                    content: data.resultMessage
                });
            }
        }
        crosAjax(path, "POST", strJson, callBack);

    }


})
