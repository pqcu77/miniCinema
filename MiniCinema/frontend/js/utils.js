const storage = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Failed to parse user data:', e);
      localStorage.removeItem('user');
      return null;
    }
  },
  removeUser: () => localStorage.removeItem('user')
};

const auth = {
  isLoggedIn: () => !!storage.getToken(),
  login: (token, user) => {
    storage.setToken(token);
    storage.setUser(user);
  },
  logout: () => {
    storage.removeToken();
    storage.removeUser();
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

  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.95)' : type === 'error' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(59, 130, 246, 0.95)'};
      backdrop-filter: blur(10px);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : type === 'error' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
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
  const user = storage.getUser();
  const headerRight = document.querySelector('.header-right');

  if (user) {
    headerRight.innerHTML = `
      <span>欢迎, ${user.username}</span>
      <a href="user-center.html">个人中心</a>
      <button onclick="handleLogout()">退出登录</button>
    `;
  } else {
    headerRight.innerHTML = `
      <a href="login.html">登录</a>
      <a href="register.html">注册</a>
    `;
  }
};

const handleLogout = async () => {
  const token = storage.getToken();
  if (token) {
    await api.logout(token);
  }
  auth.logout();
};

window.addEventListener('load', updateHeader);

