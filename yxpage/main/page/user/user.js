var $form;
var form;
var $;



function getParam(name) {
  return location.href.match(new RegExp('[?#&]' + name + '=([^?#&]+)', 'i')) ? RegExp.$1 : '';
}

// window.onload = function () {
//   if (getParam('type') === 'pwd_expire') {
//     // 密码过期
//     document.querySelector('.childrenBody').style.display = 'flex'
//     document.querySelector('.childrenBody').style.height = '80vh'
//     document.querySelector('.childrenBody').style.justifyContent = 'center'
//     document.querySelector('.childrenBody').style.alignItems = 'center'
//     var formItem = document.createElement('div')
//     formItem.classList.add('layui-form-item')
//     formItem.id = 'account-form-item'
//     formItem.innerHTML = ` <label class="layui-form-label">账号</label>
// 		<div class="layui-input-block">
// 			<input type="text" value="" placeholder="请输入账号" lay-verify="required" id="userNo"  class="layui-input account">
// 		</div>`
//     var parent = document.querySelector('.layui-form.changePwd')
//     parent.insertBefore(formItem, parent.children[0])
//     if (getParam('user_no')) {
//       document.querySelector('#userNo').value = getParam('user_no');
//     }
//   }
// }



layui.config({
  base: "../../js/"
}).use(['form', 'layer', 'upload', 'laydate'], function () {


  form = layui.form();
  var layer = parent.layer === undefined ? layui.layer : parent.layer;
  $ = layui.jquery;
  $form = $('form');





  //添加验证规则
  form.verify({
    newPwd: function (value, item) {
      var par = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\x21-\x7e]]{8,}$/;
      par = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\x21-\x7e]{8,16}$/;
      par = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]{8,}$/;
      if (!par.test(value)) {
        // return "密码必须包含字母+数字长度限制在8-16位";
        return "密码必须包含大小写字母+数字+特殊字符至少8位";
      }

    },
    confirmPwd: function (value, item) {
      var newpwd = $("#newPwd").val();

      if (newpwd != value) {
        return "两次输入密码不一致，请重新输入！";
      } else {

        var path = top.pathConfig.gateway + "/" + top.pathConfig.sso_app + "/operate/srvsso_user_pwd_reset";

        var pwd = $("#oldPwd").val();
        var newpwd = $("#newPwd").val();

        var bxReqs = [{ "serviceName": "srvsso_user_pwd_reset", "data": [{ "pwd": pwd, "newpwd": newpwd }] }];

        // 密码过期后跳到修改密码页面
        if (getParam('type') === 'pwd_expire') {
          var user_no = $("#userNo").val();
          path = top.pathConfig.gateway + "/" + top.pathConfig.sso_app + "/operate/srvsso_anon_user_pwd_reset";
          bxReqs = [{ "serviceName": "srvsso_anon_user_pwd_reset", "data": [{ "pwd": pwd, "newpwd": newpwd, 'user_no': user_no }] }];
        }


        crosAjax(path, "POST", bxReqs, function (backdata) {
          console.log(backdata)

          if (getParam('type') === 'pwd_expire' && backdata.state === 'SUCCESS') {
            // 密码过期 修改密码
            layer.open({
              type: 1,
              title: backdata.resultMessage,
              area: ['300px', '200px'],
              shadeClose: true,
              content: '<div style="padding: 20px;">是否跳转到登录页</div>',
              btn: ['确定', '取消'],
              yes: function (index, layero) {
                layer.close(index);
                top.window.location.href = `/main/login.html`;
              }
            })
          } else {
            layer.msg(backdata.resultMessage, { time: 5000, icon: 6 });
          }
          $("#userNo").val("");
          $("#oldPwd").val("");
          $("#newPwd").val("");
          $("#confirmPwd").val("");
        });

      }
    }
  })







})

function resetcontent() {

  $("#oldPwd").val("");
  $("#newPwd").val("");
  $("#confirmPwd").val("");


}
