import userState from '../userState.js';
import eventBus from '../eventBus.js';
import api, { API_BASE_URL } from '../api.js';
import { showMessage } from '../utils.js';

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

if (!movieId) {
    showMessage('电影ID不存在', 'error');
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!movieId) {
        return;
    }

    await loadMovieDetail();

    const user = userState.getUser();

    if (user) {
        await fetch(`${API_BASE_URL}/api/movies/${movieId}/history?userId=${user.userId}&watchDuration=0`, {
            method: 'POST'
        }).catch(() => {});
    }

    await loadRecommendations(movieId, user ? user.userId : null);
    await loadComments(movieId);

    // 监听登录事件，登录后刷新页面状态
    eventBus.on('userLogin', async () => {
        await loadMovieDetail();
        await loadComments(movieId);
    });
});

async function loadMovieDetail() {
    const container = document.getElementById('movieDetail');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>正在加载电影详情...</p></div>';

    try {
        const response = await api.getMovieDetail(movieId);
        if (response.code !== 1 || !response.data) {
            container.innerHTML = '<p class="empty-state">电影详情加载失败</p>';
            return;
        }

        const movie = response.data;
        const user = userState.getUser();
        container.innerHTML = `
            <div class="detail-poster">
              <img src="${movie.posterUrl || 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=电影海报'}" alt="${movie.title}">
            </div>
            <div class="detail-info">
              <h2>${movie.title}</h2>
              <div class="detail-meta">
                <p><strong>导演：</strong> ${movie.director || '未知'}</p>
                <p><strong>主演：</strong> ${movie.actors || '未知'}</p>
                <p><strong>类型：</strong> ${movie.genre || '未知'}</p>
                <p><strong>上映日期：</strong> ${movie.releaseDate || '未知'}</p>
                <p><strong>时长：</strong> ${movie.duration || '120'} 分钟</p>
                <p><strong>评分：</strong> ${movie.rating || '暂无'}</p>
              </div>
              <div class="detail-description">
                <h3>剧情介绍</h3>
                <p>${movie.description || '这是一部精彩的电影，敬请期待更多信息。'}</p>
              </div>
              <div class="btn-group">
                ${user ? `
                  <button class="btn" onclick="handleBuyTicket()">🎫 立即购票</button>
                  <button class="btn" onclick="handleToggleFavorite()" id="favoriteBtn" style="background: rgba(255,255,255,0.1);">❤️ 收藏</button>
                ` : `
                  <button class="btn" onclick="window.location.href='login.html'">🔐 登录购票</button>
                `}
              </div>
            </div>
        `;

        if (user) {
            await checkFavorite();
        }
    } catch (error) {
        console.error('加载电影详情失败:', error);
        container.innerHTML = '<p class="empty-state">网络异常，稍后重试</p>';
    }
}

async function checkFavorite() {
    const token = userState.getToken();
    if (!token) return;

    try {
        const favorites = await api.getFavorites(token);
        const btn = document.getElementById('favoriteBtn');
        if (!btn) return;

        if (favorites.data?.some(fav => fav.movieId == movieId)) {
            btn.textContent = '✓ 已收藏';
            btn.dataset.isFavorite = 'true';
        } else {
            btn.textContent = '+ 收藏';
            btn.dataset.isFavorite = 'false';
        }
    } catch (error) {
        console.error('检查收藏状态失败:', error);
    }
}

async function handleToggleFavorite() {
    if (!userState.isLoggedIn()) {
        showMessage('请先登录再收藏', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const token = userState.getToken();
    const btn = document.getElementById('favoriteBtn');
    const isFavorite = btn.dataset.isFavorite === 'true';

    try {
        if (isFavorite) {
            await api.removeFavorite(token, movieId);
            btn.textContent = '+ 收藏';
            btn.dataset.isFavorite = 'false';
            showMessage('取消收藏成功', 'success');
        } else {
            await api.addFavorite(token, movieId);
            btn.textContent = '✓ 已收藏';
            btn.dataset.isFavorite = 'true';
            showMessage('收藏成功', 'success');
        }
    } catch (error) {
        console.error('收藏操作失败:', error);
        showMessage('收藏失败，请稍后再试', 'error');
    }
}

function handleBuyTicket() {
    //showMessage('购票功能开发中...', 'success');
    // 检查电影ID
    if (!movieId) {
        showMessage('电影信息错误', 'error');
        return;
    }
    
    // 跳转到场次列表页面
    window.location.href = `movie-screenings.html?movieId=${movieId}`;
}

async function loadRecommendations(movieId, userId) {
    try {
        let url = `${API_BASE_URL}/api/movies/${movieId}/recommendations?limit=6`;
        if (userId) {
            url += `&userId=${userId}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.recommendations && Array.isArray(result.recommendations)) {
            displayRecommendations(result.recommendations);
        }
    } catch (error) {
        console.error('加载推荐失败:', error);
    }
}

function displayRecommendations(movies) {
    const container = document.getElementById('recommendations');

    if (!container) {
        return;
    }

    if (movies.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无推荐电影</div>';
        return;
    }

    container.innerHTML = movies.map(movie => `
        <div class="recommend-card" data-id="${movie.movieId || movie.id}">
            <div class="recommend-poster">
                <img src="${movie.posterUrl || 'https://via.placeholder.com/150x225/1a1a2e/ffffff?text=电影'}" 
                     alt="${movie.title}"
                     onerror="this.src='https://via.placeholder.com/150x225/1a1a2e/ffffff?text=电影'">
            </div>
            <div class="recommend-info">
                <h4 class="recommend-title">${movie.title}</h4>
                <p class="recommend-rating">⭐ ${movie.rating || 'N/A'}</p>
                <a href="movie-detail.html?id=${movie.movieId || movie.id}" class="recommend-link">详情</a>
            </div>
        </div>
    `).join('');
}

async function loadComments(movieId) {
    const listEl = document.getElementById('commentList');
    if (!listEl) return;

    listEl.innerHTML = '<p class="loading">正在加载评论...</p>';

    try {
        const response = await api.get(`/api/movies/${movieId}/comments`);
        if (response.code === 1 && Array.isArray(response.data)) {
            if (response.data.length === 0) {
                listEl.innerHTML = '<p class="empty-state">暂无评论，快来抢沙发！</p>';
                return;
            }

            listEl.innerHTML = response.data.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-user">用户 ${comment.userId}</span>
                        <span class="comment-rating">${comment.rating ? `评分：${comment.rating}` : ''}</span>
                    </div>
                    <p class="comment-content">${comment.content}</p>
                    <span class="comment-time">${comment.createTime || ''}</span>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<p class="empty-state">暂无评论</p>';
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        listEl.innerHTML = '<p class="empty-state">加载评论失败</p>';
    }
}

async function handleSubmitComment() {
    // 检查登录状态
    if (!userState.isLoggedIn()) {
        showMessage('请先登录再发表评论', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const user = userState.getUser();
    const contentInput = document.getElementById('commentContent');
    const ratingInput = document.getElementById('commentRating');
    const content = contentInput.value.trim();
    const rating = ratingInput.value;

    if (!content) {
        showMessage('评论内容不能为空', 'error');
        return;
    }

    try {
        const response = await api.post(`/api/movies/${movieId}/comments`, {
            userId: user.userId,
            content,
            rating: rating ? parseFloat(rating) : null
        });

        if (response.code === 1) {
            showMessage('评论成功！', 'success');
            contentInput.value = '';
            ratingInput.value = '';
            await loadComments(movieId);
        } else {
            showMessage(response.msg || '评论失败', 'error');
        }
    } catch (error) {
        console.error('提交评论失败:', error);
        showMessage('评论失败，请稍后再试', 'error');
    }
}

window.handleToggleFavorite = handleToggleFavorite;
window.handleBuyTicket = handleBuyTicket;
window.handleSubmitComment = handleSubmitComment;
