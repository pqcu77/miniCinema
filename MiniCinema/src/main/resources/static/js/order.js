class OrderManager {
    constructor(userId) {
        this.userId = userId;
    }
    
    async createOrder() {
        const response = await OrderAPI.createOrder(this.userId);
        if (response.code === 200) {
            const order = response.data;
            alert('订单创建成功，订单号: ' + order.orderNumber);
            window.location.href = `/payment.html?orderId=${order.orderId}`;
        }
    }
    
    async loadUserOrders() {
        const response = await OrderAPI.getUserOrders(this.userId);
        if (response.code === 200) {
            this.renderOrders(response.data);
        }
    }
    
    renderOrders(orders) {
        const orderList = document.getElementById('order-list');
        
        if (!orders || orders.length === 0) {
            orderList.innerHTML = '<p>暂无订单</p>';
            return;
        }
        
        let html = '';
        orders.forEach(order => {
            const statusText = this.getStatusText(order.status);
            html += `
                <div class="order-item">
                    <div class="order-header">
                        <span>订单号: ${order.orderNumber}</span>
                        <span class="status">${statusText}</span>
                    </div>
                    <div class="order-body">
                        <p>总金额: ¥${order.totalAmount}</p>
                        <p>创建时间: ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="order-footer">
                        <button onclick="orderManager.viewOrderDetail(${order.orderId})">查看详情</button>
                        ${order.status === 0 ? `<button onclick="orderManager.cancelOrder(${order.orderId})">取消订单</button>` : ''}
                    </div>
                </div>
            `;
        });
        
        orderList.innerHTML = html;
    }
    
    async cancelOrder(orderId) {
        if (confirm('确定取消订单吗？')) {
            const response = await OrderAPI.cancelOrder(orderId);
            if (response.code === 200) {
                alert('订单已取消');
                await this.loadUserOrders();
            }
        }
    }
    
    viewOrderDetail(orderId) {
        window.location.href = `/order-detail.html?orderId=${orderId}`;
    }
    
    getStatusText(status) {
        const statusMap = { 0: '待支付', 1: '已支付', 2: '已取消' };
        return statusMap[status] || '未知';
    }
}

let orderManager;
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        orderManager = new OrderManager(userId);
    }
});

let cartData = [];
let totalPrice = 0;

// 页面加载
document.addEventListener('DOMContentLoaded', () => {
    loadOrderData();
});

// 加载订单数据
async function loadOrderData() {
    try {
        const res = await cartAPI.list();
        if (res.code === 0) {
            cartData = res.data || [];
            renderOrderInfo();
        }
    } catch (error) {
        console.error('加载订单数据出错:', error);
        Utils.showMessage('加载订单数据出错', 'error');
    }
}

// 渲染订单信息
function renderOrderInfo() {
    const orderInfoDiv = document.getElementById('orderInfo');
    let html = '';

    cartData.forEach(item => {
        html += `
            <div class="order-info">
                <p><strong>电影:</strong> ${item.movieName || '电影名称'}</p>
                <p><strong>放映场次:</strong> ${Utils.formatDate(item.screeningTime)}</p>
                <p><strong>座位:</strong> ${(item.seatIds || []).join(', ')}</p>
                <p><strong>数量:</strong> ${item.quantity || 0}</p>
                <p><strong>价格:</strong> ${Utils.formatPrice((item.price || 0) * (item.quantity || 0))}</p>
            </div>
        `;

        totalPrice += (item.price || 0) * (item.quantity || 0);
    });

    orderInfoDiv.innerHTML = html;
    document.getElementById('subtotal').textContent = Utils.formatPrice(totalPrice);
    document.getElementById('totalAmount').textContent = Utils.formatPrice(totalPrice);
}

// 返回修改
function goBack() {
    window.history.back();
}

// 提交订单
async function submitOrder() {
    const receiverName = document.getElementById('receiverName').value.trim();
    const receiverPhone = document.getElementById('receiverPhone').value.trim();
    const receiverEmail = document.getElementById('receiverEmail').value.trim();

    if (!receiverName || !receiverPhone || !receiverEmail) {
        Utils.showMessage('请填写完整的收货信息', 'error');
        return;
    }

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(receiverPhone)) {
        Utils.showMessage('手机号格式不正确', 'error');
        return;
    }

    // 验证邮箱
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail)) {
        Utils.showMessage('邮箱格式不正确', 'error');
        return;
    }

    try {
        const orderDTO = {
            userId: getUserId(),
            items: cartData,
            totalPrice: totalPrice,
            receiverName: receiverName,
            receiverPhone: receiverPhone,
            receiverEmail: receiverEmail
        };

        const res = await orderAPI.create(orderDTO);
        if (res.code === 0) {
            Utils.showMessage('订单创建成功', 'success');
            // 跳转到支付页面，传递订单ID
            window.location.href = `/templates/payment.html?orderId=${res.data.id}`;
        } else {
            Utils.showMessage(res.msg || '创建订单失败', 'error');
        }
    } catch (error) {
        console.error('提交订单出错:', error);
        Utils.showMessage('提交订单出错', 'error');
    }
}