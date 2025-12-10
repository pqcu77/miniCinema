document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        showMessage('电影ID不存在', 'error');
        return;
    }

    const user = storage.getUser();

    // 记录浏览
    if (user) {
        await fetch(`${API_BASE_URL}/movies/history?userId=${user.userId}&movieId=${movieId}&watchDuration=0`, {
            method: 'POST'
        }).catch(() => {});
    }

    // 加载推荐电影
    await loadRecommendations(movieId, user ? user.userId : null);
});

/**
 * 加载推荐电影
 */
async function loadRecommendations(movieId, userId) {
    try {
        let url = `${API_BASE_URL}/movies/${movieId}/recommendations?limit=6`;
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

/**
 * 显示推荐电影
 */
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
        <div class="recommend-card" data-id="${movie.id}">
            <div class="recommend-poster">
                <img src="${movie.posterUrl || 'https://via.placeholder.com/150x225/1a1a2e/ffffff?text=电影'}" 
                     alt="${movie.title}"
                     onerror="this.src='https://via.placeholder.com/150x225/1a1a2e/ffffff?text=电影'">
            </div>
            <div class="recommend-info">
                <h4 class="recommend-title">${movie.title}</h4>
                <p class="recommend-rating">⭐ ${movie.rating || 'N/A'}</p>
                <a href="/movie-detail.html?id=${movie.id}" class="recommend-link">详情</a>
            </div>
        </div>
    `).join('');
}

