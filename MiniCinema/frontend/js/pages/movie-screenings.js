import { showMessage } from '../utils.js';
import { API_BASE_URL } from '../api.js';

// 从 URL 获取电影 ID
const urlParams = new URLSearchParams(window.location.search);
const movieId = parseInt(urlParams.get('movieId'));

let movieInfo = null;
let allCinemas = [];  // 原始完整影院列表
let filteredCinemas = [];  // 筛选后的影院列表
let currentCinemaIndex = 0;
let selectedDate = null;
let availableDates = [];
let filterKeyword = '';  // 当前筛选关键词

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

// // ✅ 修改后的 loadScreenings - 加载并筛选场次信息
// async function loadScreenings(keyword = '') {
//     try {
//         let response;
        
//         if (keyword.trim()) {
//             // ✅ 根据关键词类型决定使用哪个 API
//             const searchType = detectSearchType(keyword);
            
//             if (searchType === 'city') {
//                 // 只搜索城市
//                 response = await fetch(`${API_BASE_URL}/cinemas/city?city=${encodeURIComponent(keyword)}`);
//             } else if (searchType === 'city+district') {
//                 // 城市+区域
//                 const [city, district] = keyword.split(/[/\s]+/);
//                 response = await fetch(`${API_BASE_URL}/cinemas/city?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`);
//             } else {
//                 // 模糊搜索影院名称
//                 response = await fetch(`${API_BASE_URL}/cinemas/search?keyword=${encodeURIComponent(keyword)}`);
//             }
            
//             const result = await response.json();
            
//             if (result.code === 1) {
//                 const cinemas = result.data || [];
//                 // ✅ 获取这些影院的场次信息
//                 await loadScreeningsForCinemas(cinemas);
//             } else {
//                 showMessage(result.msg || '搜索失败', 'error');
//                 filteredCinemas = [];
//                 renderNoResults();
//             }
//         } else {
//             // 没有筛选条件，加载所有场次
//             response = await fetch(`${API_BASE_URL}/screenings/movie/${movieId}`);
//             const result = await response.json();
            
//             if (result.code === 1) {
//                 allCinemas = result.data.cinemas || [];
//                 filteredCinemas = allCinemas;
                
//                 if (filteredCinemas.length === 0) {
//                     document.getElementById('cinema-content').innerHTML = '<p class="no-data">😢 暂无场次信息</p>';
//                     return;
//                 }
                
//                 // 提取所有可用日期
//                 extractAvailableDates();
//                 // 初始化日期选择器
//                 initDateInput();
//                 // 渲染影院导航栏并显示第一个有场次的影院
//                 renderCinemaTabs();
//             } else {
//                 showMessage(result.msg || '加载场次失败', 'error');
//             }
//         }
//     } catch (error) {
//         console.error('加载场次失败:', error);
//         showMessage('加载场次失败', 'error');
//     }
// }

// // ✅ 检测搜索类型
// function detectSearchType(keyword) {
//     const trimmed = keyword.trim();
    
//     // 检查是否包含分隔符（/ 或空格）
//     if (trimmed.includes('/') || trimmed.includes(' ')) {
//         return 'city+district';
//     }
    
//     // 检查是否是常见城市名
//     const cities = ['北京', '上海', '广州', '深圳', '测试市', 'Beijing', 'Shanghai'];
//     if (cities.some(city => trimmed.includes(city))) {
//         return 'city';
//     }
    
//     // 默认为影院名称搜索
//     return 'cinema-name';
// }

// ✅ 简化 loadScreenings - 只用于加载全部场次
async function loadScreenings(keyword = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/screenings/movie/${movieId}`);
        const result = await response.json();
        
        console.log('📡 后端返回的完整数据:', result);
        
        if (result.code === 1) {
            allCinemas = result.data.cinemas || [];
            filteredCinemas = allCinemas;
            
            // ✅ 检查第一个影院的第一个场次
            if (allCinemas.length > 0 && allCinemas[0].screenings.length > 0) {
                const firstScreening = allCinemas[0].screenings[0];
                console.log('🔍 第一个场次的数据结构:', firstScreening);
                console.log('🔍 包含的字段:', Object.keys(firstScreening));
                console.log('🔍 screeningId 值:', firstScreening.screeningId);
            }
            
            if (filteredCinemas.length === 0) {
                document.getElementById('cinema-content').innerHTML = '<p class="no-data">😢 暂无场次信息</p>';
                return;
            }
            
            extractAvailableDates();
            initDateInput();
            renderCinemaTabs();
        } else {
            showMessage(result.msg || '加载场次失败', 'error');
        }
    } catch (error) {
        console.error('加载场次失败:', error);
        showMessage('加载场次失败', 'error');
    }
}

// // ✅ 为指定影院加载场次信息
// async function loadScreeningsForCinemas(cinemas) {
//     try {
//         // 获取影院ID列表
//         const cinemaIds = cinemas.map(c => c.cinemaId);
        
//         // 获取完整场次数据
//         const response = await fetch(`${API_BASE_URL}/screenings/movie/${movieId}`);
//         const result = await response.json();
        
//         if (result.code === 1) {
//             allCinemas = result.data.cinemas || [];
            
//             // ✅ 筛选出匹配的影院
//             filteredCinemas = allCinemas.filter(cinema => 
//                 cinemaIds.includes(cinema.cinemaId)
//             );
            
//             if (filteredCinemas.length === 0) {
//                 renderNoResults();
//                 return;
//             }
            
//             // 提取可用日期
//             extractAvailableDates();
//             // 初始化或更新日期选择器
//             if (!selectedDate) {
//                 initDateInput();
//             }
//             // 渲染影院标签
//             renderCinemaTabs();
//         }
//     } catch (error) {
//         console.error('加载场次失败:', error);
//         showMessage('加载场次失败', 'error');
//     }
// }
// ✅ 为指定影院加载场次信息（结合当前选中日期）
async function loadScreeningsForCinemas(cinemas) {
    try {
        // 获取影院ID列表
        const cinemaIds = cinemas.map(c => c.cinemaId);
        
        // 获取完整场次数据
        const response = await fetch(`${API_BASE_URL}/screenings/movie/${movieId}`);
        const result = await response.json();
        
        if (result.code === 1) {
            allCinemas = result.data.cinemas || [];
            
            // ✅ 筛选出匹配的影院
            let matchedCinemas = allCinemas.filter(cinema => 
                cinemaIds.includes(cinema.cinemaId)
            );
            
            // ✅ 如果已经选择了日期，进一步过滤出该日期有场次的影院
            if (selectedDate) {
                matchedCinemas = matchedCinemas.filter(cinema => {
                    return cinema.screenings.some(screening => {
                        const screeningDate = new Date(screening.screenTime);
                        const screeningDateStr = formatDateToString(screeningDate);
                        return screeningDateStr === selectedDate;
                    });
                });
            }
            
            filteredCinemas = matchedCinemas;
            
            if (filteredCinemas.length === 0) {
                // ✅ 显示更友好的提示
                const dateText = selectedDate ? ` (${selectedDate})` : '';
                showMessage(`所选影院在${dateText}暂无场次`, 'warning');
                renderNoResults();
                return;
            }
            
            // 提取可用日期
            extractAvailableDates();
            
            // 初始化或更新日期选择器
            if (!selectedDate || !availableDates.includes(selectedDate)) {
                // 如果当前日期不在可用日期中，自动选择第一个可用日期
                selectedDate = availableDates[0];
                initDateInput();
            }
            
            // 渲染影院标签
            renderCinemaTabs();
        }
    } catch (error) {
        console.error('加载场次失败:', error);
        showMessage('加载场次失败', 'error');
    }
}

// ✅ 渲染无结果提示
function renderNoResults() {
    const contentContainer = document.getElementById('cinema-content');
    const tabsContainer = document.getElementById('cinema-tabs');
    
    contentContainer.innerHTML = '<p class="no-data">😢 未找到符合条件的影院</p>';
    tabsContainer.innerHTML = '';
    
    // 隐藏滚动按钮
    document.getElementById('cinema-scroll-left').style.display = 'none';
    document.getElementById('cinema-scroll-right').style.display = 'none';
}

// ✅ 修改 extractAvailableDates - 从筛选后的影院提取日期
function extractAvailableDates() {
    const dateSet = new Set();
    
    filteredCinemas.forEach(cinema => {
        cinema.screenings.forEach(screening => {
            const date = new Date(screening.screenTime);
            const dateStr = formatDateToString(date);
            dateSet.add(dateStr);
        });
    });
    
    availableDates = Array.from(dateSet).sort();
    
    // 如果当前选中的日期不在新的可用日期中，选择第一个
    if (!availableDates.includes(selectedDate)) {
        selectedDate = availableDates[0];
    }
}

// // ✅ 初始化筛选功能
// function initCinemaFilter() {
//     const filterInput = document.getElementById('cinema-filter-input');
//     const clearBtn = document.getElementById('filter-clear-btn');
    
//     // 输入事件 - 实时搜索
//     let searchTimeout;
//     filterInput.addEventListener('input', (e) => {
//         const keyword = e.target.value.trim();
        
//         // 显示/隐藏清除按钮
//         clearBtn.style.display = keyword ? 'flex' : 'none';
        
//         // 防抖搜索
//         clearTimeout(searchTimeout);
//         searchTimeout = setTimeout(() => {
//             filterKeyword = keyword;
//             loadScreenings(keyword);
//         }, 500);
//     });
    
//     // 清除按钮
//     clearBtn.addEventListener('click', () => {
//         filterInput.value = '';
//         clearBtn.style.display = 'none';
//         filterKeyword = '';
//         loadScreenings('');
//     });
    
//     // 回车键搜索
//     filterInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') {
//             const keyword = e.target.value.trim();
//             filterKeyword = keyword;
//             loadScreenings(keyword);
//         }
//     });
// }

// ✅ 初始化筛选功能（三个独立输入框）
function initCinemaFilter() {
    const cityInput = document.getElementById('city-filter');
    const districtInput = document.getElementById('district-filter');
    const cinemaNameInput = document.getElementById('cinema-name-filter');
    const clearAllBtn = document.getElementById('filter-clear-all-btn');
    
    let searchTimeout;
    
    // 执行筛选
    const performFilter = () => {
        const city = cityInput.value.trim();
        const district = districtInput.value.trim();
        const cinemaName = cinemaNameInput.value.trim();
        
        // 显示/隐藏清空按钮
        //const hasFilter = city || district || cinemaName;
        //clearAllBtn.style.display = hasFilter ? 'block' : 'none';
        clearAllBtn.style.display = 'block' ;

        // ✅ 根据输入组合决定筛选逻辑
        if (city && district) {
            // 城市 + 区域
            loadScreeningsByLocation(city, district);
        } else if (city) {
            // 只有城市
            loadScreeningsByCity(city);
        } else if (cinemaName) {
            // 只有影院名称（忽略区域）
            loadScreeningsByName(cinemaName);
        } else if (district && !city) {
            // 只有区域，不允许
            showMessage('请先输入城市', 'warning');
        } else {
            // 清空所有筛选，显示全部
            loadScreenings('');
        }
    };
    
    // 城市输入事件
    cityInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performFilter, 500);
    });
    
    // 区域输入事件
    districtInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performFilter, 500);
    });
    
    // 影院名称输入事件
    cinemaNameInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performFilter, 500);
    });
    
    // 回车键触发搜索
    [cityInput, districtInput, cinemaNameInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                performFilter();
            }
        });
    });
    
    // 清空所有筛选
    clearAllBtn.addEventListener('click', () => {
        cityInput.value = '';
        districtInput.value = '';
        cinemaNameInput.value = '';
        //clearAllBtn.style.display = 'none';
        loadScreenings('');
    });
}

// // ✅ 根据城市筛选
// async function loadScreeningsByCity(city) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/cinemas/city?city=${encodeURIComponent(city)}`);
//         const result = await response.json();
        
//         if (result.code === 1) {
//             const cinemas = result.data || [];
//             await loadScreeningsForCinemas(cinemas);
//         } else {
//             showMessage(result.msg || '未找到该城市的影院', 'error');
//             renderNoResults();
//         }
//     } catch (error) {
//         console.error('加载影院失败:', error);
//         showMessage('加载影院失败', 'error');
//     }
// }

// // ✅ 根据城市+区域筛选
// async function loadScreeningsByLocation(city, district) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/cinemas/location?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`);
//         const result = await response.json();
        
//         if (result.code === 1) {
//             const cinemas = result.data || [];
//             await loadScreeningsForCinemas(cinemas);
//         } else {
//             showMessage(result.msg || '未找到该区域的影院', 'error');
//             renderNoResults();
//         }
//     } catch (error) {
//         console.error('加载影院失败:', error);
//         showMessage('加载影院失败', 'error');
//     }
// }

// // ✅ 根据影院名称筛选
// async function loadScreeningsByName(keyword) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/cinemas/search?keyword=${encodeURIComponent(keyword)}`);
//         const result = await response.json();
        
//         if (result.code === 1) {
//             const cinemas = result.data || [];
//             await loadScreeningsForCinemas(cinemas);
//         } else {
//             showMessage(result.msg || '未找到匹配的影院', 'error');
//             renderNoResults();
//         }
//     } catch (error) {
//         console.error('加载影院失败:', error);
//         showMessage('加载影院失败', 'error');
//     }
// }

// ✅ 根据城市筛选
async function loadScreeningsByCity(city) {
    try {
        // 1. 先获取该城市的所有影院
        const response = await fetch(`${API_BASE_URL}/cinemas/city?city=${encodeURIComponent(city)}`);
        const result = await response.json();
        
        if (result.code === 1) {
            const cinemas = result.data || [];
            
            if (cinemas.length === 0) {
                showMessage(`未找到城市 "${city}" 的影院`, 'warning');
                renderNoResults();
                return;
            }
            
            // 2. 加载这些影院的场次（会自动结合当前日期过滤）
            await loadScreeningsForCinemas(cinemas);
        } else {
            showMessage(result.msg || '未找到该城市的影院', 'error');
            renderNoResults();
        }
    } catch (error) {
        console.error('加载影院失败:', error);
        showMessage('加载影院失败', 'error');
    }
}

// ✅ 根据城市+区域筛选（带智能降级）
async function loadScreeningsByLocation(city, district) {
    try {
        // 1. 先尝试精确查询城市+区域
        const response = await fetch(`${API_BASE_URL}/cinemas/location?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`);
        const result = await response.json();
        
        if (result.code === 1 && result.data && result.data.length > 0) {
            // ✅ 查询成功
            const cinemas = result.data;
            await loadScreeningsForCinemas(cinemas);
        } else {
            // 2. 区域查询失败，降级为只查城市
            console.log(`区域 "${district}" 无结果，降级为城市查询`);
            showMessage(`"${district}" 区域暂无影院，显示 "${city}" 的所有影院`, 'info');
            
            // ✅ 降级查询
            await loadScreeningsByCity(city);
        }
    } catch (error) {
        console.error('查询失败，尝试降级:', error);
        
        // 3. 网络错误也尝试降级
        try {
            await loadScreeningsByCity(city);
        } catch (fallbackError) {
            showMessage('加载影院失败', 'error');
            renderNoResults();
        }
    }
}

// ✅ 根据影院名称筛选
async function loadScreeningsByName(keyword) {
    try {
        const response = await fetch(`${API_BASE_URL}/cinemas/search?keyword=${encodeURIComponent(keyword)}`);
        const result = await response.json();
        
        if (result.code === 1) {
            const cinemas = result.data || [];
            
            if (cinemas.length === 0) {
                showMessage(`未找到包含 "${keyword}" 的影院`, 'warning');
                renderNoResults();
                return;
            }
            
            await loadScreeningsForCinemas(cinemas);
        } else {
            showMessage(result.msg || '未找到匹配的影院', 'error');
            renderNoResults();
        }
    } catch (error) {
        console.error('加载影院失败:', error);
        showMessage('加载影院失败', 'error');
    }
}

// // 提取所有可用日期
// function extractAvailableDates() {
//     const dateSet = new Set();
    
//     allCinemas.forEach(cinema => {
//         cinema.screenings.forEach(screening => {
//             const date = new Date(screening.screenTime);
//             const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
//             dateSet.add(dateStr);
//         });
//     });
    
//     availableDates = Array.from(dateSet).sort();
//     selectedDate = availableDates[0]; // 默认选择第一个日期
// }

// // ✅ 初始化日期输入框（使用 Flatpickr）
// function initDateInput() {
//     const dateInput = document.getElementById('date-input');
//     const dateText = document.getElementById('date-text');
//     const wrapper = document.querySelector('.date-input-wrapper');
    
//     if (availableDates.length === 0) {
//         return;
//     }
    
//     // 设置日期范围
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const maxDate = new Date(availableDates[availableDates.length - 1]);
//     maxDate.setDate(maxDate.getDate() + 60);
    

    
//     // 更新显示文本
//     updateDateText(selectedDate);
    
//     // ✅ 初始化 Flatpickr
//     const fp = flatpickr(dateInput, {
//         locale: 'zh',
//         dateFormat: 'Y-m-d',
//         defaultDate: selectedDate,
//         minDate: today,
//         maxDate: maxDate,
//         onChange: function(selectedDates, dateStr) {
//             if (dateStr) {
//                 selectDate(dateStr);
//             }
//         },
//         onReady: function(selectedDates, dateStr, instance) {
//             // 点击 wrapper 时打开日历
//             wrapper.addEventListener('click', () => {
//                 instance.open();
//             });
            
//             // ✅ 标记日期类型
//             setTimeout(markDateTypes, 100);
//         },
//         onOpen: function() {
//             // ✅ 每次打开都重新标记
//             setTimeout(markDateTypes, 100);
//         },
//         onMonthChange: function() {
//             // ✅ 切换月份后重新标记
//             setTimeout(markDateTypes, 100);
//         },
//         onYearChange: function() {
//             setTimeout(markDateTypes, 100);
//         },
//         onDayCreate: function(dObj, dStr, fp, dayElem) {
//             // ✅ 在每个日期创建时标记
//             const date = new Date(dayElem.dateObj);
//             date.setHours(0, 0, 0, 0);
//             const dateStr = formatDateToString(date);
    
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
    
//             // ✅ 只标记未来的日期
//             if (date >= today) {
//                 if (availableDates.includes(dateStr)) {
//                     dayElem.classList.add('has-screenings');
//                 } else {
//                     dayElem.classList.add('no-screenings');
//                 }
//             }
//             // ✅ 过期日期由 Flatpickr 自动处理为 disabled
//         }
//     });
    
//     // 绑定前后按钮事件
//     document.getElementById('prev-date').onclick = () => {
//         navigateDate(-1);
//         fp.setDate(selectedDate);
//     };
    
//     document.getElementById('next-date').onclick = () => {
//         navigateDate(1);
//         fp.setDate(selectedDate);
//     };
// }


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
    
    // ✅ 修复：使用固定的未来日期范围
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    
    // 更新显示文本
    updateDateText(selectedDate);
    
    // ✅ 初始化 Flatpickr
    const fp = flatpickr(dateInput, {
        locale: 'zh',
        dateFormat: 'Y-m-d',
        defaultDate: selectedDate,
        minDate: today,
        maxDate: maxDate,  // ✅ 使用固定范围
        // ❌ 删除 enable 配置，不限制可选日期
        onChange: function(selectedDates, dateStr) {
            if (dateStr) {
                selectDate(dateStr);
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            wrapper.addEventListener('click', () => {
                instance.open();
            });
            setTimeout(markDateTypes, 100);
        },
        onOpen: function() {
            setTimeout(markDateTypes, 100);
        },
        onMonthChange: function() {
            setTimeout(markDateTypes, 100);
        },
        onYearChange: function() {
            setTimeout(markDateTypes, 100);
        },
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const date = new Date(dayElem.dateObj);
            date.setHours(0, 0, 0, 0);
            const dateStr = formatDateToString(date);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // ✅ 标记所有未来的日期（不依赖 disabled 状态）
            if (date >= today) {
                if (availableDates.includes(dateStr)) {
                    dayElem.classList.add('has-screenings');
                } else {
                    dayElem.classList.add('no-screenings');
                }
            }
            // ✅ 过去的日期会被 Flatpickr 自动标记为 disabled
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

// ✅ 标记不同类型的日期
function markDateTypes() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // ✅ 获取所有日期单元格（包括其他月份的日期）
    const dayElements = document.querySelectorAll('.flatpickr-day');
    
    dayElements.forEach(dayEl => {
        // 获取日期对象
        const dateObj = dayEl.dateObj;
        if (!dateObj) return;
        
        const date = new Date(dateObj);
        date.setHours(0, 0, 0, 0);
        
        const dateStr = formatDateToString(date);
        
        // 移除所有自定义类
        dayEl.classList.remove('has-screenings', 'no-screenings');
        
        // ✅ 判断日期类型（不区分是否为其他月份）
        if (date < today) {
            // 已过期的日期（由 Flatpickr 自动标记为 disabled）
            // 不需要额外处理
        } else if (dateObj >= today) {
            // ✅ 未来日期：根据场次情况标记
            if (availableDates.includes(dateStr)) {
                dayEl.classList.add('has-screenings');
            } else {
                dayEl.classList.add('no-screenings');
            }
        }
    });
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

// // 选择日期
// function selectDate(dateStr) {
//     selectedDate = dateStr;
    
//     // 更新日期输入框的值
//     const dateInput = document.getElementById('date-input');
//     dateInput.value = dateStr;
    
//     // 更新显示文本
//     updateDateText(dateStr);
    
//     // 重新渲染影院标签，并自动选择第一个有场次的影院
//     renderCinemaTabs();
// }
// ✅ 选择日期
function selectDate(dateStr) {
    selectedDate = dateStr;
    
    // 更新日期输入框的值
    const dateInput = document.getElementById('date-input');
    dateInput.value = dateStr;
    
    // 更新显示文本
    updateDateText(dateStr);
    
    // ✅ 如果当前有筛选条件，需要重新过滤影院
    const cityInput = document.getElementById('city-filter');
    const districtInput = document.getElementById('district-filter');
    const cinemaNameInput = document.getElementById('cinema-name-filter');
    
    const city = cityInput?.value.trim();
    const district = districtInput?.value.trim();
    const cinemaName = cinemaNameInput?.value.trim();
    
    if (city || district || cinemaName) {
        // ✅ 有筛选条件，重新执行筛选（会自动结合新日期）
        if (city && district) {
            loadScreeningsByLocation(city, district);
        } else if (city) {
            loadScreeningsByCity(city);
        } else if (cinemaName) {
            loadScreeningsByName(cinemaName);
        }
    } else {
        // ✅ 没有筛选条件，正常渲染
        renderCinemaTabs();
    }
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
    const cinemasWithScreenings = filteredCinemas.filter(cinema => {
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
        
        // 绑定点击事件，传入在 filteredCinemas 中的索引
        const originalIndex = filteredCinemas.indexOf(cinema);
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
    const firstCinemaIndex = filteredCinemas.indexOf(cinemasWithScreenings[0]);
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
        const cinema = filteredCinemas.find(c => c.cinemaName === tab.textContent);
        if (cinema && filteredCinemas.indexOf(cinema) === index) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 渲染当前影院的场次
    renderCinemaScreenings(filteredCinemas[index]);
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
    
    // ✅ 添加调试日志
    console.log('📦 创建场次行，screening对象:', screening);
    console.log('📦 screeningId:', screening.screeningId);
    
    // ✅ 验证 screeningId 是否存在
    if (!screening.screeningId) {
        console.error('❌ 错误：screening对象缺少screeningId字段！', screening);
    }
    
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
                    data-screening-id="${screening.screeningId || 'undefined'}"
                    ${screening.status !== '可售' ? 'disabled' : ''}>
                ${getButtonText(screening.status)}
            </button>
        </div>
    `;
    
    // ✅ 绑定按钮事件时再次验证
    const btn = row.querySelector('.buy-btn');
    if (screening.status === '可售') {
        btn.onclick = () => {
            console.log('🎯 点击选座购票按钮');
            console.log('   screening对象:', screening);
            console.log('   screeningId:', screening.screeningId);
            
            // ✅ 确保 screeningId 有效
            if (!screening.screeningId) {
                showMessage('场次ID无效，无法选座', 'error');
                return;
            }
            
            goToSeatSelection(screening.screeningId);
        };
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

// 跳转到选座页面
function goToSeatSelection(screeningId) {
    console.log('🔗 准备跳转到选座页面');
    console.log('   接收到的 screeningId:', screeningId);
    console.log('   screeningId 类型:', typeof screeningId);
    console.log('   screeningId 有效性:', screeningId && screeningId > 0);
    
    // ✅ 严格验证 screeningId
    if (!screeningId || screeningId === 'undefined' || isNaN(screeningId) || screeningId <= 0) {
        console.error('❌ 场次ID无效:', screeningId);
        showMessage('场次ID无效，无法选座', 'error');
        return;
    }
    
    // ✅ 构建跳转URL
    const url = `seat-selection.html?screeningId=${screeningId}`;
    console.log('✅ 跳转URL:', url);
    
    window.location.href = url;
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
    initCinemaFilter(); 
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