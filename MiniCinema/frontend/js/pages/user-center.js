import userState from '../userState.js';
import eventBus from '../eventBus.js';
import api from '../api.js';
import { storage, auth, showMessage } from '../utils.js';

if (!auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

const switchTab = async (tab) => {
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.content-tab').forEach(el => el.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tab).classList.add('active');

  if (tab === 'info') loadUserInfo();
  else if (tab === 'password') loadPasswordForm();
  else if (tab === 'favorites') loadFavorites();
  else if (tab === 'orders') loadOrders();
};

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
    const response = await api.getFavorites(token);

    if (response.code === 200) {
      const favorites = response.data || [];

      if (favorites.length === 0) {
        container.innerHTML = '<p>还没有收藏电影</p>';
        return;
      }

      container.innerHTML = `
        <h2>我的收藏</h2>
        <div class="movies-grid" style="margin-top: 1.5rem;">
          ${favorites.map(fav => `
            <div class="movie-card" onclick="window.location.href='movie-detail.html?id=${fav.movieId}'">
              <div class="movie-poster">
                <img src="${fav.posterUrl || 'https://via.placeholder.com/200x280'}" alt="">
              </div>
              <div class="movie-info">
                <div class="movie-title">${fav.title}</div>
                <div class="movie-rating">⭐ ${fav.rating || '8.0'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
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

