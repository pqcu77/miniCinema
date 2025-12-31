import api from '../api.js';
import userState from '../userState.js';
import { showMessage, formatDateTime } from '../utils.js';

function showToast(message, type = 'info', duration = 3000) {
    showMessage(message, type, duration);
}

class TicketsPage {
    constructor() {
        this.tickets = [];
        this.currentStatus = 'UNUSED';
        this.init();
    }

    async init() {
        if (!userState.isLoggedIn()) {
            showToast('请先登录', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        this.bindEvents();
        await this.loadTickets();
        this.updateUserInfo();
    }

    bindEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentStatus = e.target.dataset.status;
                this.filterAndRenderTickets();
            });
        });

        // 退出登录
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            userState.logout();
            window.location.href = 'login.html';
        });

        // 点击弹窗外部关闭
        document.getElementById('ticketModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'ticketModal') {
                e.target.style.display = 'none';
            }
        });
    }

    updateUserInfo() {
        const user = userState.getUser();
        const usernameEl = document.getElementById('username');
        if (usernameEl && user) {
            usernameEl.textContent = user.username || user.email;
        }
    }

    async loadTickets() {
        try {
            console.log('🎫 开始加载票据...');
            
            const response = await api.ticket.getUserTickets();
            
            console.log('📦 票据响应:', response);
            console.log('📦 响应码:', response.code);
            console.log('📦 响应数据:', response.data);
            
            // ✅ 修复：兼容 code: 1（后端实际返回）和 code: 200
            if (response.code === 1 || response.code === 200) {
                this.tickets = response.data || [];
                console.log('✅ 票据数量:', this.tickets.length);
                
                if (this.tickets.length > 0) {
                    console.log('🎫 第一张票数据:', this.tickets[0]);
                }
                
                this.filterAndRenderTickets();
            } else {
                console.error('❌ 响应失败:', response.msg);
                showToast(response.msg || '加载票夹失败', 'error');
            }
        } catch (error) {
            console.error('❌ 加载票夹失败:', error);
            console.error('❌ 错误详情:', error.message);
            showToast('加载票夹失败', 'error');
        }
    }

    filterAndRenderTickets() {
        const filteredTickets = this.tickets.filter(ticket => {
            // ✅ 后端 status: 0=未核销, 1=已核销
            const isUsed = ticket.status === 1;
            const isExpired = this.isExpired(ticket.showTime);
            
            if (this.currentStatus === 'UNUSED') {
                return !isUsed && !isExpired;
            } else if (this.currentStatus === 'USED') {
                return isUsed;
            } else if (this.currentStatus === 'EXPIRED') {
                return !isUsed && isExpired;
            }
            return false;
        });

        this.renderTickets(filteredTickets);
    }

    isExpired(showTime) {
        if (!showTime) return false;
        return new Date(showTime) < new Date();
    }

    renderTickets(tickets) {
        const ticketsListEl = document.getElementById('ticketsList');
        const emptyTicketsEl = document.getElementById('emptyTickets');

        if (!tickets || tickets.length === 0) {
            ticketsListEl.innerHTML = '';
            emptyTicketsEl.style.display = 'block';
            return;
        }

        emptyTicketsEl.style.display = 'none';
        ticketsListEl.innerHTML = tickets.map(ticket => this.createTicketHTML(ticket)).join('');

        // 绑定查看详情事件
        ticketsListEl.querySelectorAll('.ticket-card').forEach(card => {
            card.addEventListener('click', () => {
                const ticketId = parseInt(card.dataset.id);
                this.showTicketDetail(ticketId);
            });
        });
    }

    createTicketHTML(ticket) {
        const statusClass = this.getStatusClass(ticket);
        const statusText = this.getStatusText(ticket);
        
        // ✅ 修复字段映射（后端 TicketDTO -> 前端显示）
        const movieName = ticket.movieName || ticket.movieTitle || '未知电影';
        const cinemaName = ticket.cinemaName || '未知影院';
        const hallName = ticket.hallName || '未知影厅';
        const seatNumber = ticket.seatNumber || '-';
        /* const showTime = ticket.showTime || ticket.screeningTime;
        const ticketCode = ticket.ticketCode || ticket.ticketId; */
        const showTime = ticket.showTime;
        const ticketCode = ticket.ticketCode || '-';
        const seatDisplay = this.formatSeat(seatNumber);
        const timeDisplay = this.formatShowTime(showTime);

        return `
            <div class="ticket-card ${statusClass}" data-id="${ticket.ticketId}">
                <div class="ticket-header">
                    <div class="ticket-info">
                        <h3 class="ticket-title">🎬 ${movieName}</h3>
                        <div class="ticket-meta">
                            <p>📍 ${cinemaName}</p>
                            <p>🎭 ${hallName}</p>
                        </div>
                    </div>
                    <span class="ticket-status ${statusClass}">${statusText}</span>
                </div>
                <div class="ticket-details">
                    <div class="ticket-detail-item">
                        <span class="detail-label">🕐 放映时间</span>
                        <span class="detail-value">${timeDisplay}</span>
                    </div>
                    <div class="ticket-detail-item">
                        <span class="detail-label">💺 座位</span>
                        <span class="detail-value">${seatDisplay}</span>
                    </div>
                </div>
                <div class="ticket-code">
                    <div class="ticket-qr">
                        <div class="qr-code">🎫 取票码: ${ticketCode}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ✅ 格式化放映时间
    formatShowTime(showTime) {
        if (!showTime) {
            return '时间未知';
        }
        
        try {
            // 处理各种时间格式
            let date;
            if (typeof showTime === 'string') {
                // ISO 格式或其他字符串格式
                date = new Date(showTime);
            } else if (Array.isArray(showTime)) {
                // [2025, 1, 15, 14, 0] 数组格式
                date = new Date(showTime[0], showTime[1] - 1, showTime[2], showTime[3] || 0, showTime[4] || 0);
            } else {
                date = new Date(showTime);
            }
            
            if (isNaN(date.getTime())) {
                console.warn('⚠️ 无法解析时间:', showTime);
                return '时间未知';
            }
            
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${month}-${day} ${hours}:${minutes}`;
        } catch (e) {
            console.error('❌ 时间格式化错误:', e, showTime);
            return '时间未知';
        }
    }

    formatSeat(seatNumber) {
        if (!seatNumber || seatNumber === '-' || seatNumber.trim() === '') {
            return '未知';
        }
        if (seatNumber.length >= 2) {
            const row = seatNumber.charAt(0).toUpperCase();
            const num = seatNumber.substring(1);
            if (/^[A-Z]$/.test(row) && /^\d+$/.test(num)) {
                return `${row}排${num}座`;
            }
        }
        return seatNumber;
    }

    getStatusClass(ticket) {
        if (ticket.status === 1) return 'status-used';
        if (this.isExpired(ticket.showTime)) return 'status-expired';
        return 'status-unused';
    }

    getStatusText(ticket) {
        if (ticket.status === 1) return '已使用';
        if (this.isExpired(ticket.showTime)) return '已过期';
        return '未使用';
    }

    showTicketDetail(ticketId) {
        const ticket = this.tickets.find(t => t.ticketId === ticketId);
        if (!ticket) {
            console.error('❌ 未找到票据:', ticketId);
            return;
        }

        console.log('🎫 显示票据详情:', ticket);

        const modal = document.getElementById('ticketModal');
        const detailEl = document.getElementById('ticketDetail');

        // ✅ 修复字段映射
        const movieName = ticket.movieName || ticket.movieTitle || '未知电影';
        const cinemaName = ticket.cinemaName || '未知影院';
        const hallName = ticket.hallName || '未知影厅';
        const seatNumber = ticket.seatNumber || '-';
/*         const showTime = ticket.showTime || ticket.screeningTime;
        const ticketCode = ticket.ticketCode || ticket.ticketId;
        const statusText = this.getStatusText(ticket);
        
        const seatDisplay = this.formatSeat(seatNumber); */
        const showTime = ticket.showTime;
        const ticketCode = ticket.ticketCode || '-';
        const statusText = this.getStatusText(ticket);
        
        const seatDisplay = this.formatSeat(seatNumber);
        const timeDisplay = showTime ? formatDateTime(showTime) : '时间未知';
        const createdAtDisplay = ticket.createdAt ? formatDateTime(ticket.createdAt) : '未知';

                detailEl.innerHTML = `
            <div class="ticket-detail-card">
                <div class="ticket-detail-header">
                    <h2>🎬 ${movieName}</h2>
                    <span class="ticket-status-badge">${statusText}</span>
                </div>
                
                <div class="ticket-detail-content">
                    <div class="ticket-info-grid">
                        <div class="ticket-info-row">
                            <span class="info-label">
                                <span class="icon">📍</span>
                                影院
                            </span>
                            <span class="info-value">${cinemaName}</span>
                        </div>
                        <div class="ticket-info-row">
                            <span class="info-label">
                                <span class="icon">🎭</span>
                                影厅
                            </span>
                            <span class="info-value">${hallName}</span>
                        </div>
                        <div class="ticket-info-row">
                            <span class="info-label">
                                <span class="icon">🕐</span>
                                放映时间
                            </span>
                            <span class="info-value">${timeDisplay}</span>
                        </div>
                        <div class="ticket-info-row">
                            <span class="info-label">
                                <span class="icon">💺</span>
                                座位
                            </span>
                            <span class="info-value highlight">${seatDisplay}</span>
                        </div>
                        <div class="ticket-info-row">
                            <span class="info-label">
                                <span class="icon">📋</span>
                                订单号
                            </span>
                            <span class="info-value">${ticket.orderId || '-'}</span>
                        </div>
                        <div class="ticket-info-row">
                            <span class="info-label">
                                <span class="icon">📅</span>
                                出票时间
                            </span>
                            <span class="info-value">${createdAtDisplay}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ticket-detail-footer">
                    <div class="ticket-code-display">
                        <div class="code-label">取票码</div>
                        <div class="code-value">${ticketCode}</div>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }
}

// 初始化页面
new TicketsPage();