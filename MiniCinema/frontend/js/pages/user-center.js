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
  else if (tab === 'orders') loadOrders();
};

// expose switchTab for inline handlers
window.switchTab = switchTab;

const loadUserInfo = async () => {
  const user = storage.getUser();
  const token = storage.getToken();

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

      if (response.code === 200) {
        storage.setUser(response.data);
        showMessage('更新成功', 'success');
      }
    } catch (error) {
      showMessage('更新失败', 'error');
    }
  });
};

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
      const response = await api.changePassword(token, oldPassword, newPassword);

      if (response.code === 200) {
        showMessage('密码修改成功', 'success', 2000);
        setTimeout(() => auth.logout(), 2000);
      } else {
        showMessage(response.message || '修改失败', 'error');
      }
    } catch (error) {
      showMessage('修改失败', 'error');
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

    // Normalize response into an array of favorite items
    let favorites = [];
    if (Array.isArray(response)) {
      favorites = response;
    } else if (response && typeof response === 'object') {
      // common shapes: { code:1, data: { records: [...] } } or { data: [...] } or { records: [...] }
      if (Array.isArray(response.data)) favorites = response.data;
      else if (response.data && Array.isArray(response.data.records)) favorites = response.data.records;
      else if (Array.isArray(response.records)) favorites = response.records;
      else if (Array.isArray(response.data?.records)) favorites = response.data.records;
    }

    // Ensure favorites is an array
    if (!Array.isArray(favorites)) favorites = [];
    console.log('loadFavorites: resolved favorites count=', favorites.length);

    if (favorites.length === 0) {
      container.innerHTML = '<p>还没有收藏电影</p>';
      return;
    }

    // Build html with safe normalization of each favorite item so we can handle different key styles
    const cards = [];
    for (const raw of favorites) {
      try {
        // If api.getFavorites already returned normalized object (movieId, posterUrl, title), use it directly
        const source = (raw && raw.movieId && (raw.posterUrl || raw.poster_url || raw.poster)) ? raw : raw.raw ?? raw;

        const fav = {
          movieId: source.movieId ?? source.movie_id ?? source.movieid ?? source.movie?.movieId ?? source.movie?.movie_id ?? source.id ?? source.movie?.id,
          posterUrl: source.posterUrl ?? source.poster_url ?? source.posterurl ?? source.poster ?? source.movie?.posterUrl ?? source.movie?.poster_url ?? source.movie?.poster ?? source.movie?.poster_path,
          title: source.title ?? source.name ?? source.movie?.title ?? source.movie?.name ?? source.movie?.original_title ?? '',
          rating: source.rating ?? source.score ?? source.movie?.rating ?? source.movie?.vote_average ?? ''
        };

        // ensure we have an id
        const idVal = fav.movieId ?? source.movieId ?? source.movie_id ?? source.id ?? (source.movie && (source.movie.movieId || source.movie.id));
        if (!idVal) {
          console.warn('loadFavorites: skipping item without movie id', raw);
          continue;
        }

        const idForLink = encodeURIComponent(idVal);
        const poster = fav.posterUrl || 'https://via.placeholder.com/200x280';
        const title = fav.title || '';
        const rating = fav.rating || 'N/A';

        console.debug('loadFavorites: card ->', { id: idVal, poster, title, rating });

        cards.push(`
          <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${idForLink}'">
            <div class="movie-poster">
              <img src="${poster}" alt="${title}" onerror="this.src='https://via.placeholder.com/200x280'">
            </div>
            <div class="movie-info">
              <div class="movie-title">${title}</div>
              <div class="movie-rating">⭐ ${rating}</div>
            </div>
          </div>
        `);
      } catch (itemErr) {
        console.error('loadFavorites: failed to process favorite item', itemErr, raw);
        continue;
      }
    }

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
    container.innerHTML = '<p>加载失败</p>';
  } finally {
    // safety: if spinner still present and content not replaced, ensure we show a fallback quickly
    if (container && container.querySelector('.spinner')) {
      // Replace spinner after short timeout to avoid stuck UI
      setTimeout(() => {
        if (container && container.querySelector('.spinner')) {
          console.warn('loadFavorites: spinner timeout, replacing with fallback');
          container.innerHTML = '<p>加载超时，请稍后重试</p>';
        }
      }, 1000);
    }
  }
};

const loadHistory = async () => {
  const token = storage.getToken();
  const user = storage.getUser();
  const container = document.getElementById('history');
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  if (!user) {
    container.innerHTML = '<p>请先登录以查看历史记录</p>';
    return;
  }

  try {
    const response = await api.get(`/api/movies/history`, { userId: user.userId, limit: 50 });
    // api.get returns either normalized array or { code:1, data: [...] }
    let movies = [];
    if (Array.isArray(response)) movies = response;
    else if (response && response.code === 1) movies = response.data || [];
    else if (response && Array.isArray(response.data)) movies = response.data;

    if (!Array.isArray(movies) || movies.length === 0) {
      container.innerHTML = '<p>暂无历史记录</p>';
      return;
    }

    container.innerHTML = `
      <h2>历史记录</h2>
      <div class="movies-grid" style="margin-top: 1.5rem;">
        ${movies.map(m => `
          <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${m.movieId || m.movie_id || m.id}'">
            <div class="movie-poster">
              <img src="${m.posterUrl || m.poster_url || m.poster || (m.movie && (m.movie.posterUrl || m.movie.poster_url)) || 'https://via.placeholder.com/200x280'}" alt="${m.title || ''}" onerror="this.src='https://via.placeholder.com/200x280'">
            </div>
            <div class="movie-info">
              <div class="movie-title">${m.title || (m.movie && m.movie.title) || ''}</div>
              <div class="movie-rating">⭐ ${m.rating || (m.movie && m.movie.rating) || 'N/A'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('加载历史失败', error);
    container.innerHTML = '<p>加载失败</p>';
  }
};

const loadOrders = () => {
  document.getElementById('orders').innerHTML = `
    <h2>订单记录</h2>
    <p style="margin-top: 1.5rem;">订单功能开发中...</p>
  `;
};

loadUserInfo();
