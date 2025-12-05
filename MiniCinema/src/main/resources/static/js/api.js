const API_BASE_URL = '/api';

// 获取 userId（从 localStorage 或 sessionStorage）
function getUserId() {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
}

// 设置请求头
function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const userId = getUserId() || 1;
    headers['userId'] = userId;
    return headers;
}

// 购物车 API
const cartAPI = {
    // 添加到购物车
    add: async (cartDTO) => {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(cartDTO)
        });
        return await response.json();
    },

    // 获取购物车列表
    list: async () => {
        const response = await fetch(`${API_BASE_URL}/cart/list`, {
            headers: getHeaders()
        });
        return await response.json();
    },

    // 删除购物车项
    remove: async (cartId) => {
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await response.json();
    },

    // 清空购物车
    clear: async () => {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await response.json();
    }
};

// 订单 API
const orderAPI = {
    // 创建订单
    create: async (orderDTO) => {
        const response = await fetch(`${API_BASE_URL}/order/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderDTO)
        });
        return await response.json();
    },

    // 获取订单详情
    get: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
            headers: getHeaders()
        });
        return await response.json();
    },

    // 获取用户订单列表
    list: async () => {
        const response = await fetch(`${API_BASE_URL}/order/list`, {
            headers: getHeaders()
        });
        return await response.json();
    }
};

// 支付 API
const paymentAPI = {
    // 发起支付
    pay: async (paymentDTO) => {
        const response = await fetch(`${API_BASE_URL}/payment/pay`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(paymentDTO)
        });
        return await response.json();
    },

    // 支付回调
    callback: async (params) => {
        const response = await fetch(`${API_BASE_URL}/payment/callback`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params)
        });
        return await response.json();
    }
};

// 票券 API
const ticketAPI = {
    // 获取订单的票券列表
    list: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/ticket/list/${orderId}`, {
            headers: getHeaders()
        });
        return await response.json();
    },

    // 核销票券
    verify: async (ticketCode) => {
        const response = await fetch(`${API_BASE_URL}/ticket/verify?ticketCode=${ticketCode}`, {
            method: 'POST',
            headers: getHeaders()
        });
        return await response.json();
    }
};

// 通用工具函数
const Utils = {
    // 显示消息提示
    showMessage: (message, type = 'info') => {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#ff6b6b' : '#2196f3'};
            color: white;
            border-radius: 4px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    },

    // 格式化价格
    formatPrice: (price) => {
        return `¥${parseFloat(price).toFixed(2)}`;
    },

    // 格式化日期
    formatDate: (date) => {
        const d = new Date(date);
        return d.getFullYear() + '-' + 
               String(d.getMonth() + 1).padStart(2, '0') + '-' +
               String(d.getDate()).padStart(2, '0') + ' ' +
               String(d.getHours()).padStart(2, '0') + ':' +
               String(d.getMinutes()).padStart(2, '0');
    }
};

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);