import userState from '../userState.js';
import eventBus from '../eventBus.js';
import api from '../api.js';
import { storage, auth, showMessage } from '../utils.js';

if (!auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

const switchTab = async (tab, evt) => {
  // support being called from inline onclick (evt may be undefined)
  const eventObj = evt || window.event;
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.content-tab').forEach(el => el.classList.remove('active'));

  if (eventObj && eventObj.target) eventObj.target.classList.add('active');
  const targetEl = document.getElementById(tab);
  if (targetEl) targetEl.classList.add('active');

  if (tab === 'info') loadUserInfo();
  else if (tab === 'password') loadPasswordForm();
  else if (tab === 'favorites') loadFavorites();
  else if (tab === 'history') loadHistory();
};

// expose switchTab for inline handlers
window.switchTab = switchTab;

const loadUserInfo = async () => {
  const user = storage.getUser() || {};
  const token = storage.getToken();

  // If not logged in, redirect (extra guard)
  if (!token || !user.username) {
    auth.logout();
    return;
  }

  document.getElementById('info').innerHTML = `
    <h2>个人信息</h2>
    <form id="userForm" style="margin-top: 1.5rem;">
      <div class="form-group">
        <label>用户名</label>
        <input type="text" value="${user.username}" disabled style="background: #f5f5f5;">
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input type="email" id="email" value="${user.email || ''}" required>
      </div>
      <button type="submit" class="btn">保存修改</button>
    </form>
  `;

  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const response = await api.updateUser(token, {
        email: document.getElementById('email').value
      });

      // Accept backend success flags: code===1, code===200, or success===true
      const ok = response && (response.code === 1 || response.code === 200 || response.success === true);
      if (ok) {
        // backend commonly returns updated user in response.data
        const updated = response.data || response.user || null;
        if (updated) storage.setUser(updated);
        showMessage('更新成功', 'success');
      } else {
        showMessage(response?.msg || response?.message || '更新失败', 'error');
      }
    } catch (error) {
      console.error('Update user failed', error);
      showMessage('更新失败', 'error');
    }
  });
};

// Enhanced error handling for password change
const loadPasswordForm = () => {
  const token = storage.getToken();

  document.getElementById('password').innerHTML = `
    <h2>修改密码</h2>
    <form id="passwordForm" style="margin-top: 1.5rem; max-width: 400px;">
      <div class="form-group">
        <label>原密码</label>
        <input type="password" id="oldPassword" required>
      </div>
      <div class="form-group">
        <label>新密码</label>
        <input type="password" id="newPassword" required>
      </div>
      <div class="form-group">
        <label>确认密码</label>
        <input type="password" id="confirmPassword" required>
      </div>
      <button type="submit" class="btn">修改密码</button>
    </form>
  `;

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showMessage('两次输入的密码不一致', 'error');
      return;
    }

    try {
      // resolve userId explicitly to ensure backend receives it
      const storedUser = storage.getUser() || userState.getUser() || null;
      const resolvedUserId = storedUser?.userId ?? null;
      if (!resolvedUserId) {
        showMessage('未检测到登录用户，请重新登录后重试', 'error');
        return;
      }

      const response = await api.changePassword(token, oldPassword, newPassword, confirmPassword, resolvedUserId);

      const ok = response && (response.code === 1 || response.code === 200 || response.success === true);
      if (ok) {
        showMessage('密码修改成功', 'success', 2000);
        setTimeout(() => auth.logout(), 2000);
      } else {
        showMessage(response?.msg || response?.message || '修改失败，请检查输入', 'error');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      showMessage('修改失败，请稍后再试', 'error');
    }
  });
};

const loadFavorites = async () => {
  const token = storage.getToken();
  const container = document.getElementById('favorites');
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    console.log('loadFavorites: calling api.getFavorites with token=', token);
    const response = await api.getFavorites(token);
    console.log('loadFavorites: raw response=', response);

    let favorites = [];
    if (Array.isArray(response)) {
      favorites = response;
    } else if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) favorites = response.data;
      else if (response.data && Array.isArray(response.data.records)) favorites = response.data.records;
      else if (Array.isArray(response.records)) favorites = response.records;
      else if (Array.isArray(response.data?.records)) favorites = response.data.records;
      // Some backends return {code:1, data: [...]}
      else if (Array.isArray(response.data?.favorites)) favorites = response.data.favorites;
    }

    if (!Array.isArray(favorites)) favorites = [];
    console.log('loadFavorites: resolved favorites count=', favorites.length);

    if (favorites.length === 0) {
      container.innerHTML = '<p>还没有收藏电影或推荐失败</p>';
      return;
    }

    const resolved = await Promise.all(favorites.map(async (raw) => {
      const movieId = raw.movieId ?? raw.movie_id ?? raw.movie?.movieId ?? raw.movie?.id ?? raw.id ?? null;
      const posterUrlCandidate = raw.posterUrl ?? raw.poster_url ?? raw.poster ?? raw.movie?.posterUrl ?? raw.movie?.poster_url ?? raw.movie?.poster ?? raw.movie?.poster_path ?? null;
      const titleCandidate = raw.title ?? raw.name ?? raw.movie?.title ?? raw.movie?.name ?? '';

      let posterUrl = posterUrlCandidate;
      let title = titleCandidate;
      let rating = raw.rating ?? raw.score ?? raw.movie?.rating ?? '';

      if ((!posterUrl || posterUrl === '') || (!title || title === '')) {
        try {
          const detailResp = await api.getMovieDetail(movieId);
          if (detailResp && (detailResp.code === 1 || detailResp.code === 200) && detailResp.data) {
            posterUrl = posterUrl || detailResp.data.posterUrl || detailResp.data.poster_url || null;
            title = title || detailResp.data.title || detailResp.data.name || '';
            rating = rating || detailResp.data.rating || null;
          }
        } catch (e) {
          console.debug('loadFavorites: failed to fetch movie detail for fallback', movieId, e);
        }
      }

      return {
        movieId: String(movieId),
        posterUrl: posterUrl || 'https://via.placeholder.com/200x280',
        title: title || '',
        rating: rating || 'N/A'
      };
    }));

    const cards = resolved.map(item => {
      const idForLink = encodeURIComponent(item.movieId);
      const poster = item.posterUrl;
      const title = item.title || '';
      const rating = item.rating || 'N/A';
      return `
        <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${idForLink}'">
          <div class="movie-poster">
            <img src="${poster}" alt="${title}" onerror="this.src='https://via.placeholder.com/200x280'">
          </div>
          <div class="movie-info">
            <div class="movie-title">${title}</div>
            <div class="movie-rating">⭐ ${rating}</div>
          </div>
        </div>
      `;
    });

    if (cards.length === 0) {
      container.innerHTML = '<p>还没有收藏电影或数据格式不符</p>';
      return;
    }

    const cardsHtml = cards.join('');

    container.innerHTML = `
      <h2>我的收藏</h2>
      <div class="movies-grid" style="margin-top: 1.5rem;">
        ${cardsHtml}
      </div>
    `;

  } catch (error) {
    console.error('加载收藏失败', error);
    container.innerHTML = '<p>加载失败，请稍后重试</p>';
  } finally {
    // extend spinner timeout to 5s to avoid quick replacement
    if (container && container.querySelector('.spinner')) {
      setTimeout(() => {
        if (container && container.querySelector('.spinner')) {
          console.warn('loadFavorites: spinner timeout, replacing with fallback');
          container.innerHTML = '<p>加载超时，请稍后重试</p>';
        }
      }, 5000);
    }
  }
};

const loadHistory = async () => {
  const token = storage.getToken();
  const user = storage.getUser();
  const container = document.getElementById('history');
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    console.log('loadHistory: calling api with userId=', user?.userId);

    // Call GET /api/movies/history?userId=xxx
    const response = await api.get(`/api/movies/history`, {
      userId: user?.userId,
      limit: 50
    });

    console.log('loadHistory: raw response=', response);

    let historyMovies = [];
    if (Array.isArray(response)) {
      historyMovies = response;
    } else if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) historyMovies = response.data;
      else if (response.data && Array.isArray(response.data.records)) historyMovies = response.data.records;
      else if (Array.isArray(response.records)) historyMovies = response.records;
    }

    if (!Array.isArray(historyMovies)) historyMovies = [];
    console.log('loadHistory: resolved history count=', historyMovies.length);

    if (historyMovies.length === 0) {
      container.innerHTML = '<h2>历史记录</h2><p style="margin-top: 1.5rem;">暂无历史记录</p>';
      return;
    }

    const cards = historyMovies.map(movie => {
      const movieId = movie.movieId || movie.movie_id || movie.id;
      const posterUrl = movie.posterUrl || movie.poster_url || movie.poster || 'https://via.placeholder.com/200x280';
      const title = movie.title || movie.name || '未知电影';
      const rating = movie.rating || movie.score || 'N/A';

      return `
        <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${encodeURIComponent(movieId)}'">
          <img src="${posterUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
          <div class="movie-info">
            <h3>${title}</h3>
            <p>评分: ${rating}</p>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <h2>历史记录</h2>
      <div class="movies-grid" style="margin-top: 1.5rem;">
        ${cards}
      </div>
    `;

  } catch (error) {
    console.error('加载历史记录失败', error);
    container.innerHTML = '<h2>历史记录</h2><p style="margin-top: 1.5rem;">加载失败，请稍后重试</p>';
  }
};

loadUserInfo();
