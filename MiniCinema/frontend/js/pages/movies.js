import userState from '../userState.js';
import eventBus from '../eventBus.js';
import api from '../api.js';
import { showMessage } from '../utils.js';

let currentPage = 1;
const pageSize = 12;
let currentSearchParams = {
    keyword: '',
    genre: '',
    sort: 'rating'
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();

    // 监听登录/退出事件，更新页面状态
    eventBus.on('userLogin', () => {
        console.log('用户已登录，刷新电影列表');
    });

    eventBus.on('userLogout', () => {
        console.log('用户已退出，刷新电影列表');
    });
});

// 加载电影列表
async function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    const loadingDiv = document.getElementById('loadingDiv');
    const emptyState = document.getElementById('emptyState');

    loadingDiv.style.display = 'block';
    moviesGrid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        console.log('正在加载电影列表...', { page: currentPage, pageSize: pageSize });
        const response = await api.get('/api/movies', {
            page: currentPage,
            pageSize: pageSize
        });

        console.log('API 响应:', response);
        loadingDiv.style.display = 'none';

        if (response.code === 1 && response.data && response.data.records && response.data.records.length > 0) {
            console.log('成功加载', response.data.records.length, '部电影');
            response.data.records.forEach(movie => {
                const movieCard = createMovieCard(movie);
                moviesGrid.appendChild(movieCard);
            });

            renderPagination(response.data.total, response.data.totalPages);
        } else {
            console.warn('没有电影数据或响应格式错误:', response);
            emptyState.style.display = 'block';
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        emptyState.style.display = 'block';
        console.error('加载电影失败:', error);
        showMessage('加载电影失败: ' + error.message, 'error');
    }
}

// 创建电影卡片
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => goToDetail(movie.movieId);

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.src = movie.posterUrl || 'https://via.placeholder.com/200x280?text=No+Image';
    poster.onerror = () => poster.src = 'https://via.placeholder.com/200x280?text=No+Image';

    const info = document.createElement('div');
    info.className = 'movie-info';

    const title = document.createElement('div');
    title.className = 'movie-title';
    title.textContent = movie.title || '未知电影';

    const rating = document.createElement('div');
    rating.className = 'movie-rating';
    rating.textContent = `⭐ ${movie.rating || 0} 分`;

    const year = document.createElement('div');
    year.className = 'movie-year';
    // releaseDate 是日期，需要提取年份
    const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '未知年份';
    year.textContent = `${releaseYear} 年`;

    const btn = document.createElement('button');
    btn.className = 'movie-btn';
    btn.textContent = '选座购票';
    btn.onclick = (e) => {
        e.stopPropagation();
        bookTicket(movie.movieId);
    };

    info.appendChild(title);
    info.appendChild(rating);
    info.appendChild(year);
    info.appendChild(btn);

    card.appendChild(poster);
    card.appendChild(info);

    return card;
}

// 搜索电影
async function searchMovies() {
    currentSearchParams.keyword = document.getElementById('searchInput').value;
    currentSearchParams.genre = document.getElementById('genreSelect').value;
    currentSearchParams.sort = document.getElementById('sortSelect').value;
    currentPage = 1;

    const moviesGrid = document.getElementById('moviesGrid');
    const loadingDiv = document.getElementById('loadingDiv');
    const emptyState = document.getElementById('emptyState');

    loadingDiv.style.display = 'block';
    moviesGrid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        const response = await api.searchMovies(
            currentSearchParams.keyword,
            currentSearchParams.genre,
            currentPage,
            pageSize
        );

        loadingDiv.style.display = 'none';

        if (response.code === 1 && response.data && response.data.records && response.data.records.length > 0) {
            response.data.records.forEach(movie => {
                const movieCard = createMovieCard(movie);
                moviesGrid.appendChild(movieCard);
            });
            renderPagination(response.data.total, response.data.totalPages);
        } else {
            emptyState.style.display = 'block';
            document.getElementById('pagination').innerHTML = '';
            showMessage('没有找到匹配的电影', 'info');
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        emptyState.style.display = 'block';
        console.error('搜索电影失败:', error);
        showMessage('搜索失败，请重试', 'error');
    }
}

// 推荐列表载入（按钮触发）
async function loadRecommendedMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    const loadingDiv = document.getElementById('loadingDiv');
    const emptyState = document.getElementById('emptyState');

    loadingDiv.style.display = 'block';
    moviesGrid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        console.log('请求推荐电影');
        const resp = await api.getRecommendedMovies(pageSize);
        console.log('推荐接口返回：', resp);
        loadingDiv.style.display = 'none';

        // normalize response to an array of movie objects
        let recList = [];

        // Common shapes handled:
        // 1) plain array -> [ {movie...}, ... ]
        // 2) { code: 1, data: [ ... ] }
        // 3) { code: 1, data: { records: [...] } }
        // 4) { code: 1, data: { movies: [...] } }
        // 5) { records: [...] } or { movies: [...] } or { list: [...] }
        if (!resp) {
            recList = [];
        } else if (Array.isArray(resp)) {
            recList = resp;
        } else if (Array.isArray(resp.data)) {
            recList = resp.data;
        } else if (resp.data && Array.isArray(resp.data.records)) {
            recList = resp.data.records;
        } else if (resp.data && Array.isArray(resp.data.movies)) {
            recList = resp.data.movies;
        } else if (resp.data && Array.isArray(resp.data.list)) {
            recList = resp.data.list;
        } else if (Array.isArray(resp.records)) {
            recList = resp.records;
        } else if (Array.isArray(resp.movies)) {
            recList = resp.movies;
        } else if (Array.isArray(resp.list)) {
            recList = resp.list;
        } else if (resp.data && resp.data.recommendations && Array.isArray(resp.data.recommendations)) {
            recList = resp.data.recommendations;
        } else if (resp.code === 1 && resp.data && typeof resp.data === 'object') {
            // single-object response containing movie fields? fallback: try to coerce
            if (Array.isArray(resp.data.items)) recList = resp.data.items;
            else if (Array.isArray(resp.data.results)) recList = resp.data.results;
        }

        // Helper: normalize a movie object so downstream code can rely on movie.movieId, movie.posterUrl, movie.title, movie.rating
        function normalizeMovie(raw) {
            if (!raw) return null;
            const m = Object.assign({}, raw);
            // id variants
            if (!m.movieId) {
                if (m.id) m.movieId = m.id;
                else if (m.movie_id) m.movieId = m.movie_id;
                else if (m.movieIdStr && !isNaN(Number(m.movieIdStr))) m.movieId = Number(m.movieIdStr);
            }
            // poster variants
            if (!m.posterUrl) {
                if (m.poster_url) m.posterUrl = m.poster_url;
                else if (m.poster) m.posterUrl = m.poster;
            }
            // title variants
            if (!m.title) {
                if (m.name) m.title = m.name;
            }
            // rating variants
            if (m.rating === undefined || m.rating === null) {
                if (m.score !== undefined) m.rating = m.score;
                else if (m.avgRating !== undefined) m.rating = m.avgRating;
            }
            return m;
        }

        // normalize whole list
        recList = recList.map(normalizeMovie).filter(Boolean);

        if (recList && recList.length) {
            recList.forEach(movie => {
                moviesGrid.appendChild(createMovieCard(movie));
            });
        } else {
            emptyState.style.display = 'block';
            showMessage('获取推荐失败或者无推荐', 'info');
        }
    } catch (e) {
        loadingDiv.style.display = 'none';
        emptyState.style.display = 'block';
        console.error('获取推荐失败', e);
        showMessage('获取推荐失败', 'error');
    }
}

function renderPagination(total, totalPages = Math.ceil(total / pageSize)) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (total <= pageSize) {
        return;
    }

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            currentSearchParams.keyword ? searchMovies() : loadMovies();
        }
    };
    pagination.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `${currentPage} / ${Math.max(totalPages, 1)}`;
    pagination.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            currentSearchParams.keyword ? searchMovies() : loadMovies();
        }
    };
    pagination.appendChild(nextBtn);
}

// 跳转详情页
function goToDetail(movieId) {
    window.location.href = `movie-detail.html?id=${movieId}`;
}

// 购票
function bookTicket(movieId) {
    alert('即将前往选座页面购票');
    window.location.href = `movie-detail.html?id=${movieId}&book=true`;
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// 导出给 HTML 全局使用
window.searchMovies = searchMovies;
window.loadMovies = loadMovies;
window.loadRecommendedMovies = loadRecommendedMovies;
window.goToDetail = goToDetail;
window.bookTicket = bookTicket;
window.logout = logout;
