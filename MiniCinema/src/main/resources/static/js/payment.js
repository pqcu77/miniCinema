class PaymentManager {
    async initiatePayment(orderId, paymentMethod) {
        const response = await PaymentAPI.initiatePayment(orderId, paymentMethod);
        if (response.code === 200) {
            const payment = response.data;
            alert(`支付方式: ${payment.paymentMethod}\n金额: ¥${payment.amount}`);
            // TODO: 调用第三方支付SDK
            // 支付宝或微信支付
        }
    }
    
    async verifyPayment(transactionId) {
        const response = await PaymentAPI.verifyPayment(transactionId);
        if (response.code === 200) {
            alert('支付成功');
            window.location.href = '/ticket-display.html';
        }
    }
    
    async checkPaymentStatus(orderNumber) {
        const response = await PaymentAPI.getPaymentStatus(orderNumber);
        if (response.code === 200) {
            const payment = response.data;
            console.log('支付状态: ' + payment.paymentStatus);
        }
    }
}

let paymentManager;
document.addEventListener('DOMContentLoaded', () => {
    paymentManager = new PaymentManager();
    
    // 从 URL 获取 orderId
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId) {
        document.getElementById('orderId').value = orderId;
    }
});

let currentOrderId = '';
let currentPaymentMethod = '';
let qrcodeInstance = null;

// 页面加载
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    currentOrderId = params.get('orderId');

    if (!currentOrderId) {
        Utils.showMessage('订单ID不存在', 'error');
        return;
    }

    loadOrderInfo();
});

// 加载订单信息
async function loadOrderInfo() {
    try {
        const res = await orderAPI.get(currentOrderId);
        if (res.code === 0) {
            const order = res.data;
            document.getElementById('orderId').textContent = order.id;
            document.getElementById('payAmount').textContent = Utils.formatPrice(order.totalPrice);
        } else {
            Utils.showMessage(res.msg || '加载订单信息失败', 'error');
        }
    } catch (error) {
        console.error('加载订单信息出错:', error);
        Utils.showMessage('加载订单信息出错', 'error');
    }
}

// 选择支付方式
function selectPayment(method) {
    currentPaymentMethod = method;
    document.getElementById(method).checked = true;

    // 如果选择微信支付，显示二维码
    if (method === 'wechat') {
        document.getElementById('qrcodeContainer').style.display = 'block';
        generateQRCode();
    } else {
        document.getElementById('qrcodeContainer').style.display = 'none';
    }
}

// 生成二维码
function generateQRCode() {
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = ''; // 清空之前的二维码

    // 使用 QRCode.js 库生成二维码
    // 生成支付链接或支付二维码
    const paymentUrl = `weixin://pay?orderId=${currentOrderId}`;

    qrcodeInstance = new QRCode(qrcodeDiv, {
        text: paymentUrl,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// 返回支付页面
function goBackPayment() {
    window.history.back();
}

// 确认支付
async function confirmPayment() {
    if (!currentPaymentMethod) {
        Utils.showMessage('请选择支付方式', 'error');
        return;
    }

    try {
        const paymentDTO = {
            orderId: currentOrderId,
            paymentMethod: currentPaymentMethod
        };

        // 根据支付方式处理
        if (currentPaymentMethod === 'alipay') {
            // 支付宝支付
            handleAlipayPayment(paymentDTO);
        } else if (currentPaymentMethod === 'wechat') {
            // 微信支付
            Utils.showMessage('请扫描二维码完成支付', 'info');
            handleWechatPayment(paymentDTO);
        } else if (currentPaymentMethod === 'card') {
            // 银行卡支付
            handleCardPayment(paymentDTO);
        }
    } catch (error) {
        console.error('支付出错:', error);
        Utils.showMessage('支付出错', 'error');
    }
}

// 支付宝支付
async function handleAlipayPayment(paymentDTO) {
    try {
        const res = await paymentAPI.pay(paymentDTO);
        if (res.code === 0) {
            // 跳转到支付宝支付页面
            // window.location.href = res.data;
            Utils.showMessage('支付成功', 'success');
            setTimeout(() => {
                window.location.href = `/templates/my-tickets.html?orderId=${currentOrderId}`;
            }, 1500);
        } else {
            Utils.showMessage(res.msg || '支付失败', 'error');
        }
    } catch (error) {
        console.error('支付宝支付出错:', error);
        Utils.showMessage('支付宝支付出错', 'error');
    }
}

// 微信支付
async function handleWechatPayment(paymentDTO) {
    try {
        const res = await paymentAPI.pay(paymentDTO);
        if (res.code === 0) {
            // 轮询检查支付状态
            checkPaymentStatus();
        } else {
            Utils.showMessage(res.msg || '微信支付失败', 'error');
        }
    } catch (error) {
        console.error('微信支付出错:', error);
        Utils.showMessage('微信支付出错', 'error');
    }
}

// 银行卡支付
async function handleCardPayment(paymentDTO) {
    try {
        const res = await paymentAPI.pay(paymentDTO);
        if (res.code === 0) {
            Utils.showMessage('支付成功', 'success');
            setTimeout(() => {
                window.location.href = `/templates/my-tickets.html?orderId=${currentOrderId}`;
            }, 1500);
        } else {
            Utils.showMessage(res.msg || '支付失败', 'error');
        }
    } catch (error) {
        console.error('银行卡支付出错:', error);
        Utils.showMessage('银行卡支付出错', 'error');
    }
}

// 检查支付状态
let checkCount = 0;
function checkPaymentStatus() {
    if (checkCount > 60) {
        // 60 秒后停止检查
        Utils.showMessage('支付超时，请重试', 'error');
        return;
    }

    setTimeout(async () => {
        try {
            const res = await orderAPI.get(currentOrderId);
            if (res.code === 0 && res.data.status === 1) {
                // 支付成功
                Utils.showMessage('支付成功', 'success');
                setTimeout(() => {
                    window.location.href = `/templates/my-tickets.html?orderId=${currentOrderId}`;
                }, 1500);
            } else {
                checkCount++;
                checkPaymentStatus();
            }
        } catch (error) {
            console.error('检查支付状态出错:', error);
            checkCount++;
            checkPaymentStatus();
        }
    }, 1000);
}