$(function () {
  const aseKey = "0123456789abcdef"; //十六位十六进制数作为密钥
  const iv = "abcdef0123456789"; //十六位十六进制数作为密钥偏移量
  let key = CryptoJS.enc.Utf8.parse(aseKey);
  let ivs = CryptoJS.enc.Utf8.parse(iv);

  function encrypt(word) {
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: ivs,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString().toUpperCase();
  }

  function decrypt(word) {
    if (word) {
      const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
      const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
      const decrypt = CryptoJS.AES.decrypt(srcs, key, {
        iv: ivs,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
      return decryptedStr.toString();
    } else {
      return "";
    }
  }

  let loginEncry = false

  $(document).keydown(function (event) {
    if (event.keyCode == 13) {
      loginProc();
    }
  });
  if ($.cookie("rmbUser") == "true") {
    $("#ck_rmbUser").prop("checked", true);
    $("#user_no").val($.cookie("user_no"));
    let mi = decrypt($.cookie("pwd"));
    $("#pwd").val(mi);
    if (mi && $.cookie("user_no")) {
      // 有账号密码，启用登录按钮
      document.querySelector("#loginbtn").classList.remove("disabled");
    }
  }
  if (
    document.querySelector("#user_no").value &&
    document.querySelector("#pwd").value
  ) {
    if (document.querySelector("#loginbtn").classList.contains("disabled")) {
      // 已经自动填充了账号密码
      document.querySelector("#loginbtn").classList.remove("disabled");
    }
  } else {
    // document.querySelector("#loginbtn").classList.add("disabled");
  }

  $("#loginbtn").on("click", function () {
    loginProc();
  });
  $("#regBtn").on('click', function () {
      window.location.href = '/vpages/#/register'
  });

  // 切换到租户登录
  function goTenant(current_login_user) {
    if (sessionStorage.getItem("current_tenant_no")) {
      let req = null;
      if (sessionStorage.getItem("current_tenant_app")) {
        // req = {
        //   tenant_no: sessionStorage.getItem("current_tenant_no"),
        //   application: sessionStorage.getItem("current_tenant_app"),
        // };
      }
      if (!req && sessionStorage.getItem("current_login_user")) {
        try {
          const login_user = JSON.parse(
            sessionStorage.getItem("current_login_user")
          );
          if (login_user?.tenant && login_user?.application) {
            req = {
              tenant_no: login_user.tenant,
              tenant_name: login_user.tenant_name,
              application: login_user.application,
            };
          }
        } catch (error) {
          console.warn("解析租户信息错误:", error);
        }
      }
      if (!req && top.user?.tenant && top.user?.application) {
        req = {
          tenant_no: top.user.tenant,
          tenant_name: top.user.tenant_name,
          application: top.user.application,
        };
      }
      if (!req && current_login_user?.otherTenantInfos?.length) {
        req = current_login_user?.otherTenantInfos?.find(
          (item) =>
            item.tenant_no === sessionStorage.getItem("current_tenant_no")
        );
      }
      if (!req && top.user?.otherTenantInfos?.length) {
        req = top.user?.otherTenantInfos?.find(
          (item) =>
            item.tenant_no === sessionStorage.getItem("current_tenant_no")
        );
      }

      if (req) {
        console.log("tenantInfo::::", req);
        let bxReq = [
          {
            serviceName: "srvuser_app_tenant_swh_login",
            data: [
              {
                tenant_no: req.tenant_no,
                tenant_name: req.tenant_name,
                application: req.application,
                application_name: req.application_name,
              },
            ],
          },
        ];
        window.sessionStorage.setItem("current_app", req.application);
        // 切换租户后保存当前租户编号
        // sessionStorage.setItem("current_tenant_no", req.tenant_no);
        // sessionStorage.setItem("current_tenant_app", req.application);
        // localStorage.setItem("current_tenant_no", req.tenant_no);
        // localStorage.setItem("current_tenant_app", req.application);
        // localStorage.setItem("current_tenant_name", req.tenant_name);
        var resList = [];
        var path =
          top.pathConfig.gateway + "/sso/operate/srvuser_app_tenant_swh_login";
        var callBack = function (data) {
          if (data.state == "SUCCESS") {
            var res = data.response;
            if (res.length > 0) {
              resList = res[0].response;
              sessionStorage.setItem("bx_auth_ticket", resList.bx_auth_ticket);
              sessionStorage.setItem(
                "current_login_user",
                JSON.stringify(resList.login_user_info)
              );
              console.log(resList);
              // top.window.location.reload();
            } else {
            }
            if (top.layer) {
              top.layer.closeAll();
            }
            if (layer) {
              layer.closeAll();
            }
          } else {
            window.top.layer.alert(data.resultMessage, {
              skin: "layui-layer-molv", //样式类名
              closeBtn: 0,
            });
            //FAILURE
          }
        };

        crosAjax(path, "POST", bxReq, callBack);
      } else {
        console.errer("切换租户信息错误");
      }
    }
  }
  async function fetchApplications() {
    //查询完整应用列表
    const backdata = await new Promise((resolve) => {
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
        resolve(backdata)
        // if (backdata.data != undefined && Array.isArray(backdata.data) && backdata.data.length > 0) {
        //     window.sessionStorage.setItem('applications', JSON.stringify(backdata.data) ) // 保存应用
        // }
      })
    })
    if (backdata && Array.isArray(backdata.data) && backdata.data.length > 0) {
      window.sessionStorage.setItem('applications', JSON.stringify(backdata.data)) // 保存应用
      return backdata.data
    }
  }
  function mixStringsAlternately(str1, str2) {
    let result = '';
    result += str1.length + ',' + str2.length + ',';
    let i = 0;
    while (i < str1.length || i < str2.length) {
      if (i < str1.length) {
        result += str1.charAt(i);
      }
      if (i < str2.length) {
        result += str2.charAt(i);
      }
      i++;
    }
    return btoa(result);
  }

  function getParam(name) {
    return location.href.match(new RegExp('[?#&]' + name + '=([^?#&]+)', 'i')) ? RegExp.$1 : '';
  }

  function getUrlParams(url) {
    // 创建一个对象来存储参数
    let params = {};

    // 使用 URL 构造函数解析传入的 url
    let urlObj = new URL(url);

    // 使用 URLSearchParams 来处理查询参数
    let searchParams = new URLSearchParams(urlObj.search);

    // 遍历所有的参数并添加到 params 对象中
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }
  function auth2Login() {
    var user_no = $("#user_no").val();
    var pwd = $("#pwd").val();
    const bxReq = {
      "user_no": user_no,
      "pwd": pwd,
    }
    if (loginEncry) {
      bxReq.enc = '是'
      bxReq.pwd = mixStringsAlternately(user_no, pwd)
    }
    const urlParams = getUrlParams(top.location.href)
    if (typeof urlParams === 'object' && Object.keys(urlParams).length > 0) {
      // 将url参数添加到bxReq中
      Object.keys(urlParams).forEach(key => {
        bxReq[key] = urlParams[key];
      });
    }
    const url = `${top.pathConfig.gateway}/sso/oauth2/login`
    async function callBack(data) {
      if (data.redirect_uri) {
        var resp = data
        var bx_auth_ticket = resp.response.bx_auth_ticket;
        var current_login_user = resp.response.login_user_info;
        saveLoginUser();
        sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
        sessionStorage.setItem("logined", true);
        sessionStorage.setItem(
          "current_login_user",
          JSON.stringify(current_login_user)
        );
        top.user = current_login_user;
        if (top.user.tenant_name) {
          top.document.title = top.user.tenant_name;
        }
        await fetchApplications()
        if (resp.redirect_uri) {
          // 登录后跳转到重定向地址
          window.location.href = resp.redirect_uri;
        }
      }
    }
    crosAjax(url, "POST", bxReq, callBack);
  }
  async function loginProc(application) {
    const oldLoginUserNo = top.document?.cookie
      ?.split(";")
      ?.find((item) => item?.includes("login_user_name"))
      ?.split("=")?.[1];
    var user_no = $("#user_no").val();
    var pwd = $("#pwd").val();
    var bxReqs = [];
    var bxReq = {};
    bxReq.serviceName = "srvuser_login";
    bxReq.data = [{ user_no: user_no, pwd: pwd }];
    if (loginEncry) {
      // 需要加密
      bxReq.data = [{ user_no: user_no, pwd: mixStringsAlternately(user_no, pwd), enc: '是' }];
    }
    // bxReq.data = [{ user_no: user_no, pwd: encrypt(pwd)}];
    // 租户编号
    const urlObj = new URL(top.location.href)
    if (urlObj.searchParams.get('redirect_uri') && urlObj.searchParams.get('appid')) {
      // bxReq.data[0]["redirect_uri"] = urlObj.searchParams.get('redirect_uri');
      return auth2Login()
    }
    if (urlObj.searchParams.get('an') && urlObj.searchParams.get('tn')) {
      bxReq.data[0]["tenant"] = urlObj.searchParams.get('tn');
      bxReq.data[0]["application"] = urlObj.searchParams.get('an');
      var obj = {
        tenant: urlObj.searchParams.get('tn'),
        application: urlObj.searchParams.get('an'),
        tenant_name: urlObj.searchParams.get('tname'),
      }
      sessionStorage.setItem("_tenant_info", JSON.stringify(obj));
      top._tenant_info = obj;
    } else if (top._tenant_info && top._tenant_info.tenant && top._tenant_info.application) {
      bxReq.data[0]["tenant"] = top._tenant_info.tenant;
      bxReq.data[0]["application"] = top._tenant_info.application;
    } else if (sessionStorage.getItem("_tenant_info")) {
      try {
        const tenantInfo = JSON.parse(sessionStorage.getItem("_tenant_info"))
        if (tenantInfo?.tenant && tenantInfo?.application) {
          bxReq.data[0]["tenant"] = tenantInfo?.tenant;
          bxReq.data[0]["application"] = tenantInfo?.application;
        }
      } catch (error) {
        console.error(error);
      }
    }
    // if (urlObj.searchParams.get('ti')) {
    //   try {
    //     const tenantInfo = JSON.parse(decodeURIComponent(urlObj.searchParams.get('ti')))
    //     if (tenantInfo?.tenant_no && tenantInfo?.application) {
    //       bxReq.data[0]["tenant"] = tenantInfo?.tenant_no;
    //       bxReq.data[0]["application"] = tenantInfo?.application;
    //     }
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
    // const tenantNo =
    //   sessionStorage.getItem("current_tenant_no") ||
    //   localStorage.getItem("current_tenant_no") ||
    //   top.user?.tenant;
    // // 应用编号
    // const appNo =
    //   sessionStorage.getItem("current_tenant_app") ||
    //   localStorage.getItem("current_tenant_app") ||
    //   top.user?.application;
    // if (tenantNo && appNo) {
    //   // 超时重新登录 增加租户参数
    //   if (oldLoginUserNo && oldLoginUserNo === user_no) {
    //     // cookie中保存的登录用户账号跟当前登录的账号匹配，则增加租户参数
    //     bxReq.data[0]["tenant"] = tenantNo;
    //     bxReq.data[0]["application"] = appNo;
    //   }
    // }
    // //指定应用
    // var assignApp = sessionStorage.getItem("assignApp");
    // if (assignApp) {
    //   bxReq.data[0]["application"] = assignApp;
    // }
    // //指定端口
    // var port = sessionStorage.getItem("assignPort");
    // if (port) {
    //   bxReq.data[0]["port"] = port;
    // }
    // 指定租户
    // var tenant = sessionStorage.getItem("assignTenant");
    // if (tenant) {
    //   bxReq.data[0]["tenant"] = tenant;
    // }
    let url = top.window.location.pathname;
    console.log("登录页面", url, getLoginAddress());
    // 已登录的用户信息
    // var current_login_user = sessionStorage.getItem("current_login_user");
    // if (
    //   current_login_user &&
    //   current_login_user !== "undefined" &&
    //   url.indexOf(getLoginAddress()) == -1
    // ) {
    //   current_login_user = JSON.parse(current_login_user);
    // if (
    //   current_login_user &&
    //   current_login_user.hasOwnProperty("tenant") &&
    //   current_login_user.tenant
    // ) {
    //   bxReq.data[0]["tenant"] = current_login_user.tenant;
    // }
    // if (
    //   current_login_user &&
    //   current_login_user.hasOwnProperty("application") &&
    //   current_login_user.application
    // ) {
    //   bxReq.data[0]["application"] = current_login_user.application;
    // }
    // }
    // 终端类型PC
    bxReq.data[0]["terminal_type"] = "PC";
    bxReqs.push(bxReq);
    var path =
      top.pathConfig.gateway +
      "/" +
      top.pathConfig.sso_app +
      "/operate/srvuser_login";
    var callBack = async function (data) {
      if (data.state == "SUCCESS") {
        var resp = data.response[0];
        if ("CHOOSE" == resp.code) {
          var data = resp.response.data;
          var content = "";
          var i = 1;
          for (var item of data) {
            if (i % 2 == 0) {
              content =
                content +
                '<div><button type="button" style="width:300px;height:100px" class="layui-btn chooseapp" id="' +
                item.application +
                '">' +
                item.application_name +
                "</button></div>";
            } else {
              content =
                content +
                '<div><button type="button" style="width:300px;height:100px" class="layui-btn layui-btn-normal chooseapp" id="' +
                item.application +
                '">' +
                item.application_name +
                "</button></div>";
            }
            i++;
          }
          saveLoginUser();
          layer.open({
            title: false,
            type: 1,
            content: content,
            closeBtn: 0,
            shade: 0.2,
          });
          $(".login").hide();
          if (window.location.href != window.parent.window.location.href) {
            $("#footer").hide();
          }
          $(".chooseapp").click(function () {
            loginProc(this.id);
          });
        } else {
          var bx_auth_ticket = resp.response.bx_auth_ticket;
          var current_login_user = resp.response.login_user_info;
          saveLoginUser();
          sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
          sessionStorage.setItem("logined", true);
          // if (sessionStorage.getItem("current_tenant_no")||top.user?.tenant) {
          //   // 如果缓存中有租户编号 则进行租户登录
          //   goTenant(current_login_user);
          //   return;
          // }else{
          sessionStorage.setItem(
            "current_login_user",
            JSON.stringify(current_login_user)
          );
          top.user = current_login_user;
          if (top.user.tenant_name) {
            top.document.title = top.user.tenant_name;
          }
          await fetchApplications()
          // }
          if (sessionStorage.login_redirect_url) {
            // 从别的页面跳过来的
            const url = sessionStorage.login_redirect_url;
            window.location.href = url;
            sessionStorage.removeItem('login_redirect_url');
            return;
          }
          var address = top.window.location;
          if (
            top.window.location.pathname &&
            top.window.location.pathname.endsWith("/main/index.html")
          ) {
            if (sessionStorage.getItem("need_main_refresh")) {
              var indexpage = getMainAddress();
              top.window.location.href = "/" + indexpage;
              sessionStorage.removeItem("need_main_refresh");
            } else {
              //1.不用刷新 页面当前已经在主页面
            }
          } else {
            var indexpage = getMainAddress();
            top.window.location.href = "/" + indexpage;
            let menu = [];
            window.sessionStorage.setItem("menu", JSON.stringify(menu));
            window.sessionStorage.setItem("curmenu", "");
          }
          //主页面地址
          if (top.layer) {
            top.layer.closeAll();
          }
          if (layer) {
            layer.closeAll();
          }
        }
      } else if (data.resultCode === 'PWD_EXPIRE') {
        // 密码过期，长时间未修改密码，需要强制修改密码
        // let isOk = confirm(data.resultMessage || "您的密码已过期，请及时修改密码");
        // if (isOk) {
        //   window.location.href = "/main/change_pwd.html";
        // }
        // 密码过期
        layer.open({
          type: 1,
          title: '密码过期',
          area: ['300px', '200px'],
          shadeClose: true,
          content: '<div style="padding: 20px;">您的密码已过期，请修改密码</div>',
          btn: ['确定', '取消'],
          yes: function (index, layero) {
            layer.close(index);
            top.window.location.href = `/main/page/user/changePwd.html?type=pwd_expire&user_no=${user_no}`;
          }
        })

      } else {
        alert(data.resultMessage);
      }
    };
    let oldUser = window.sessionStorage.getItem("current_login_user");
    oldUser = oldUser ? JSON.parse(oldUser) : oldUser;
    if (top.layer && oldUser && user_no !== oldUser.user_no) {
      if (window.location.href != window.parent.window.location.href) {
        sessionStorage.setItem("current_login_user", null);
        top.layer.confirm(
          "当前账号与已登录帐号不同，是否需要切换帐号重新登录？",
          {
            btn: ["确认", "取消"], //按钮
          },
          function () {
            //切换到登录页面
            reLogin();
          },
          function () { }
        );
      } else {
        crosAjax(path, "POST", bxReqs, callBack);
      }
    } else {
      crosAjax(path, "POST", bxReqs, callBack);
    }
  }

  /*保存登录账户信息*/
  function saveLoginUser() {
    var username = $("#user_no").val();
    var password = $("#pwd").val();
    $.cookie("login_user_name", username, { expires: 7 });
    var mi = encrypt(password);
    console.log("CryptoJS", mi, password);
    if ($("#ck_rmbUser").prop("checked")) {
      $.cookie("rmbUser", "true", { expires: 7 }); //存储一个带7天期限的cookie
      $.cookie("user_no", username, { expires: 7 });
      $.cookie("pwd", mi, { expires: 7 });
    } else {
      $.cookie("rmbUser", "false", { expire: -1 });
      $.cookie("user_no", "", { expires: -1 });
      $.cookie("pwd", "", { expires: -1 });
    }
  }
  //加载页面属性信息
  (function () {
    //忘记密码
    // var obj = $("#forget_pwd_id");
    // if (obj) obj.hide();

    var path =
      top.pathConfig.gateway + "/config/select/srvconfig_page_attribute_select";
    var bxReq = {
      serviceName: "srvconfig_page_attribute_select",
      colNames: ["*"],
      condition: [],
    };
    // //指定应用
    // var assignApp = sessionStorage.getItem("assignApp");
    // if (assignApp) {
    //   bxReq.condition.push({
    //     colName: "application",
    //     ruleType: "eq",
    //     value: assignApp,
    //   });
    // }
    // //指定端口
    // var assignPort = sessionStorage.getItem("assignPort");
    // if (assignPort) {
    //   bxReq.condition.push({
    //     colName: "port",
    //     ruleType: "eq",
    //     value: assignPort + "端",
    //   });
    // }
    crosAjax(path, "POST", bxReq, function (backdata) {
      var datas = backdata.data;
      var page_attr = {};
      window.sessionStorage.setItem("childPagination", true); // 默认子表显示分页
      for (var item of datas) {
        let attr_value;
        page_attr[item.attr_key] = item.attr_value;
        switch (item.attr_key) {
          case "login_encry":
            // 登录时密码加密
            loginEncry = item.attr_value === '是';
            break;
          case "login_page_forget_pwd":
            attr_value = item.attr_value;
            if ("是" == attr_value) $("#forget_pwd_id").show();
            break;
          case "scan_code_login":
            attr_value = item.attr_value;
            if ("否" == attr_value) $("#forget_pwd_id").hide();
            break;
          case "copyright":
            $("#copyright>.text").text(item.attr_value);
            break;
          case "record_no":
            $("#record_no").show();
            $("#record_no").text(item.attr_value);
            break;
          case "title":
            const urlObj = new URL(top.location.href)
            if (top.user?.tenant_name || urlObj.searchParams.get('tname')) {
              document.title = top.user.tenant_name || urlObj.searchParams.get('tname');
            } else {
              if (sessionStorage.current_tenant_name) {
                document.title = sessionStorage.current_tenant_name;
              } else {
                document.title = item.attr_value;
              }
            }
            break;
          case "statement":
            $("#statement_info").show();
            $("#statement_info").text(item.attr_value);
            break;
          case "login_bgimg":
            var bgimgurl =
              "url(" + item.attr_value + ") no-repeat left bottom/cover";
            $(".video_mask").css("background", bgimgurl);
            break;
          default:
            text = "-";
        }
      }
      window.sessionStorage.setItem(
        "pages_attribute",
        JSON.stringify(page_attr)
      );
      var timeout_login = "1"; // 默认需要
      window.sessionStorage.setItem("timeout_login", timeout_login);
    });
  })();

  //<!-- 2024-03-26新增逻辑 start -->

  // let currentStep = 'login'//login bind updateInfo三种状态，默认登录
  // function changeStep(type = 'bind') {
  //     // 绑定账号
  //     currentStep = type
  //     if (type === 'bind') {
  //         document.querySelectorAll('.login-box .right-box').forEach(box => {
  //             box.style.display = 'none'
  //             if (box.classList.contains('bind-right-box')) {
  //                 box.style.display = 'block'
  //             }
  //         })
  //     } else if (type === 'login') {
  //         document.querySelectorAll('.login-box .right-box').forEach(box => {
  //             box.style.display = 'none'
  //             if (box.classList.contains('login-right-box')) {
  //                 box.style.display = 'block'
  //             }
  //         })
  //     }
  // }

  // 账号登录 切换密码显示隐藏 注册点击事件，处理眼睛图标状态
  const eye = document.getElementById("icon-eye");
  const pwd = document.getElementById("pwd");
  let flag = 0;
  eye.onclick = function () {
    if (flag === 0) {
      pwd.type = "text";
      eye.classList.add("open");
      flag = 1;
    } else {
      pwd.type = "password";
      eye.classList.remove("open");
      flag = 0;
    }
  };

  // 账号绑定 密码显示隐藏 注册点击事件，处理眼睛图标状态
  const bindEye = document.getElementById("bind_icon-eye");
  const bindPwd = document.getElementById("bind_pwd");
  let bindFlag = 0;
  bindEye.onclick = function () {
    if (bindFlag === 0) {
      bindPwd.type = "text";
      bindEye.classList.add("open");
      bindFlag = 1;
    } else {
      bindPwd.type = "password";
      bindEye.classList.remove("open");
      bindFlag = 0;
    }
  };

  // 切换绑定账号方式
  const bindTypes = document.querySelectorAll(".account-type");
  let bindType = "account"; //account、phone 默认账号绑定，可切换手机号绑定
  bindTypes.forEach((type) => {
    type.onclick = (e) => {
      if (bindType === "account") {
        if (
          !document.querySelector("#bind_user_no").value ||
          !document.querySelector("#bind_pwd").value
        ) {
          document.querySelector("#bindBtn").classList.add("disabled");
        }
      } else {
        if (
          !document.querySelector("#phone").value ||
          !document.querySelector("#phoneCode").value
        ) {
          document.querySelector("#bindBtn").classList.add("disabled");
        }
      }
      bindType = e.target.dataset.type;
      bindTypes.forEach((type) => {
        type.classList.remove("active");
      });
      e.target.classList.add("active");
      if (bindType === "account") {
        document.querySelector(".bind-account").style.display = "block";
        document.querySelector(".bind-phone").style.display = "none";
      } else if (bindType === "phone") {
        document.querySelector(".bind-account").style.display = "none";
        document.querySelector(".bind-phone").style.display = "block";
      }
    };
  });

  //切换tab
  let activeTab = "pwd";
  const tabs = document.querySelectorAll(".login-tabs .tab");
  const changeTab = (e) => {
    console.log("changeTab:", e, e.target?.dataset?.tab);
    activeTab = e.target?.dataset?.tab;
    if (activeTab === "pwd") {
      document.querySelector(".account-login").style.display = "block";
      document.querySelector(".scan-login").style.display = "none";
    } else if (activeTab === "scan") {
      document.querySelector(".account-login").style.display = "none";
      document.querySelector(".scan-login").style.display = "flex";
    }
    tabs.forEach((tab) => {
      if (tab.classList.contains("active")) {
        tab.classList.remove("active");
      }
      if (tab === e.target) {
        tab.classList.add("active");
      }
    });
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", changeTab);
  });

  // 监听输入框 输入事件
  let user_no = ""; // 登录-用户名
  let password = ""; //登录-密码
  let bindAccountPhone = ""; //绑定账号-手机号
  let bindAccountPhoneCode = ""; //绑定账号-手机号验证码
  document.querySelectorAll(".input").forEach((input) => {
    input.addEventListener("input", inputChange);
  });

  function inputChange(e) {
    if (activeTab === "pwd" && ["user_no", "pwd"].includes(e.target.name)) {
      // 账号密码登录
      if (e.target.name === "user_no") {
        user_no = e.target.value;
      }
      if (e.target.name === "pwd") {
        password = e.target.value;
      }
      // 账号 密码都填写 启用登录按钮
      if (user_no && password) {
        document.querySelector("#loginbtn").classList.remove("disabled");
      } else {
        document.querySelector("#loginbtn").classList.add("disabled");
      }
    }
    if (
      bindType === "phone" &&
      ["bindAccountPhone", "bindAccountPhoneCode"].includes(e.target.name)
    ) {
      // 绑定账号-手机号绑定
      if (e.target.name === "bindAccountPhone") {
        bindAccountPhone = e.target.value;
        if (isValidPhoneNumber(e.target.value)) {
          document.querySelector("#codeBtn").classList.remove("disabled");
        } else {
          document.querySelector("#codeBtn").classList.add("disabled");
        }
      }
      if (e.target.name === "bindAccountPhoneCode") {
        bindAccountPhoneCode = e.target.value;
      }
      // 手机号 验证码都填写并且符合格式 启用绑定按钮
      if (
        bindAccountPhone &&
        bindAccountPhoneCode &&
        isValidPhoneNumber(bindAccountPhone) &&
        bindAccountPhoneCode?.length >= 4
      ) {
        document.querySelector("#bindBtn").classList.remove("disabled");
      } else {
        document.querySelector("#bindBtn").classList.add("disabled");
      }
    } else if (
      bindType === "account" &&
      ["bind_user_no", "bind_pwd"].includes(e.target.name)
    ) {
      // 绑定账号-用户名密码绑定
      if (
        document.querySelector("#bind_user_no").value &&
        document.querySelector("#bind_pwd").value
      ) {
        document.querySelector("#bindBtn").classList.remove("disabled");
      } else {
        document.querySelector("#bindBtn").classList.add("disabled");
      }
    }
  }

  function isValidPhoneNumber(phoneNumber) {
    const phoneReg = /^1[1-9]\d{9}$/;
    return phoneReg.test(phoneNumber);
  }

  // 发送验证码
  function sendCode(type = "login") {
    const phoneNo = $("#phone").val();
    if (phoneNo) {
      if (isValidPhoneNumber(phoneNo)) {
        const bxReq = {};
        bxReq.serviceName = "srvsso_send_node";
        bxReq.data = [
          {
            mobile: phoneNo,
            type: type,
          },
        ];
        const path =
          top.pathConfig.gateway +
          "/" +
          top.pathConfig.sso_app +
          "/operate/srvsso_send_node";
        return new Promise((resolve) => {
          crosAjax(path, "POST", [bxReq], function (data) {
            resolve(data);
          });
        });
      } else {
        alert("请输入正确的手机号");
      }
    } else {
      alert("请输入手机号");
    }
  }

  const codeBtn = document.querySelector("#codeBtn");
  codeBtn.onclick = () => {
    if (codeBtn.classList.contains("disabled")) {
      return;
    }
    codeBtn.classList.add("disabled");
    sendCode("reglogin").then((data) => {
      if (data.state === "SUCCESS") {
        let time = 60;
        const timer = setInterval(() => {
          if (time > 0) {
            codeBtn.innerText = `${time}s`;
            time--;
          } else {
            codeBtn.innerText = "获取验证码";
            codeBtn.classList.remove("disabled");
            clearInterval(timer);
          }
        }, 1000);
      } else if (data.resultMessage) {
        alert(data.resultMessage);
      }
    });
  };

  // 绑定手机号
  function bindPhone() {
    const openid = sessionStorage.getItem("BIND_OPENID");
    const unionid = sessionStorage.getItem("BIND_UNIONID");
    if (!openid || !unionid) {
      alert("未知错误，请点击【返回首页】重新登录");
      return;
    }
    const phoneNo = $("#phone").val();
    const phoneCode = $("#phoneCode").val();
    const reqData = {
      openid: openid,
      unionid: unionid,
    };
    if (bindType === "phone") {
      if (!phoneNo) {
        alert("请输入手机号");
        return;
      }
      if (!phoneCode) {
        alert("请输入验证码");
        return;
      }
      reqData.mobile = phoneNo;
      if (isValidPhoneNumber(phoneNo)) {
        reqData.code = phoneCode;
      } else {
        alert("请输入正确的手机号");
        return;
      }
    } else if (bindType === "account") {
      const userNo = $("#bind_user_no").val();
      const pwd = $("#bind_pwd").val();
      if (!userNo) {
        alert("请输入账号");
        return;
      }
      if (!pwd) {
        alert("请输入密码");
        return;
      }
      reqData.user_no = userNo;
      reqData.pwd = pwd;
    }
    const req = [
      {
        serviceName: "srvwx_bind_login",
        data: [reqData],
      },
    ];
    const url = `${top.pathConfig.gateway}/wx/operate/srvwx_bind_login`;
    crosAjax(url, "POST", req, function (data) {
      if (data.state === "SUCCESS") {
        const resp = data.response[0];
        alert("绑定成功");
        sessionStorage.removeItem("BIND_OPENID");
        sessionStorage.removeItem("BIND_UNIONID");
        let bx_auth_ticket = resp.response.bx_auth_ticket;
        let current_login_user = resp.response.login_user_info;
        sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
        sessionStorage.setItem("logined", true);
        sessionStorage.setItem(
          "current_login_user",
          JSON.stringify(current_login_user)
        );
        if (top.layer) {
          top.layer.closeAll();
        }
        if (layer) {
          layer.closeAll();
        }
        // saveLoginUser();
        sessionStorage.setItem("bx_auth_ticket", bx_auth_ticket);
        sessionStorage.setItem("logined", true);
        sessionStorage.setItem(
          "current_login_user",
          JSON.stringify(current_login_user)
        );
        top.user = current_login_user;
        if (top.window.location?.pathname?.endsWith("/main/index.html")) {
          if (sessionStorage.getItem("need_main_refresh")) {
            var indexpage = getMainAddress();
            top.window.location.href = "/" + indexpage;
            sessionStorage.removeItem("need_main_refresh");
          } else {
            //1.不用刷新 页面当前已经在主页面
          }
        } else {
          const indexpage = getMainAddress();
          top.window.location.href = "/" + indexpage;
          let menu = [];
          window.sessionStorage.setItem("menu", JSON.stringify(menu));
          window.sessionStorage.setItem("curmenu", "");
        }
        //主页面地址
      } else if (data.resultMessage) {
        alert(data.resultMessage);
      }
    });
  }

  document.querySelector("#bindBtn").onclick = () => {
    bindPhone();
  };

  // <!-- 2024-03-26新增逻辑 end -->
});
