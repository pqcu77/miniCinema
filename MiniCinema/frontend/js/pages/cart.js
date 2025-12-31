import userState from '../userState.js';
import eventBus from '../eventBus.js';
import api from '../api.js';
import { showMessage, formatDateTime } from '../utils.js';

// ✅ 创建 showToast 别名
function showToast(message, type = 'info', duration = 3000) {
    showMessage(message, type, duration);
}

class CartPage {
    constructor() {
        this.cartItems = [];
        this.selectedItems = new Set();
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
        await this.loadCart();
    }

    bindEvents() {
        // 全选
        document.getElementById('selectAll')?.addEventListener('change', (e) => {
            this.handleSelectAll(e.target.checked);
        });

        // 结算
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.checkout();
        });
    }

    updateUserInfo() {
        const user = userState.getUser();
        const welcomeText = document.getElementById('welcomeText');
        
        console.log('✅ 当前用户信息:', user);
        
        if (welcomeText && user) {
            const username = user.username || user.email || '用户';
            welcomeText.textContent = `欢迎, ${username}`;
            console.log('✅ 用户名更新成功:', username);
        } else if (welcomeText) {
            welcomeText.textContent = '欢迎访客';
            console.log('⚠️ 未获取到用户信息');
        }
    }

    async loadCart() {
        try {
            const user = userState.getUser();
            const userId = user.userId;
            
            console.log('📦 加载购物车, userId:', userId);
            
            // ✅ 修改为后端的接口路径：GET /api/cart/{userId}
            const response = await api.get(`/api/cart/${userId}`);
            
            console.log('📦 购物车响应:', response);
            
            if (response.code === 1 && response.data) {
                // ✅ 后端返回 CartDTO，包含 items 数组
                this.cartItems = response.data.items || [];
                
                console.log('✅ 购物车项数:', this.cartItems.length);
                console.log('✅ 购物车详情:', this.cartItems);
                
                this.renderCart();
                this.updateSummary();
            } else {
                showToast(response.msg || '加载购物车失败', 'error');
            }
        } catch (error) {
            console.error('❌ 加载购物车失败:', error);
            showToast('加载购物车失败', 'error');
        }
    }

    renderCart() {
        const cartItemsEl = document.getElementById('cartItems');
        const emptyCartEl = document.getElementById('emptyCart');

        if (!this.cartItems || this.cartItems.length === 0) {
            cartItemsEl.innerHTML = '';
            emptyCartEl.style.display = 'block';
            document.getElementById('itemsCount').textContent = '0';
            return;
        }

        emptyCartEl.style.display = 'none';
        document.getElementById('itemsCount').textContent = this.cartItems.length;
        
        cartItemsEl.innerHTML = this.cartItems.map(item => this.createCartItemHTML(item)).join('');

        // 绑定复选框事件
        cartItemsEl.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = parseInt(e.target.dataset.cartId);
                if (e.target.checked) {
                    this.selectedItems.add(itemId);
                } else {
                    this.selectedItems.delete(itemId);
                }
                this.updateSummary();
                this.updateSelectAllState();
            });
        });

        // 绑定删除按钮
        cartItemsEl.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.cartId);
                this.removeItem(itemId);
            });
        });
    }

    createCartItemHTML(item) {
        const isSelected = this.selectedItems.has(item.cartId);
        
        // ✅ 根据后端 CartItemDTO 的字段适配
        const posterUrl = item.moviePoster;
        const movieTitle = item.movieName || item.movieTitle || '未知电影';
        const cinemaName = item.cinemaName || '';
        const hallName = item.hallName || '未指定';
        const screeningTime = item.showTime || item.screeningTime;
        const seatNumbers = item.seatNumbers || '-';  // 后端是 "A1,A2" 格式
        const price = item.price || 0;
        
        // ✅ 只有海报存在时才显示图片，否则只显示电影标题
        const movieImageHTML = posterUrl 
            ? `<img src="${posterUrl}" alt="${movieTitle}" class="movie-thumb">` 
            : '';
        
        return `
            <div class="cart-item-row">
                <div class="cart-item-select">
                    <label class="item-checkbox-label">
                        <input type="checkbox" class="item-checkbox" 
                               data-cart-id="${item.cartId}" 
                               ${isSelected ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                    </label>
                </div>

                <div class="cart-item-movie">
                    ${movieImageHTML}
                    <div class="movie-details">
                        <h4 class="movie-title">${movieTitle}</h4>
                        <p class="movie-extra">${cinemaName}</p>
                    </div>
                </div>

                <div class="cart-item-screening">
                    <div class="screening-detail">
                        <span class="screening-hall">${hallName}</span>
                        <span class="screening-time">${formatDateTime(screeningTime)}</span>
                    </div>
                </div>

                <div class="cart-item-seat">
                    <span class="seat-badge">${seatNumbers}</span>
                </div>

                <div class="cart-item-price">
                    <span class="price-value">¥${Number(price).toFixed(2)}</span>
                </div>

                <div class="cart-item-action">
                    <button class="btn-remove" data-cart-id="${item.cartId}" title="删除">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `;
    }

    handleSelectAll(checked) {
        this.selectedItems.clear();
        if (checked) {
            this.cartItems.forEach(item => this.selectedItems.add(item.cartId));
        }
        
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
        
        this.updateSummary();
    }

    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = 
                this.cartItems.length > 0 && 
                this.selectedItems.size === this.cartItems.length;
        }
    }

    updateSummary() {
        const selectedCount = this.selectedItems.size;
        const subtotal = this.cartItems
            .filter(item => this.selectedItems.has(item.cartId))
            .reduce((sum, item) => {
                const itemTotal = Number(item.totalPrice) || 0;  // ✅ 使用 totalPrice
                return sum + itemTotal;
            }, 0);

        document.getElementById('selectedCount').textContent = selectedCount;
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('totalPrice').textContent = subtotal.toFixed(2);

        // 更新结算按钮状态
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = selectedCount === 0;
        }
    }

    async removeItem(itemId) {
        if (!confirm('确定要删除这个商品吗？')) return;

        try {
            const response = await api.delete(`/api/cart/${itemId}`);
            if (response.code === 1) {
                showToast('删除成功', 'success');
                this.selectedItems.delete(itemId);
                await this.loadCart();
            } else {
                showToast(response.msg || '删除失败', 'error');
            }
        } catch (error) {
            console.error('❌ 删除失败:', error);
            showToast('删除失败', 'error');
        }
    }

    async checkout() {
        if (this.selectedItems.size === 0) {
            showToast('请选择要结算的商品', 'warning');
            return;
        }

        const selectedItemIds = Array.from(this.selectedItems);
        
        // 跳转到支付页面
        sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItemIds));
        window.location.href = 'payment.html';
    }
}

// 退出登录函数
function logout(event) {
    if (event) event.preventDefault();
    
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        userState.clearUser();
        window.location.href = 'login.html';
    }
}

// 导出给 HTML 全局使用
window.logout = logout;

// 初始化页面
function initCartPage() {
    console.log('🔍 开始初始化购物车页面');
    new CartPage();
    console.log('✅ 购物车页面初始化完成');
}

if (document.readyState === 'loading') {
    console.log('⏳ 等待 DOM 加载...');
    document.addEventListener('DOMContentLoaded', initCartPage);
} else {
    console.log('✅ DOM 已加载，立即初始化');
    initCartPage();
}