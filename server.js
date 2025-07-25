const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const BinanceWebSocket = require("./binance/ws-client");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 配置中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const client = new BinanceWebSocket(io);
client.connect();

// 启动服务器
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});