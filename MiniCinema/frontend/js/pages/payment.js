import api from '../api.js';
import userState from '../userState.js';
import { showMessage, formatDateTime } from '../utils.js';

// ✅ 创建 showToast 别名
function showToast(message, type = 'info', duration = 3000) {
    showMessage(message, type, duration);
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

class PaymentPage {
    constructor() {
        this.orderItems = [];
        this.totalAmount = 0;
        this.orderId = null;
        this.init();
    }

    async init() {
        if (!userState.isLoggedIn()) {
            showToast('请先登录', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        this.updateUserInfo();
        this.bindEvents();
        await this.loadOrderItems();
    }

    updateUserInfo() {
        const user = userState.getUser();
        const welcomeText = document.getElementById('welcomeText');
        
        if (welcomeText && user) {
            const username = user.username || user.email || '用户';
            welcomeText.textContent = `欢迎, ${username}`;
        }
    }

    bindEvents() {
        document.getElementById('submitPayment')?.addEventListener('click', () => {
            this.processPayment();
        });
    }

    async loadOrderItems() {
        try {
            const checkoutItems = sessionStorage.getItem('checkoutItems');
            const cartItemIds = JSON.parse(checkoutItems || '[]');
            
            console.log('🛒 结账项目 ID:', cartItemIds);
            
            if (cartItemIds.length === 0) {
                showToast('没有要支付的商品', 'warning');
                setTimeout(() => window.location.href = 'cart.html', 1500);
                return;
            }

            // ✅ 获取购物车数据并过滤
            const user = userState.getUser();
            const response = await api.get(`/api/cart/${user.userId}`);
            
            console.log('📦 购物车响应:', response);
            
            if (response.code === 1 && response.data) {
                const allItems = response.data.items || [];
                
                // ✅ 筛选出结账的项目（使用 cartId）
                this.orderItems = allItems.filter(item => 
                    cartItemIds.includes(item.cartId)
                );
                
                console.log('✅ 结账项目:', this.orderItems);
                this.renderOrderItems();
            } else {
                showToast(response.msg || '加载订单失败', 'error');
            }
        } catch (error) {
            console.error('❌ 加载订单失败:', error);
            showToast('加载订单失败', 'error');
        }
    }

    renderOrderItems() {
        const orderItemsEl = document.getElementById('orderItems');
        
        this.totalAmount = this.orderItems.reduce((sum, item) => {
            return sum + (Number(item.totalPrice) || 0);
        }, 0);
        
        orderItemsEl.innerHTML = this.orderItems.map(item => {
            const posterUrl = item.moviePoster;
            const movieImageHTML = posterUrl 
                ? `<img src="${posterUrl}" alt="${item.movieName}">` 
                : '';
            
            return `
                <div class="order-item">
                    ${movieImageHTML}
                    <div class="order-item-info">
                        <h4>${item.movieName}</h4>
                        <p>${item.cinemaName} - ${item.hallName}</p>
                        <p>座位: ${item.seatNumbers}</p>
                        <p class="screening-time">时间: ${formatDateTime(item.showTime)}</p>
                    </div>
                    <div class="order-item-price">¥${Number(item.totalPrice).toFixed(2)}</div>
                </div>
            `;
        }).join('');

        console.log('💰 订单总额:', this.totalAmount.toFixed(2));

        document.getElementById('subtotal').textContent = this.totalAmount.toFixed(2);
        document.getElementById('totalAmount').textContent = this.totalAmount.toFixed(2);
    }

    async processPayment() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (!paymentMethod) {
            showToast('请选择支付方式', 'warning');
            return;
        }

        console.log('💳 选择的支付方式:', paymentMethod);
        console.log('💰 订单总额:', this.totalAmount);

        // ✅ 关键修改：0 元订单可直接完成
        if (this.totalAmount === 0) {
            console.log('🆓 0 元订单，直接完成支付');
            await this.completePayment(paymentMethod);
        } else {
            // ✅ 非 0 元订单显示"开发中"
            const methodName = paymentMethod === 'alipay' ? '支付宝' : '微信';
            showToast(`⚠️ ${methodName}支付功能正在开发中...`, 'warning');
            await this.completePayment(paymentMethod);
        }
    }

    // ✅ 新增：完成支付（0 元订单或未来真实支付成功后调用）
    async completePayment(paymentMethod) {
        try {
            const user = userState.getUser();
            
            // 构建订单数据
            const orderData = {
                userId: user.userId,
                paymentMethod: paymentMethod,
                totalAmount: this.totalAmount,
                items: this.orderItems.map(item => ({
                    screeningId: item.screeningId,
                    seatNumbers: item.seatNumbers,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            console.log('📝 创建订单:', orderData);

            // 调用后端创建订单
            const response = await api.post('/api/orders/create', orderData);

            console.log('📦 订单响应:', response);

            if (response.code === 1) {
                const orderId = response.data?.orderId || response.data?.id;
                
                // ✅ 删除购物车中已购买的项目
                for (const item of this.orderItems) {
                    await api.delete(`/api/cart/${item.cartId}`);
                }
                
                // 清除 sessionStorage
                sessionStorage.removeItem('checkoutItems');
                
                showToast('🎉 支付成功！电子票已生成', 'success');
                // 跳转到票夹页面
                setTimeout(() => {
                    window.location.href = 'tickets.html';
                }, 1500);
            } else {
                // ✅ 显示后端返回的错误信息
                const errorMsg = response.msg || '支付失败';
                
                // ✅ 如果是超时错误，显示友好提示
                if (errorMsg.includes('超时') || errorMsg.includes('失效') || errorMsg.includes('座位') || errorMsg.includes('锁定记录')) {
                    showToast('⏰ 超时未支付，座位已失效', 'error', 5000);
                } else {
                    showToast(errorMsg, 'error');
                }
            }
        } catch (error) {
            console.error('❌ 支付失败:', error);
            // ✅ 捕获网络错误或事务回滚错误
            const errorMsg = error.message || error.toString();
            // ✅ 检测关键词
            if (errorMsg.includes('rolled back') || 
                errorMsg.includes('rollback') || 
                errorMsg.includes('超时') || 
                errorMsg.includes('失效')) {
                showToast('⏰ 超时未支付，座位已失效', 'error', 5000);
            } else {
                showToast('支付失败，请重试', 'error');
            }
        }
    }
/*     async confirmPayment(transactionId) {
        try {
            console.log('✅ 确认支付:', transactionId);
            
            // ✅ 验证支付
            const response = await api.post('/api/payment/verify', {
                transactionId: transactionId,
                orderId: this.orderId
            });
            
            if (response.code === 1) {
                // 清除 session
                sessionStorage.removeItem('checkoutItems');
                
                // 显示成功页面
                document.getElementById('processingSection').style.display = 'none';
                document.getElementById('successSection').style.display = 'block';
                document.getElementById('orderNumber').textContent = response.data.orderNumber || this.orderId;
                
                showToast('支付成功！电子票已生成', 'success');
            } else {
                showToast(response.msg || '支付确认失败', 'error');
                document.getElementById('paymentModal').style.display = 'none';
            }
        } catch (error) {
            console.error('❌ 支付确认失败:', error);
            showToast('支付确认失败', 'error');
            document.getElementById('paymentModal').style.display = 'none';
        }
    } */
}

// 全局函数
window.closePaymentModal = closePaymentModal;

// 初始化页面
function initPaymentPage() {
    console.log('🔍 开始初始化支付页面');
    new PaymentPage();
    console.log('✅ 支付页面初始化完成');
}

if (document.readyState === 'loading') {
    console.log('⏳ 等待 DOM 加载...');
    document.addEventListener('DOMContentLoaded', initPaymentPage);
} else {
    console.log('✅ DOM 已加载，立即初始化');
    initPaymentPage();
}