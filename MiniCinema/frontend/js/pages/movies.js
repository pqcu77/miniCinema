let currentPage = 1;
const pageSize = 10;

const loadMovies = async (page = 1) => {
  const container = document.getElementById('moviesContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>正在加载电影...</p></div>';

  try {
    const response = await api.getMovies(page, pageSize);

    if (response.code === 1) {
      const movies = response.data.list || response.data || [];

      if (movies.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: rgba(255,255,255,0.7);">暂无电影</p>';
        return;
      }

      container.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
          <div class="movie-poster">
            <img src="${movie.posterUrl || 'https://via.placeholder.com/200x280/1a1a2e/ffffff?text=' + encodeURIComponent(movie.title || '电影')}" 
                 alt="${movie.title}" 
                 onerror="this.src='https://via.placeholder.com/200x280/1a1a2e/ffffff?text=电影海报'">
          </div>
          <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-rating">
              <span class="stars">★★★★☆</span>
              <span class="score">${movie.rating || '8.5'}</span>
            </div>
            <div class="movie-year">${movie.releaseDate ? movie.releaseDate.substring(0, 4) : '2024'}</div>
          </div>
        </div>
      `).join('');

      currentPage = page;
      updatePagination(response.data.total || movies.length);
    }
  } catch (error) {
    container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: rgba(255,255,255,0.7);">加载失败，请稍后重试</p>';
  }
};

const updatePagination = (total) => {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';

  if (currentPage > 1) {
    html += `<button onclick="loadMovies(${currentPage - 1})">上一页</button>`;
  }

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadMovies(${i})">${i}</button>`;
  }

  if (currentPage < totalPages) {
    html += `<button onclick="loadMovies(${currentPage + 1})">下一页</button>`;
  }

  pagination.innerHTML = html;
};

const handleSearch = async () => {
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) {
    loadMovies(1);
    return;
  }

  const container = document.getElementById('moviesContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>正在搜索...</p></div>';

  try {
    const response = await api.searchMovies(keyword);

    if (response.code === 1) {
      const movies = response.data || [];

      if (movies.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: rgba(255,255,255,0.7);">未找到相关电影</p>';
        return;
      }

      container.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${movie.id}'">
          <div class="movie-poster">
            <img src="${movie.posterUrl || 'https://via.placeholder.com/200x280/1a1a2e/ffffff?text=' + encodeURIComponent(movie.title || '电影')}" 
                 alt="${movie.title}"
                 onerror="this.src='https://via.placeholder.com/200x280/1a1a2e/ffffff?text=电影海报'">
          </div>
          <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-rating">
              <span class="stars">★★★★☆</span>
              <span class="score">${movie.rating || '8.5'}</span>
            </div>
            <div class="movie-year">${movie.releaseDate ? movie.releaseDate.substring(0, 4) : '2024'}</div>
          </div>
        </div>
      `).join('');

      // 隐藏分页，因为这是搜索结果
      document.getElementById('pagination').innerHTML = '';
    }
  } catch (error) {
    showMessage('搜索失败', 'error');
    container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: rgba(255,255,255,0.7);">搜索失败</p>';
  }
};

// 添加回车搜索功能
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }
});

loadMovies();
