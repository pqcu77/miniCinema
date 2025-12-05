class CartManager {
    constructor(userId) {
        this.userId = userId;
        this.cart = [];
    }
    
    async loadCart() {
        const response = await CartAPI.getCart(this.userId);
        if (response.code === 200) {
            this.cart = response.data.items || [];
            this.render();
        }
    }
    
    async addToCart(screeningId, seatNumbers, quantity) {
        const response = await CartAPI.addToCart(this.userId, screeningId, seatNumbers, quantity);
        if (response.code === 200) {
            alert('添加成功');
            await this.loadCart();
        }
    }
    
    async removeFromCart(cartId) {
        if (confirm('确定删除吗？')) {
            const response = await CartAPI.removeFromCart(cartId);
            if (response.code === 200) {
                await this.loadCart();
            }
        }
    }
    
    async clearCart() {
        if (confirm('确定清空购物车吗？')) {
            const response = await CartAPI.clearCart(this.userId);
            if (response.code === 200) {
                await this.loadCart();
            }
        }
    }
    
    render() {
        const cartList = document.getElementById('cart-list');
        const totalAmount = document.getElementById('total-amount');
        
        if (!this.cart || this.cart.length === 0) {
            cartList.innerHTML = '<p>购物车为空</p>';
            totalAmount.textContent = '¥0';
            return;
        }
        
        let html = '';
        let total = 0;
        
        this.cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="item-info">
                        <h3>${item.movieName}</h3>
                        <p>场次: ${item.showTime}</p>
                        <p>座位: ${item.seatNumbers}</p>
                        <p>票数: ${item.quantity}</p>
                    </div>
                    <div class="item-price">
                        <p>¥${item.totalPrice}</p>
                        <button onclick="cartManager.removeFromCart(${item.cartId})">删除</button>
                    </div>
                </div>
            `;
            total += parseFloat(item.totalPrice);
        });
        
        cartList.innerHTML = html;
        totalAmount.textContent = '¥' + total.toFixed(2);
    }
}

let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        cartManager = new CartManager(userId);
        cartManager.loadCart();
    }
});

let cartData = [];

// 页面加载
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

// 加载购物车
async function loadCart() {
    try {
        const res = await cartAPI.list();
        if (res.code === 0) {
            cartData = res.data || [];
            if (cartData.length === 0) {
                document.getElementById('emptyCart').style.display = 'block';
                document.getElementById('cartContent').style.display = 'none';
            } else {
                document.getElementById('emptyCart').style.display = 'none';
                document.getElementById('cartContent').style.display = 'block';
                renderCart();
            }
        } else {
            Utils.showMessage(res.msg || '加载购物车失败', 'error');
        }
    } catch (error) {
        console.error('加载购物车出错:', error);
        Utils.showMessage('加载购物车出错', 'error');
    }
}

// 渲染购物车
function renderCart() {
    const tbody = document.getElementById('cartBody');
    tbody.innerHTML = '';

    cartData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.movieName || '电影名称'}</td>
            <td>${Utils.formatDate(item.screeningTime)}</td>
            <td>${(item.seatIds || []).join(', ')}</td>
            <td>${Utils.formatPrice(item.price || 0)}</td>
            <td>${item.quantity || 0}</td>
            <td>${Utils.formatPrice((item.price || 0) * (item.quantity || 0))}</td>
            <td>
                <button class="btn-remove" onclick="removeCartItem(${item.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    calculateTotal();
}

// 计算总价
function calculateTotal() {
    let itemCount = 0;
    let totalPrice = 0;

    cartData.forEach(item => {
        itemCount += item.quantity || 0;
        totalPrice += (item.price || 0) * (item.quantity || 0);
    });

    document.getElementById('itemCount').textContent = itemCount;
    document.getElementById('totalPrice').textContent = Utils.formatPrice(totalPrice);
}

// 删除购物车项
async function removeCartItem(cartId) {
    if (!confirm('确定要删除此项吗？')) return;

    try {
        const res = await cartAPI.remove(cartId);
        if (res.code === 0) {
            Utils.showMessage('删除成功', 'success');
            loadCart();
        } else {
            Utils.showMessage(res.msg || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除出错:', error);
        Utils.showMessage('删除出错', 'error');
    }
}

// 清空购物车
async function clearCart() {
    if (!confirm('确定要清空购物车吗？')) return;

    try {
        const res = await cartAPI.clear();
        if (res.code === 0) {
            Utils.showMessage('清空成功', 'success');
            loadCart();
        } else {
            Utils.showMessage(res.msg || '清空失败', 'error');
        }
    } catch (error) {
        console.error('清空出错:', error);
        Utils.showMessage('清空出错', 'error');
    }
}

// 结算
function checkout() {
    if (cartData.length === 0) {
        Utils.showMessage('购物车为空', 'error');
        return;
    }

    // 重定向到订单确认页面
    window.location.href = '/templates/order-confirm.html';
}