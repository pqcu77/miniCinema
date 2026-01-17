/**
 * API 配置文件
 * 支持动态切换 localhost 和 ngrok 模式
 */

// 获取后端 URL - 优先使用 localStorage，其次使用默认值
let API_BASE_URL = localStorage.getItem('backendUrl') || 'http://localhost:8080';

// 监听 storage 变化（其他标签页修改时同步）
window.addEventListener('storage', (event) => {
    if (event.key === 'backendUrl' && event.newValue) {
        API_BASE_URL = event.newValue;
        console.log('✅ API_BASE_URL 已更新为:', API_BASE_URL);
    }
});

// 导出配置
window.API_CONFIG = {
    getBaseUrl: () => API_BASE_URL,
    setBaseUrl: (url) => {
        localStorage.setItem('backendUrl', url);
        API_BASE_URL = url;
        console.log('✅ API_BASE_URL 已更新为:', API_BASE_URL);
    }
};

console.log('🎬 MiniCinema API 配置已加载');
console.log('当前后端 URL:', API_BASE_URL);

