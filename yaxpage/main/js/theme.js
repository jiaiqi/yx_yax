// 主题应用通用方法：根据登录用户设置 body 主题 class，并按需保存主题预设与背景图
(function () {
  function getImageUrl(fileNo) {
    try {
      var gateway = (window.top && window.top.pathConfig && window.top.pathConfig.gateway) ? window.top.pathConfig.gateway : '';
      var ticket = sessionStorage.getItem('bx_auth_ticket') || '';
      return gateway ? (gateway + '/file/download?bx_auth_ticket=' + ticket + '&fileNo=' + fileNo) : '';
    } catch (e) {
      return '';
    }
  }

  function setBg(selector, fileNo) {
    try {
      var el = document.querySelector(selector);
      if (el && fileNo) {
        el.classList.add('bg-img');
        el.style.backgroundImage = 'url(' + getImageUrl(fileNo) + ')';
      }
    } catch (e) { }
  }

  function setThemePreset(themeName) {
    // 与 index.html 保持一致的预设主题变量保存
    if (themeName === '迷彩绿' || themeName === '橄榄绿') {
      sessionStorage.setItem('theme', JSON.stringify({
        name: '迷彩绿',
        'primary-color': '#265e4d',
        'header-bg-color': '#174b3b',
        'menu-bg-color': '#265e4d',
        'menu-bg-light-color': '#ddebe6',
        'menu-light-border-color': '#4a7365',
        'menu-text-color': '#ffffff',
        'menu-active-bg-color': '#235646',
        'menu-hover-bg-color': '#235646',
        'menu-active-text-color': '#ffffff',
        'menu-hover-text-color': '#ffffff'
      }));
    } else if (themeName === '延安红') {
      sessionStorage.setItem('theme', JSON.stringify({
        name: '延安红',
        'primary-color': '#C41E3A',
        'header-bg-color': '#C41E3A',
        'menu-bg-color': '#C41E3A',
        'menu-bg-light-color': '#F6EEEE',
        'menu-light-border-color': '#E2C8C8',
        'menu-text-color': '#fff',
        'menu-active-bg-color': '#C41E3A',
        'menu-hover-bg-color': '#C41E3A',
        'menu-active-text-color': '#ffffff',
        'menu-hover-text-color': '#ffffff'
      }));
    }
  }

  // 对外暴露：页面调用即可完成主题 class 设置与背景图应用
  window.applyThemeClass = function () {
    try {
      var loginUserStr = sessionStorage.getItem('current_login_user');
      var loginUser = loginUserStr ? JSON.parse(loginUserStr) : null;
      var themeName = loginUser && loginUser.theme && loginUser.theme.theme;
      if (!themeName) return;

      var map = {
        '红色': 'red',
        '蓝色': 'dark-blue',
        '棕黄色': 'tan',
        '迷彩绿': 'camouflage-green',
        '橄榄绿': 'camouflage-green',
        '延安红': 'yanx-red'
      };
      var cls = map[themeName];
      if (cls) {
        document.body.classList.add(cls);
      }

      // 保存主题预设（与主页面一致），供其他页面使用 theme.css 变量
      setThemePreset(themeName);

      // 按需应用背景图（页面无对应元素则跳过）
      var t = (loginUser && loginUser.theme) ? loginUser.theme : {};
      setBg('#sitename', t.top_left_img);
      setBg('.layui-side .navBar', t.left_menu_img);
      setBg('.applications-header', t.top_app_img);
    } catch (e) { }
  };
})();

// 自动调用：页面只需引入 theme.js 即可应用主题
(function () {
  function safeApply() {
    try {
      if (typeof window.applyThemeClass === 'function') {
        window.applyThemeClass();
      }
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeApply);
  } else {
    safeApply();
  }
})();