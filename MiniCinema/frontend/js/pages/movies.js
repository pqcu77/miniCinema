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
        // 调用后端API - 分页获取电影列表
        const response = await api.get('/api/movies/list', {
            page: currentPage,
            pageSize: pageSize
        });

        loadingDiv.style.display = 'none';

        // 检查后端返回的 code 字段（1=成功，0=失败）
        if (response.code === 1 && response.data && response.data.records && response.data.records.length > 0) {
            response.data.records.forEach(movie => {
                const movieCard = createMovieCard(movie);
                moviesGrid.appendChild(movieCard);
            });

            // 渲染分页
            renderPagination(response.data.total);
        } else {
            emptyState.style.display = 'block';
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        emptyState.style.display = 'block';
        console.error('加载电影失败:', error);
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
        // 调用搜索接口
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
            renderPagination(response.data.total);
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

// 获取推荐电影
async function loadRecommendedMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    const loadingDiv = document.getElementById('loadingDiv');
    const emptyState = document.getElementById('emptyState');

    loadingDiv.style.display = 'block';
    moviesGrid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        const response = await api.getRecommendedMovies(pageSize);

        loadingDiv.style.display = 'none';

        if (response.code === 1 && response.data && response.data.records && response.data.records.length > 0) {
            response.data.records.forEach(movie => {
                const movieCard = createMovieCard(movie);
                moviesGrid.appendChild(movieCard);
            });
            document.getElementById('pagination').innerHTML = '';
        } else {
            emptyState.style.display = 'block';
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        emptyState.style.display = 'block';
        console.error('加载推荐电影失败:', error);
    }
}

// 渲染分页
function renderPagination(total) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) return;

    // 上一页按钮
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadMovies();
        }
    };
    pagination.appendChild(prevBtn);

    // 页码
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.textContent = '1';
        firstBtn.onclick = () => {
            currentPage = 1;
            loadMovies();
        };
        pagination.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => {
            currentPage = i;
            loadMovies();
        };
        pagination.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pagination.appendChild(dots);
        }

        const lastBtn = document.createElement('button');
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => {
            currentPage = totalPages;
            loadMovies();
        };
        pagination.appendChild(lastBtn);
    }

    // 下一页按钮
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadMovies();
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
