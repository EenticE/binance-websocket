class BinanceWebSocketClient {
    constructor() {
        this.socket = null;
        this.reconnectInterval = null;
        this.updateInterval = null;
        this.isConnecting = false;
        this.updateCount = 0;
        this.startTime = Date.now();
        this.maxHistoryItems = 10;
        
        // WebSocket 配置
        this.wsUrl = 'wss://ws-api.binance.com:9443/ws-api/v3';
        this.requestInterval = 1000; // 1秒请求一次时间
        
        // DOM 元素
        this.elements = {
            currentTime: document.getElementById('currentServerTime'),
            connectionStatus: document.getElementById('connectionStatus'),
            lastUpdate: document.getElementById('lastUpdate'),
            wsStatus: document.getElementById('wsStatus'),
            updateCount: document.getElementById('updateCount'),
            uptime: document.getElementById('uptime'),
            timeHistory: document.getElementById('timeHistory'),
            toggleTheme: document.getElementById('toggleTheme'),
            reconnectBtn: document.getElementById('reconnectBtn')
        };
        
        this.init();
    }
    
    init() {
        // 绑定事件监听器
        this.elements.toggleTheme.addEventListener('click', () => this.toggleTheme());
        this.elements.reconnectBtn.addEventListener('click', () => this.reconnect());
        
        // 启动运行时间计时器
        this.startUptimeTimer();
        
        // 初始连接
        this.connect();
        
        // 从本地存储恢复主题设置
        this.loadThemePreference();
    }
    
    connect() {
        if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
            return;
        }
        
        this.isConnecting = true;
        this.updateConnectionStatus('connecting', '连接中...');
        this.elements.reconnectBtn.disabled = true;
        
        try {
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                console.log('Connected to Binance WebSocket API');
                this.isConnecting = false;
                this.elements.reconnectBtn.disabled = false;
                this.updateConnectionStatus('connected', '已连接');
                this.startTimeUpdates();
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log('Disconnected from Binance WebSocket API', event.code, event.reason);
                this.isConnecting = false;
                this.elements.reconnectBtn.disabled = false;
                this.updateConnectionStatus('disconnected', '连接断开');
                this.stopTimeUpdates();
                
                // 自动重连（5秒后）
                if (!event.wasClean) {
                    this.scheduleReconnect();
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
                this.elements.reconnectBtn.disabled = false;
                this.updateConnectionStatus('disconnected', '连接错误');
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.isConnecting = false;
            this.elements.reconnectBtn.disabled = false;
            this.updateConnectionStatus('disconnected', '连接失败');
            this.scheduleReconnect();
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Manual disconnect');
            this.socket = null;
        }
        this.stopTimeUpdates();
        this.clearReconnectTimer();
    }
    
    reconnect() {
        this.disconnect();
        setTimeout(() => {
            this.connect();
        }, 100);
    }
    
    scheduleReconnect() {
        this.clearReconnectTimer();
        this.reconnectInterval = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.connect();
        }, 5000);
    }
    
    clearReconnectTimer() {
        if (this.reconnectInterval) {
            clearTimeout(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }
    
    startTimeUpdates() {
        this.stopTimeUpdates();
        
        // 立即发送一次请求
        this.requestServerTime();
        
        // 设置定时请求
        this.updateInterval = setInterval(() => {
            this.requestServerTime();
        }, this.requestInterval);
    }
    
    stopTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    requestServerTime() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const request = {
                "id": this.generateRequestId(),
                "method": "time"
            };
            this.socket.send(JSON.stringify(request));
        }
    }
    
    generateRequestId() {
        return 'time-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    handleMessage(message) {
        console.log('Received message:', message);
        
        if (message.status === 200 && message.result && message.result.serverTime) {
            const serverTime = message.result.serverTime;
            this.updateDisplayTime(serverTime);
            this.updateCount++;
            this.elements.updateCount.textContent = this.updateCount;
        } else {
            console.warn('Unexpected message format:', message);
        }
    }
    
    updateDisplayTime(serverTime) {
        try {
            const date = new Date(serverTime);
            
            // 格式化显示时间
            const timeString = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // 更新主要时间显示
            this.elements.currentTime.textContent = timeString;
            
            // 更新最后更新时间
            const now = new Date();
            const lastUpdateString = now.toLocaleTimeString('zh-CN');
            this.elements.lastUpdate.textContent = `更新于 ${lastUpdateString}`;
            
            // 添加到历史记录
            this.addToHistory(timeString, lastUpdateString);
            
        } catch (error) {
            console.error('Error formatting time:', error);
        }
    }
    
    addToHistory(serverTime, updateTime) {
        const historyItem = document.createElement('li');
        historyItem.innerHTML = `
            <span>${serverTime}</span>
            <span style="font-size: 12px; color: var(--text-secondary);">${updateTime}</span>
        `;
        
        // 插入到列表顶部
        this.elements.timeHistory.insertBefore(historyItem, this.elements.timeHistory.firstChild);
        
        // 限制历史记录数量
        while (this.elements.timeHistory.children.length > this.maxHistoryItems) {
            this.elements.timeHistory.removeChild(this.elements.timeHistory.lastChild);
        }
    }
    
    updateConnectionStatus(status, text) {
        const statusElement = this.elements.connectionStatus;
        
        // 移除所有状态类
        statusElement.classList.remove('status-connected', 'status-disconnected', 'status-connecting');
        
        // 添加对应状态类
        statusElement.classList.add(`status-${status}`);
        
        // 更新文本
        statusElement.innerHTML = `<i class="icon-status"></i> ${text}`;
        
        // 更新状态显示
        this.elements.wsStatus.textContent = text;
    }
    
    startUptimeTimer() {
        setInterval(() => {
            const uptime = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            
            let uptimeString = '';
            if (hours > 0) {
                uptimeString += `${hours}h `;
            }
            if (minutes > 0 || hours > 0) {
                uptimeString += `${minutes}m `;
            }
            uptimeString += `${seconds}s`;
            
            this.elements.uptime.textContent = uptimeString;
        }, 1000);
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        this.saveThemePreference();
    }
    
    saveThemePreference() {
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('binance-ws-theme', isDark ? 'dark' : 'light');
    }
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('binance-ws-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.binanceClient = new BinanceWebSocketClient();
    
    // 页面卸载时断开连接
    window.addEventListener('beforeunload', () => {
        if (window.binanceClient) {
            window.binanceClient.disconnect();
        }
    });
});