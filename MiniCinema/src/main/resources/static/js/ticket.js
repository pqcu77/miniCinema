class TicketManager {
    constructor(userId) {
        this.userId = userId;
        this.allTickets = [];
        this.currentFilter = 'all';
    }
    
    async loadUserTickets() {
        const response = await TicketAPI.getUserTickets(this.userId);
        if (response.code === 200) {
            this.allTickets = response.data;
            this.renderTickets(response.data);
        }
    }
    
    renderTickets(tickets) {
        const ticketList = document.getElementById('ticket-list');
        
        if (!tickets || tickets.length === 0) {
            ticketList.innerHTML = '<p>暂无票</p>';
            return;
        }
        
        let html = '';
        tickets.forEach(ticket => {
            html += `
                <div class="ticket-card">
                    <div class="ticket-header">
                        <h3>${ticket.movieName}</h3>
                        <span class="status ${ticket.status === 0 ? 'unused' : 'used'}">
                            ${ticket.statusText}
                        </span>
                    </div>
                    <div class="ticket-body">
                        <p>影院: ${ticket.cinemaName}</p>
                        <p>影厅: ${ticket.hallName}</p>
                        <p>座位: ${ticket.seatNumber}</p>
                        <p>时间: ${ticket.showTime}</p>
                    </div>
                    <div class="ticket-qr">
                        <img src="/qrcode?data=${ticket.ticketCode}" alt="二维码">
                        <p>票码: ${ticket.ticketCode}</p>
                    </div>
                    ${ticket.status === 0 ? `
                        <button onclick="ticketManager.verifyTicket('${ticket.ticketCode}')">立即核销</button>
                    ` : ''}
                </div>
            `;
        });
        
        ticketList.innerHTML = html;
    }
    
    async verifyTicket(ticketCode) {
        if (confirm('确定核销此票吗？')) {
            const response = await TicketAPI.verifyTicket(ticketCode);
            if (response.code === 200) {
                alert('核销成功');
                await this.loadUserTickets();
            }
        }
    }

    filterTickets(filter) {
        this.currentFilter = filter;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // 筛选数据
        let filtered = this.allTickets;
        if (filter === 'unused') {
            filtered = this.allTickets.filter(t => t.status === 0);
        } else if (filter === 'used') {
            filtered = this.allTickets.filter(t => t.status === 1);
        }

        this.renderTickets(filtered);
    }

    generateQRCode(elementId, data) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // 需要引入 qrcode.js 库
        new QRCode(element, {
            text: data,
            width: 150,
            height: 150,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    }

    showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => messageEl.remove(), 3000);
    }
}

let ticketManager;
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        ticketManager = new TicketManager(userId);
        ticketManager.loadUserTickets();
    }
});