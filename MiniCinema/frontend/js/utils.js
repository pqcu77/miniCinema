import userState from './userState.js';
import eventBus from './eventBus.js';
import api from './api.js';

const storage = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  setUser: (user) => localStorage.setItem('userInfo', JSON.stringify(user)),
  getUser: () => {
    try {
      const user = localStorage.getItem('userInfo');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Failed to parse user data:', e);
      localStorage.removeItem('userInfo');
      return null;
    }
  },
  removeUser: () => localStorage.removeItem('userInfo')
};

const auth = {
  isLoggedIn: () => userState.isLoggedIn(),
  login: (token, user) => {
    storage.setToken(token);
    if (user) storage.setUser(user);
    // 使用全局状态管理
    userState.setUser({ ...user, token });
  },
  logout: () => {
    storage.removeToken();
    storage.removeUser();
    // 使用全局状态管理
    userState.clearUser();
    window.location.href = 'login.html';
  }
};

const showMessage = (message, type = 'error', duration = 3000) => {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());

  const notification = document.createElement('div');
  notification.className = 'notification';

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  // compute colors to avoid complex inline expressions in template
  const bgColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : type === 'error' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(59, 130, 246, 0.95)';
  const borderColor = type === 'success' ? 'rgba(34, 197, 94, 0.3)' : type === 'error' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(59, 130, 246, 0.3)';

  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      backdrop-filter: blur(10px);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border: 1px solid ${borderColor};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      font-weight: 500;
      max-width: 350px;
      animation: slideIn 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    ">
      <span style="font-size: 1.2rem;">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  // Add animation styles if not already present
  if (!document.querySelector('#notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
};

const updateHeader = () => {
  const user = userState.getUser();
  const headerRight = document.querySelector('.header-right');

  if (!headerRight) return; // 如果页面没有 header，直接返回

  if (user) {
    headerRight.innerHTML = `
      <span class="user-welcome">欢迎, ${user.username}</span>
      <a href="user-center.html" class="header-link">个人中心</a>
      <button onclick="handleLogout()" class="logout-btn">退出登录</button>
    `;
  } else {
    headerRight.innerHTML = `
      <a href="login.html" class="header-link">登录</a>
      <a href="register.html" class="header-link">注册</a>
    `;
  }
};

const handleLogout = async () => {
  const token = storage.getToken();
  if (token) {
    try { await api.logout(token); } catch (e) { console.warn('logout API failed', e); }
  }
  auth.logout();
};

// 在页面加载时，如果有 token 但没有 user，自动拉取用户信息并缓存
async function bootstrapAuth() {
  try {
    const token = storage.getToken();
    const user = storage.getUser();
    if (token && !user) {
      const info = await api.getUserInfo(token);
      if (info && (info.code === 1 || info.msg === 'success') && info.data) {
        storage.setUser(info.data);
        userState.setUser({ ...info.data, token });
      }
    }
  } catch (e) {
    // 拉取失败不影响页面，其它操作会提示登录
    console.debug('bootstrapAuth failed:', e);
  } finally {
    updateHeader();
  }
}

// 初始化全局事件监听
function initGlobalEvents() {
  // 监听用户登录事件
  eventBus.on('userLogin', (user) => {
    console.log('用户登录事件触发:', user);
    updateHeader();
  });

  // 监听用户退出事件
  eventBus.on('userLogout', () => {
    console.log('用户退出事件触发');
    updateHeader();
  });

  // 监听用户信息更新事件
  eventBus.on('userUpdated', (user) => {
    console.log('用户信息更新事件触发:', user);
    updateHeader();
  });
}

// 在 localStorage 变化（另一个 tab/login）时更新 header
window.addEventListener('storage', (e) => {
  if (e.key === 'userInfo' || e.key === 'token') {
    console.log('storage 事件触发，刷新 header');
    // reload userState from storage
    userState.loadUserFromStorage?.();
    updateHeader();
  }
});

// 页面加载时初始化
window.addEventListener('load', () => {
  initGlobalEvents();
  bootstrapAuth();
});

// 导出工具函数，以便在模块中使用
export { storage, auth, showMessage, updateHeader, handleLogout };

// 将关键函数挂载到全局 window 对象，以便在 HTML 的 onclick 中使用
window.handleLogout = handleLogout;
window.showMessage = showMessage;
