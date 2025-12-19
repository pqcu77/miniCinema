import { showMessage } from '../utils.js';
import { API_BASE_URL } from '../api.js';

// 从 URL 获取电影 ID
const urlParams = new URLSearchParams(window.location.search);
const movieId = parseInt(urlParams.get('movieId'));

let movieInfo = null;
let allCinemas = [];
let currentCinemaIndex = 0;
let selectedDate = null;
let availableDates = [];

// 加载电影基本信息
async function loadMovieInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`);
        const result = await response.json();
        
        if (result.code === 1) {
            movieInfo = result.data;
            
            // 更新页面信息
            document.getElementById('movie-title').textContent = movieInfo.title || '未知电影';
            document.getElementById('movie-duration').textContent = movieInfo.duration || '未知';
            document.getElementById('movie-genre').textContent = movieInfo.genre || '未知';
            
            if (movieInfo.posterUrl) {
                document.getElementById('movie-poster').src = movieInfo.posterUrl;
            }
        } else {
            showMessage(result.msg || '加载电影信息失败', 'error');
        }
    } catch (error) {
        console.error('加载电影信息失败:', error);
        showMessage('加载电影信息失败', 'error');
    }
}

// 加载场次信息
async function loadScreenings() {
    try {
        const response = await fetch(`${API_BASE_URL}/screenings/movie/${movieId}`);
        const result = await response.json();
        
        if (result.code === 1) {
            allCinemas = result.data.cinemas || [];
            
            if (allCinemas.length === 0) {
                document.getElementById('cinema-content').innerHTML = '<p class="no-data">😢 暂无场次信息</p>';
                return;
            }
            
            // 提取所有可用日期
            extractAvailableDates();
            // 初始化日期选择器
            initDateInput();
            // 渲染影院导航栏并显示第一个有场次的影院
            renderCinemaTabs();
        } else {
            showMessage(result.msg || '加载场次失败', 'error');
        }
    } catch (error) {
        console.error('加载场次失败:', error);
        showMessage('加载场次失败', 'error');
    }
}

// 提取所有可用日期
function extractAvailableDates() {
    const dateSet = new Set();
    
    allCinemas.forEach(cinema => {
        cinema.screenings.forEach(screening => {
            const date = new Date(screening.screenTime);
            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            dateSet.add(dateStr);
        });
    });
    
    availableDates = Array.from(dateSet).sort();
    selectedDate = availableDates[0]; // 默认选择第一个日期
}

// ✅ 初始化日期输入框（使用 Flatpickr）
function initDateInput() {
    const dateInput = document.getElementById('date-input');
    const dateText = document.getElementById('date-text');
    const wrapper = document.querySelector('.date-input-wrapper');
    
    if (availableDates.length === 0) {
        return;
    }
    
    // 设置日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date(availableDates[availableDates.length - 1]);
    maxDate.setDate(maxDate.getDate() + 30);
    
    // 更新显示文本
    updateDateText(selectedDate);
    
    // ✅ 初始化 Flatpickr
    const fp = flatpickr(dateInput, {
        locale: 'zh',
        dateFormat: 'Y-m-d',
        defaultDate: selectedDate,
        minDate: today,
        maxDate: maxDate,
        // ✅ 高亮有场次的日期
        enable: availableDates.map(d => d),
        onChange: function(selectedDates, dateStr) {
            if (dateStr) {
                selectDate(dateStr);
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            // 点击 wrapper 时打开日历
            wrapper.addEventListener('click', () => {
                instance.open();
            });
        }
    });
    
    // 绑定前后按钮事件
    document.getElementById('prev-date').onclick = () => {
        navigateDate(-1);
        fp.setDate(selectedDate);
    };
    
    document.getElementById('next-date').onclick = () => {
        navigateDate(1);
        fp.setDate(selectedDate);
    };
}

// ✅ 格式化日期为字符串 (YYYY-MM-DD)
function formatDateToString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ✅ 更新日期显示文本
function updateDateText(dateStr) {
    const dateText = document.getElementById('date-text');
    const date = new Date(dateStr + 'T00:00:00'); // 避免时区问题
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 判断是今天、明天还是其他日期
    let displayText;
    const dateTime = date.getTime();
    const todayTime = today.getTime();
    const tomorrowTime = tomorrow.getTime();
    
    if (dateTime === todayTime) {
        displayText = '今天';
    } else if (dateTime === tomorrowTime) {
        displayText = '明天';
    } else {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        displayText = `${year}年${month}月${day}日`;
    }
    
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    dateText.textContent = `${displayText} ${weekDay}`;
}

// 选择日期
function selectDate(dateStr) {
    selectedDate = dateStr;
    
    // 更新日期输入框的值
    const dateInput = document.getElementById('date-input');
    dateInput.value = dateStr;
    
    // 更新显示文本
    updateDateText(dateStr);
    
    // 重新渲染影院标签，并自动选择第一个有场次的影院
    renderCinemaTabs();
}

// 日期导航
function navigateDate(direction) {
    // 如果当前日期在可用日期列表中
    let currentIndex = availableDates.indexOf(selectedDate);
    
    if (currentIndex === -1) {
        // 当前日期不在可用日期中，找到最近的日期
        const selectedDateTime = new Date(selectedDate + 'T00:00:00').getTime();
        currentIndex = availableDates.findIndex(dateStr => {
            return new Date(dateStr + 'T00:00:00').getTime() >= selectedDateTime;
        });
        
        if (currentIndex === -1) {
            currentIndex = availableDates.length - 1;
        }
    }
    
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < availableDates.length) {
        selectDate(availableDates[newIndex]);
    } else {
        // 如果超出范围，显示提示
        if (direction < 0) {
            showMessage('已经是最早的场次日期了', 'info');
        } else {
            showMessage('已经是最晚的场次日期了', 'info');
        }
    }
}

// 渲染影院导航栏
function renderCinemaTabs() {
    const tabsContainer = document.getElementById('cinema-tabs');
    const contentContainer = document.getElementById('cinema-content');
    const scrollLeftBtn = document.getElementById('cinema-scroll-left');
    const scrollRightBtn = document.getElementById('cinema-scroll-right');
    
    tabsContainer.innerHTML = '';
    
    // 过滤出有当前日期场次的影院
    const cinemasWithScreenings = allCinemas.filter(cinema => {
        return cinema.screenings.some(screening => {
            const screeningDate = new Date(screening.screenTime);
            const screeningDateStr = formatDateToString(screeningDate);
            return screeningDateStr === selectedDate;
        });
    });
    
    // 如果没有影院有场次，显示提示信息
    if (cinemasWithScreenings.length === 0) {
        const date = new Date(selectedDate + 'T00:00:00');
        const dateText = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        contentContainer.innerHTML = `<p class="no-data">😢 ${dateText} 当前影片无排期</p>`;
        
        // 隐藏滚动按钮
        scrollLeftBtn.style.display = 'none';
        scrollRightBtn.style.display = 'none';
        return;
    }
    
    // ✅ 判断是否需要显示滚动按钮
    const needScroll = cinemasWithScreenings.length > 7;
    
    if (needScroll) {
        // 显示滚动按钮
        scrollLeftBtn.style.display = 'flex';
        scrollRightBtn.style.display = 'flex';
        tabsContainer.classList.remove('no-scroll');
    } else {
        // 隐藏滚动按钮，允许换行
        scrollLeftBtn.style.display = 'none';
        scrollRightBtn.style.display = 'none';
        tabsContainer.classList.add('no-scroll');
    }
    
    // 渲染影院标签
    cinemasWithScreenings.forEach((cinema, index) => {
        const tab = document.createElement('button');
        tab.className = 'cinema-tab';
        tab.textContent = cinema.cinemaName;
        
        // 绑定点击事件，传入在 allCinemas 中的索引
        const originalIndex = allCinemas.indexOf(cinema);
        tab.onclick = () => {
            switchCinema(originalIndex);
            // ✅ 点击后滚动到该标签
            if (needScroll) {
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        };
        
        // 第一个影院默认激活
        if (index === 0) {
            tab.classList.add('active');
        }
        
        tabsContainer.appendChild(tab);
    });
    
    // ✅ 绑定滚动按钮事件
    if (needScroll) {
        initCinemaScroll();
    }
    
    // 自动显示第一个有场次的影院
    const firstCinemaIndex = allCinemas.indexOf(cinemasWithScreenings[0]);
    switchCinema(firstCinemaIndex);
}

// ✅ 初始化影院滚动功能
function initCinemaScroll() {
    const tabsContainer = document.getElementById('cinema-tabs');
    const scrollLeftBtn = document.getElementById('cinema-scroll-left');
    const scrollRightBtn = document.getElementById('cinema-scroll-right');
    
    // 每次滚动的距离（约3个影院标签的宽度）
    const scrollAmount = 400;
    
    // 左滚动
    scrollLeftBtn.onclick = () => {
        tabsContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    };
    
    // 右滚动
    scrollRightBtn.onclick = () => {
        tabsContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    };
    
    // ✅ 更新按钮状态（禁用到头的按钮）
    const updateScrollButtons = () => {
        const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;
        
        // 左按钮：滚动到最左边时禁用
        scrollLeftBtn.disabled = scrollLeft <= 0;
        
        // 右按钮：滚动到最右边时禁用
        scrollRightBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
    };
    
    // 监听滚动事件
    tabsContainer.addEventListener('scroll', updateScrollButtons);
    
    // 初始更新
    updateScrollButtons();
}

// 切换影院
function switchCinema(index) {
    currentCinemaIndex = index;
    
    // 更新导航栏激活状态
    const tabs = document.querySelectorAll('.cinema-tab');
    tabs.forEach((tab) => {
        const cinema = allCinemas.find(c => c.cinemaName === tab.textContent);
        if (cinema && allCinemas.indexOf(cinema) === index) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 渲染当前影院的场次
    renderCinemaScreenings(allCinemas[index]);
}

// 渲染当前影院的场次列表
function renderCinemaScreenings(cinema) {
    const container = document.getElementById('cinema-content');
    
    // 过滤当前日期的场次
    const filteredScreenings = cinema.screenings.filter(screening => {
        const screeningDate = new Date(screening.screenTime);
        const screeningDateStr = formatDateToString(screeningDate);
        return screeningDateStr === selectedDate;
    });
    
    container.innerHTML = `
        <div class="cinema-info">
            <div class="cinema-info-left">
                <h4>${cinema.cinemaName}</h4>
                <p class="cinema-address">📍 ${cinema.address || '地址未知'}</p>
            </div>
            <div class="cinema-info-right">
                <button class="btn-cinema-detail" onclick="viewCinemaDetails(${cinema.cinemaId}, '${cinema.cinemaName}')">
                    🏢 查看影院详情
                </button>
            </div>
        </div>
        <div class="screenings-list" id="screenings-list"></div>
    `;
    
    const screeningsList = document.getElementById('screenings-list');
    
    if (filteredScreenings.length === 0) {
        screeningsList.innerHTML = '<p class="no-data">该影院该日期暂无场次</p>';
        return;
    }
    
    filteredScreenings.forEach(screening => {
        const row = createScreeningRow(screening);
        screeningsList.appendChild(row);
    });
}

// ✅ 将函数暴露到全局作用域
window.viewCinemaDetails = viewCinemaDetails;

// 创建场次行
function createScreeningRow(screening) {
    const row = document.createElement('div');
    row.className = 'screening-row';
    
    // 格式化时间
    const screenTime = new Date(screening.screenTime);
    const timeStr = `${screenTime.getHours().toString().padStart(2, '0')}:${screenTime.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `${screenTime.getMonth() + 1}月${screenTime.getDate()}日`;
    
    row.innerHTML = `
        <div class="screening-time-col">
            <div class="time-main">${timeStr}</div>
            <div class="time-date">${dateStr}</div>
        </div>
        <div class="screening-hall-col">
            <div class="hall-name">${screening.hallName}</div>
            <div class="video-type">${screening.videoType || '普通'}</div>
        </div>
        <div class="screening-price-col">
            <span class="price-symbol">￥</span>
            <span class="price-amount">${screening.price}</span>
        </div>
        <div class="screening-seats-col">
            <span class="seats-info">剩余 ${screening.availableSeats || 0} 座</span>
        </div>
        <div class="screening-action-col">
            <button class="buy-btn" 
                    data-screening-id="${screening.screeningId}"
                    ${screening.status !== '可售' ? 'disabled' : ''}>
                ${getButtonText(screening.status)}
            </button>
        </div>
    `;
    
    // 绑定按钮事件
    const btn = row.querySelector('.buy-btn');
    if (screening.status === '可售') {
        btn.onclick = () => goToSeatSelection(screening.screeningId);
    }
    
    return row;
}

// 根据状态返回按钮文字
function getButtonText(status) {
    switch (status) {
        case '可售':
            return '选座购票';
        case '即将开场':
            return '即将开场';
        case '已开场':
            return '已开场';
        case '已结束':
            return '已结束';
        default:
            return '不可售';
    }
}

// 跳转到选座页面（暂时显示开发中）
function goToSeatSelection(screeningId) {
    showMessage('选座功能开发中，敬请期待！🎬', 'info');
    // 未来实现时取消注释下面这行
    // window.location.href = `seat-selection.html?screeningId=${screeningId}`;
}

// 页面加载时初始化
window.onload = async function() {
    if (!movieId) {
        showMessage('缺少电影ID', 'error');
        setTimeout(() => {
            window.location.href = 'movies.html';
        }, 1500);
        return;
    }
    
    await loadMovieInfo();
    await loadScreenings();
};

// ✅ 查看影院详情
async function viewCinemaDetails(cinemaId, cinemaName) {
    try {
        // 显示加载提示
        showMessage('正在加载影院详情...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}`);
        const result = await response.json();
        
        if (result.code === 1) {
            const cinema = result.data;
            showCinemaDetailsModal(cinema);
        } else {
            showMessage(result.msg || '加载影院详情失败', 'error');
        }
    } catch (error) {
        console.error('加载影院详情失败:', error);
        showMessage('加载影院详情失败', 'error');
    }
}

// ✅ 显示影院详情弹窗
function showCinemaDetailsModal(cinema) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'cinema-modal-overlay';
    
    // 创建弹窗内容
    const modal = document.createElement('div');
    modal.className = 'cinema-modal';
    
    // 影厅列表 HTML
    const hallsHtml = cinema.halls && cinema.halls.length > 0
        ? cinema.halls.map(hall => `
            <div class="hall-item">
                <div class="hall-name">🎭 ${hall.name || '未命名影厅'}</div>
                <div class="hall-info">
                    <span class="hall-type">${hall.hallType || '普通'}</span>
                    <span class="hall-capacity">座位: ${hall.capacity || '未知'}</span>
                </div>
                ${hall.facilities ? `<div class="hall-facilities">设施: ${hall.facilities}</div>` : ''}
            </div>
        `).join('')
        : '<p class="no-halls">暂无影厅信息</p>';
    
    modal.innerHTML = `
        <div class="cinema-modal-header">
            <h3>🎬 ${cinema.cinemaName || '影院详情'}</h3>
            <button class="cinema-modal-close" onclick="this.closest('.cinema-modal-overlay').remove()">✕</button>
        </div>
        
        <div class="cinema-modal-body">
            <!-- 基本信息 -->
            <div class="cinema-detail-section">
                <h4>📍 基本信息</h4>
                <div class="cinema-detail-info">
                    <div class="info-row">
                        <span class="info-label">地址：</span>
                        <span class="info-value">${cinema.address || '未知'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">城市：</span>
                        <span class="info-value">${cinema.city || '未知'} - ${cinema.district || '未知区域'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">电话：</span>
                        <span class="info-value">${cinema.phone || '未提供'}</span>
                    </div>
                    ${cinema.facilities ? `
                    <div class="info-row">
                        <span class="info-label">设施：</span>
                        <span class="info-value">${cinema.facilities}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- 影厅列表 -->
            <div class="cinema-detail-section">
                <h4>🎭 影厅列表 (${cinema.halls?.length || 0})</h4>
                <div class="halls-list">
                    ${hallsHtml}
                </div>
            </div>
        </div>
        
        <div class="cinema-modal-footer">
            <button class="btn-close" onclick="this.closest('.cinema-modal-overlay').remove()">关闭</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // ESC 键关闭
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}