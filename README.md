# 币安实时服务器时间监控

一个纯前端实现的币安服务器时间实时监控应用，通过 WebSocket 直接连接币安 API，无需服务器端支持。

## 🌟 特性

- **实时监控**：每秒从币安服务器获取最新时间
- **纯前端**：无需服务器，直接在浏览器中运行
- **自动重连**：连接断开时自动重连
- **主题切换**：支持亮色/暗色主题
- **历史记录**：显示最近 10 次时间更新记录
- **响应式设计**：支持移动端和桌面端
- **GitHub Pages 兼容**：可直接部署到 GitHub Pages

## 🚀 部署

### GitHub Pages 部署

1. 确保仓库设置中启用了 GitHub Pages
2. 将源分支设置为 `github-pages-ready`
3. 访问 `https://yourusername.github.io/binance-websocket/`

### 本地运行

由于使用纯前端技术，可以直接在浏览器中打开 `index.html` 文件，或使用任何静态文件服务器：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js 的 http-server
npx http-server

# 使用 Live Server (VS Code 扩展)
```

## 🛠️ 技术实现

### 架构变化

- **原架构**：Browser ← Socket.IO ← Express Server ← WebSocket ← Binance API
- **新架构**：Browser ← WebSocket ← Binance API

### 核心技术

- **WebSocket API**：直接连接币安 WebSocket API
- **原生 JavaScript**：无依赖的纯 JavaScript 实现
- **CSS Grid/Flexbox**：响应式布局
- **LocalStorage**：主题偏好保存

### WebSocket 连接

应用直接连接到币安的 WebSocket API：

```javascript
const wsUrl = 'wss://ws-api.binance.com:9443/ws-api/v3';
```

使用 `time` 方法获取服务器时间：

```javascript
{
    \"id\": \"unique-request-id\",
    \"method\": \"time\"
}
```

## 📁 文件结构

```
/
├── index.html          # 主页面
├── app.js             # 应用逻辑
├── style.css          # 样式文件
└── README.md          # 说明文档
```

## 🔧 主要功能

### WebSocket 管理
- 自动连接和重连机制
- 连接状态实时显示
- 错误处理和日志记录

### 时间显示
- 格式化中文时间显示
- 实时更新（每秒）
- 历史记录追踪

### 用户体验
- 主题切换（亮色/暗色）
- 响应式设计
- 连接统计信息

## 🌐 浏览器兼容性

支持所有现代浏览器：

- Chrome 58+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📊 API 限制

币安 WebSocket API 限制：
- 每分钟最多 6000 个请求权重
- 本应用每秒发送一次请求，远低于限制

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [币安 WebSocket API 文档](https://binance-docs.github.io/apidocs/websocket_api/en/)
- [GitHub Pages 文档](https://docs.github.com/pages)

---

**注意**：这是一个纯前端实现，移除了所有服务器端依赖（Express、Socket.IO 等），专为 GitHub Pages 部署优化。
