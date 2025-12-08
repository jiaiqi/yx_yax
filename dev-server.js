const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;

// --- 简易热重载：SSE 客户端集合与广播 ---
const sseClients = new Set();
function broadcastReload() {
  for (const res of sseClients) {
    try {
      res.write('data: reload\n\n');
    } catch (e) {}
  }
}
function heartbeat() {
  for (const res of sseClients) {
    try {
      res.write(': ping\n\n'); // 注释行，保持连接
    } catch (e) {}
  }
}
setInterval(heartbeat, 30000);

function sendFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not Found');
    } else {
      res.statusCode = 200;
      // 为 HTML 注入客户端重载脚本
      if (/\.html?$/.test(filePath)) {
        let html = data.toString();
        const clientScript = `\n<script>(function(){\n  try{\n    var es = new EventSource('/__livereload');\n    es.onmessage = function(e){ if(e && e.data === 'reload'){ location.reload(); } };\n  }catch(e){}\n})();</script>\n`;
        if (/<\/body>/i.test(html)) {
          html = html.replace(/<\/body>/i, clientScript + '</body>');
        } else {
          html += clientScript;
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
      } else {
        res.end(data);
      }
    }
  });
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    // SSE 端点：用于通知客户端刷新
    if (urlPath === '/__livereload') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(': connected\n\n');
      sseClients.add(res);
      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }
    let target = path.join(root, urlPath);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, 'index.html');
    }
    sendFile(req, res, target);
  } catch (e) {
    res.statusCode = 500;
    res.end('Server Error');
  }
});

const START_PORT = 8000;
const MAX_PORT = 8100; // 端口上限，避免无限重试

function listen(port) {
  // 如果绑定失败（如端口占用），尝试下一个端口
  server.once('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const next = port + 1;
      if (next <= MAX_PORT) {
        console.log(`端口 ${port} 已被占用，尝试 ${next}...`);
        listen(next);
      } else {
        console.error(`端口范围 ${START_PORT}-${MAX_PORT} 均被占用，无法启动。`);
      }
    } else {
      console.error('服务器启动失败：', err);
    }
  });

  server.listen(port, () => {
    console.log(`Preview: http://localhost:${port}/`);
  });
}

listen(START_PORT);

// 监听文件变更并广播刷新（防抖）
let reloadTimer = null;
try {
  fs.watch(root, { recursive: true }, (eventType, filename) => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      broadcastReload();
    }, 200);
  });
} catch (e) {
  console.warn('文件监听不可用或失败：', e && e.message);
}