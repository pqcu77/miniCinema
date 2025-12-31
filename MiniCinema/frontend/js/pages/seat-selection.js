import userState from '../userState.js';
import { showMessage } from '../utils.js'; 
import { API_BASE_URL } from '../api.js';

// ✅ 在本文件中定义日期格式化函数（不依赖utils.js）
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ✅ 创建与原utils.js兼容的showToast函数
function showToast(message, type = 'info', duration = 3000) {
    // 调用现有的showMessage函数
    showMessage(message, type, duration);
}

class SeatSelectionPage {
    constructor() {
        this.screeningId = null;
        this.userId = null;
        this.screeningData = null;
        this.seatStatusList = [];
        this.selectedSeats = new Map(); // seatId -> SeatStatusDTO
        this.lockedByOtherSeats = new Set(); // 被其他用户锁定的座位
        this.countdownIntervals = new Map(); // seatId -> countdownInterval
        
        this.init();
    }

    async init() {
        // 检查登录状态
        if (!userState.isLoggedIn()) {
            showToast('请先登录', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        const user = userState.getUser();
        this.userId = user.userId;

        this.updateUserInfo();
        this.extractScreeningId();
        
        if (!this.extractScreeningId()) {
            showToast('缺少场次ID', 'error');
            setTimeout(() => history.back(), 1500);
            return;
        }

        // 加载数据
        await this.loadScreeningData();
        this.renderSeats();
        this.bindEvents();
        
        // 定期刷新座位状态（每5秒检查一次，看是否有座位被其他用户锁定）
        setInterval(() => this.refreshSeatStatus(), 5000);
    }

    updateUserInfo() {
        const user = userState.getUser();
        const welcomeText = document.getElementById('welcomeText');
        
        if (welcomeText && user) {
            const username = user.username || user.email || '用户';
            welcomeText.textContent = `欢迎, ${username}`;
        }
    }

    extractScreeningId() {
        const urlParams = new URLSearchParams(window.location.search);
        this.screeningId = parseInt(urlParams.get('screeningId'));
        
        console.log('📍 当前URL:', window.location.href);
        console.log('📍 URL参数screeningId:', urlParams.get('screeningId'));
        console.log('📍 解析后的screeningId:', this.screeningId);
        
        if (!this.screeningId || isNaN(this.screeningId)) {
            console.error('❌ screeningId无效!');
            return false;
        }
        return true;  // ✅ 返回true表示成功
    }

    async loadScreeningData() {
        try {
            const url = `${API_BASE_URL}/api/seats/screening/${this.screeningId}?userId=${this.userId}`;
            
            console.log('🌐 发送请求:', url);
            
            const response = await fetch(url);
            
            // ✅ 检查HTTP状态
            if (!response.ok) {
                console.error('❌ HTTP错误:', response.status, response.statusText);
                showToast(`请求失败: ${response.status}`, 'error');
                return;
            }
            
            const result = await response.json();
            
            console.log('📦 后端返回数据:', result);
            
            if (result.code === 1 && result.data) {
                this.screeningData = result.data;
                this.seatStatusList = result.data.seats || [];
                
                console.log('✅ 场次信息:', this.screeningData);
                console.log('✅ 座位列表长度:', this.seatStatusList.length);
                
                if (this.seatStatusList.length === 0) {
                    console.warn('⚠️ 警告: 座位列表为空!');
                }
                
                console.log('✅ 座位详细信息:', this.seatStatusList);
                
                this.updateScreeningInfo();
            } else {
                console.error('❌ 后端返回错误:', result.msg || '未知错误');
                showToast(result.msg || '加载场次信息失败', 'error');
            }
        } catch (error) {
            console.error('❌ 网络错误:', error);
            showToast('加载场次信息失败: ' + error.message, 'error');
        }
    }

    async refreshSeatStatus() {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/seats/screening/${this.screeningId}?userId=${this.userId}`
            );
            const result = await response.json();
            
            if (result.code === 1) {
                const newSeatStatusList = result.data.seats || [];
                this.updateSeatStatuses(newSeatStatusList);
            }
        } catch (error) {
            console.error('刷新座位状态失败:', error);
        }
    }

    updateSeatStatuses(newSeatStatusList) {
        // 更新座位状态并重新渲染受影响的座位
        const oldStatusMap = new Map(this.seatStatusList.map(s => [s.seatId, s]));
        const newStatusMap = new Map(newSeatStatusList.map(s => [s.seatId, s]));

        newSeatStatusList.forEach(newStatus => {
            const oldStatus = oldStatusMap.get(newStatus.seatId);
            
            // 如果状态发生变化，更新座位元素
            if (!oldStatus || oldStatus.status !== newStatus.status) {
                const seatEl = document.querySelector(`[data-seat-id="${newStatus.seatId}"]`);
                if (seatEl) {
                    this.updateSeatElement(seatEl, oldStatus, newStatus);
                }
            }
        });

        this.seatStatusList = newSeatStatusList;
    }

    updateSeatElement(seatEl, oldStatus, newStatus) {
        // 移除旧的状态类
        if (oldStatus) {
            seatEl.classList.remove(
                'available', 'occupied', 'locked', 'locked-by-self', 'locked-by-other', 'selected'
            );
        }

        // 添加新的状态类和绑定事件
        const statusMap = {
            'AVAILABLE': 'available',
            'SOLD': 'locked-by-other',
            'LOCKED_BY_SELF': 'locked-by-self',
            'LOCKED_BY_OTHER': 'locked-by-other',
            'LOCKED': 'locked-by-other',     // ✅ 通用锁定
            'BROKEN': 'occupied'
        };

        const className = statusMap[newStatus.status] || 'occupied';
        seatEl.classList.add(className);

        // 更新禁用状态
        const shouldDisable = ['SOLD', 'LOCKED_BY_OTHER', 'LOCKED','BROKEN'].includes(newStatus.status);
        seatEl.disabled = shouldDisable;

        // 移除旧的点击事件监听器
        seatEl.onclick = null;

        // 根据新状态添加点击事件
        if (newStatus.status === 'AVAILABLE') {
            seatEl.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSeatSelection(newStatus);
            });
        } else if ((newStatus.status === 'LOCKED_BY_OTHER' || newStatus.status === 'LOCKED') && newStatus.remainingSeconds) {
            // 更新倒计时
            this.startCountdown(seatEl, newStatus.seatId, newStatus.remainingSeconds);
        }
    }

    updateScreeningInfo() {
        if (!this.screeningData) return;

        const screeningTime = new Date(this.screeningData.screenTime);
        const dateStr = `${screeningTime.getFullYear()}-${String(screeningTime.getMonth() + 1).padStart(2, '0')}-${String(screeningTime.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(screeningTime.getHours()).padStart(2, '0')}:${String(screeningTime.getMinutes()).padStart(2, '0')}`;

        // 更新场次信息
        document.getElementById('movieTitle').textContent = this.screeningData.movieTitle || '-';
        document.getElementById('cinemaName').textContent = this.screeningData.cinemaName || '-';
        document.getElementById('screeningDate').textContent = dateStr;
        document.getElementById('screeningTime').textContent = timeStr;
        document.getElementById('detailHallName').textContent = this.screeningData.hallName || '-';
        document.getElementById('ticketPrice').textContent = (this.screeningData.price || 0).toFixed(2);
        document.getElementById('unitPrice').textContent = (this.screeningData.price || 0).toFixed(2);

        // 更新影厅信息
        document.getElementById('hallName').textContent = this.screeningData.hallName || '未知影厅';
        document.getElementById('hallCapacity').textContent = `总座位: ${this.seatStatusList.length}`;
    }

    renderSeats() {
        const seatsGrid = document.getElementById('seatsGrid');
        seatsGrid.innerHTML = '';

        if (this.seatStatusList.length === 0) {
            seatsGrid.innerHTML = '<p class="no-seats">暂无座位信息</p>';
            return;
        }

        // 按行号和列号排序
        const sortedSeats = [...this.seatStatusList].sort((a, b) => {
            const rowA = a.seatLabel.charCodeAt(0); // 获取行号的字符码
            const rowB = b.seatLabel.charCodeAt(0);
            if (rowA !== rowB) {
                return rowA - rowB;
            }
            return a.colNum - b.colNum;
        });

        // 分组显示
        let currentRow = null;
        let rowContainer = null;

        sortedSeats.forEach(seat => {
            const rowLabel = seat.seatLabel.charAt(0); // A, B, C, ...

            // 创建新行
            if (rowLabel !== currentRow) {
                currentRow = rowLabel;
                rowContainer = document.createElement('div');
                rowContainer.className = 'seat-row';
                
                // 添加行号标签
                const rowLabelEl = document.createElement('span');
                rowLabelEl.className = 'row-label';
                rowLabelEl.textContent = rowLabel;
                rowContainer.appendChild(rowLabelEl);

                seatsGrid.appendChild(rowContainer);
            }

            // 创建座位元素
            const seatElement = this.createSeatElement(seat);
            rowContainer.appendChild(seatElement);
        });
    }

    createSeatElement(seat) {
        const seatEl = document.createElement('button');
        seatEl.className = 'seat';
        seatEl.textContent = seat.colNum;
        seatEl.dataset.seatId = seat.seatId;
        seatEl.dataset.seatLabel = seat.seatLabel;
        seatEl.title = seat.seatLabel;

        // 根据状态设置样式和事件
        this.applySeatStatus(seatEl, seat);

        return seatEl;
    }

    applySeatStatus(seatEl, seat) {
        const statusMap = {
            'AVAILABLE': { class: 'available', disabled: false },
            'SOLD': { class: 'locked-by-other', disabled: true },
            'LOCKED_BY_SELF': { class: 'locked-by-self', disabled: false },
            'LOCKED_BY_OTHER': { class: 'locked-by-other', disabled: true },
            'LOCKED': { class: 'locked-by-other', disabled: true },
            'BROKEN': { class: 'occupied', disabled: true }
        };

        const statusConfig = statusMap[seat.status] || statusMap['BROKEN'];
        seatEl.classList.add(statusConfig.class);
        seatEl.disabled = statusConfig.disabled;

        // 绑定点击事件
        if (seat.status === 'AVAILABLE') {
            seatEl.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSeatSelection(seat);
            });
        } else if (seat.status === 'LOCKED_BY_SELF') {
            // 允许当前用户点击自己锁定的座位来取消选择
            seatEl.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSeatSelection(seat);
            });
            seatEl.disabled = false;
        } else if ((seat.status === 'LOCKED_BY_OTHER' || seat.status === 'LOCKED') && seat.remainingSeconds){
            // 显示倒计时
            this.startCountdown(seatEl, seat.seatId, seat.remainingSeconds);
        }
    }

    startCountdown(seatEl, seatId, remainingSeconds) {
        // 清除旧的倒计时
        if (this.countdownIntervals.has(seatId)) {
            clearInterval(this.countdownIntervals.get(seatId));
        }

        let timeLeft = remainingSeconds;

        const updateDisplay = () => {
            if (timeLeft <= 0) {
                seatEl.textContent = seatEl.dataset.colNum;
                clearInterval(this.countdownIntervals.get(seatId));
                this.countdownIntervals.delete(seatId);
                return;
            }

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            seatEl.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
            timeLeft--;
        };

        updateDisplay();
        const interval = setInterval(updateDisplay, 1000);
        this.countdownIntervals.set(seatId, interval);
    }

    toggleSeatSelection(seat) {
        const seatEl = document.querySelector(`[data-seat-id="${seat.seatId}"]`);
        
        if (this.selectedSeats.has(seat.seatId)) {
            // 取消选择
            this.selectedSeats.delete(seat.seatId);
            seatEl.classList.remove('selected');
        } else {
            // 选择座位
            if (this.selectedSeats.size >= 10) {
                showToast('单次最多只能选择10个座位', 'warning');
                return;
            }
            this.selectedSeats.set(seat.seatId, seat);
            seatEl.classList.add('selected');
        }

        this.updateSelectedDisplay();
    }

    updateSelectedDisplay() {
        const selectedCount = this.selectedSeats.size;
        document.getElementById('selectedCount').textContent = selectedCount;

        // 更新已选座位显示
        const selectedSeatsEl = document.getElementById('selectedSeats');
        if (selectedCount === 0) {
            selectedSeatsEl.innerHTML = '<p class="no-selected">还未选择座位</p>';
        } else {
            const seatLabels = Array.from(this.selectedSeats.values())
                .map(seat => seat.seatLabel)
                .sort();

            selectedSeatsEl.innerHTML = `
                <div class="selected-seats-list">
                    ${seatLabels.map(label => `<span class="seat-tag">${label}</span>`).join('')}
                </div>
            `;
        }

        // 更新价格统计
        const unitPrice = this.screeningData.price || 0;
        const totalPrice = unitPrice * selectedCount;

        document.getElementById('seatCount').textContent = selectedCount;
        document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);

        // 启用/禁用确认按钮
        const confirmBtn = document.getElementById('confirmBtn');
        confirmBtn.disabled = selectedCount === 0;
    }

    bindEvents() {
        // 确认购票按钮
        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.confirmSelection();
        });
    }

    async confirmSelection() {
        if (this.selectedSeats.size === 0) {
            showToast('请先选择座位', 'warning');
            return;
        }

        const confirmBtn = document.getElementById('confirmBtn');
        confirmBtn.disabled = true;
        confirmBtn.textContent = '处理中...';

        try {
            // 1. 锁定座位（15分钟）
            const lockResponse = await this.lockSeats();
            if (!lockResponse) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '确认购票';
                return;
            }

            // 2. 添加到购物车
            const cartResponse = await this.addToCart();
            if (!cartResponse) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = '确认购票';
                return;
            }

            showToast('已添加到购物车！', 'success');
            
            // 3. 跳转到购物车
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1500);

        } catch (error) {
            console.error('确认选择失败:', error);
            showToast('确认选择失败', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = '确认购票';
        }
    }

    async lockSeats() {
        try {
            const seatIds = Array.from(this.selectedSeats.keys());

            const response = await fetch(`${API_BASE_URL}/api/seats/lock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userState.getUser().token || localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    screeningId: this.screeningId,
                    seatIds: seatIds,
                    userId: this.userId
                })
            });

            const result = await response.json();

            if (result.code === 1) {
                console.log('座位锁定成功:', result.data);
                showToast('座位锁定成功，请在15分钟内完成支付', 'success');
                return true;
            } else {
                showToast(result.msg || '座位锁定失败，请重试', 'error');
                return false;
            }
        } catch (error) {
            console.error('座位锁定失败:', error);
            showToast('座位锁定失败', 'error');
            return false;
        }
    }

    async addToCart() {
        try {
            const seatIds = Array.from(this.selectedSeats.keys());
            
            // ✅ 收集座位编号，用逗号分隔
            const seatCodes = Array.from(this.selectedSeats.values())
                .map(seat => seat.seatLabel)
                .join(',');  // 例如: "A1,A2,A3"
            
            console.log('📤 添加到购物车参数:');
            console.log('   userId:', this.userId);
            console.log('   screeningId:', this.screeningId);
            console.log('   seatNumbers:', seatCodes);
            console.log('   quantity:', seatIds.length);

            // ✅ 改用后端的 /add 接口，使用 URLSearchParams
            const params = new URLSearchParams({
                userId: this.userId,
                screeningId: this.screeningId,
                seatNumbers: seatCodes,
                quantity: seatIds.length
            });

            const response = await fetch(`${API_BASE_URL}/api/cart/add?${params.toString()}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userState.getToken()}`
                }
            });

            const result = await response.json();

            if (result.code === 1) {
                console.log('✅ 购物车添加成功');
                return true;
            } else {
                showToast(result.msg || '添加到购物车失败', 'error');
                return false;
            }
        } catch (error) {
            console.error('❌ 添加到购物车失败:', error);
            showToast('添加到购物车失败', 'error');
            return false;
        }
    }

    destroy() {
        // 清理倒计时定时器
        this.countdownIntervals.forEach(interval => clearInterval(interval));
        this.countdownIntervals.clear();
    }
}

// 退出登录
function logout(event) {
    if (event) event.preventDefault();
    if (confirm('确定要退出登录吗？')) {
        const seatPage = window.seatPage;
        if (seatPage) {
            seatPage.destroy();
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (window.seatPage) {
        window.seatPage.destroy();
    }
});

// 页面加载时初始化
window.seatPage = new SeatSelectionPage();