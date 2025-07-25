document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const priceRows = document.getElementById('priceRows');
    const toggleThemeBtn = document.getElementById('toggleTheme');

    // 主题切换
    toggleThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });


    // 处理价格更新
    socket.on('timeUpdate', (data) => {
        const span = document.getElementById(`currentServerTime`);
        span.textContent = data;
    });

});