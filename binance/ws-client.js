const WebSocket = require('ws');
require('dotenv').config();

// 币安 WebSocket 基础 URL
const BINANCE_WS_URL = 'wss://ws-api.binance.com:9443/ws-api/v3';
const INTERVAL = 1000; // 更新频率: 1s, 1m, 5m 等

module.exports = class BinanceWebSocket {
    constructor(io) {
        this.io = io;
        this.socket = null;
    }

    connect() {
        this.socket = new WebSocket(`${BINANCE_WS_URL}`);

        this.socket.on('open', () => {
            console.log('Connected to Binance WebSocket API');
            setInterval(() => {
                this.socket.send(JSON.stringify({
                    "id": "187d3cb2-942d-484c-8271-4e2141bbadb1",
                    "method": "time"
                }));
            }, INTERVAL)
        });

        this.socket.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        this.socket.on('close', () => {
            console.log('Disconnected from Binance WebSocket API');
            setTimeout(() => this.connect(), 5000); // 5秒后重连
        });

        this.socket.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    }

    handleMessage(message) {
        console.log('res', message)

        if (message.status === 200) {
            const localString = new Date(message.result.serverTime).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false // 24小时制
            });


            console.log(localString); // 输出示例: 2025/07/24 14:24:53
            this.io.emit('timeUpdate', localString);
        }

        // {
        //     "id": "187d3cb2-942d-484c-8271-4e2141bbadb1",
        //     "status": 200,
        //     "result": {
        //     "serverTime": 1753457093600
        // },
        //     "rateLimits": [
        //     {
        //         "rateLimitType": "REQUEST_WEIGHT",
        //         "interval": "MINUTE",
        //         "intervalNum": 1,
        //         "limit": 6000,
        //         "count": 5
        //     }
        // ]
        // }
    }
}