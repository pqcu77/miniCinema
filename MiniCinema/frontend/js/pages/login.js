// filepath: D:\Desktop\Junior\DB_proj\MiniCinema\frontend\js\pages\login_new.js
import userState from '../userState.js';
import eventBus from '../eventBus.js';
import api from '../api.js';
import { showMessage } from '../utils.js';

console.log('✅ login.js 模块已加载');

// 立即执行的函数，确保在 DOM 加载后绑定事件
function initLoginPage() {
  console.log('🔍 开始初始化登录页面');

  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    console.error('❌ 找不到登录表单 #loginForm');
    return;
  }

  console.log('✅ 找到登录表单，绑定提交事件');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 登录表单提交事件触发');

    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();

    console.log('📋 登录信息:', { username, password: '***' });

    if (!username || !password) {
      showMessage('请输入用户名和密码', 'error');
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '登录中...';
    }

    try {
      console.log('🔄 调用登录 API...');
      const response = await api.login(username, password);
      console.log('📥 登录 API 响应:', response);

      // 检查响应是否为有效对象
      if (!response || typeof response !== 'object') {
        console.error('❌ 响应格式错误，不是有效的JSON对象:', typeof response);
        showMessage('网络错误：无效的服务器响应', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = '立即登录';
        }
        return;
      }

      if (response.code === 1 && response.data) {
        console.log('✅ 登录成功，保存用户信息');

        // 保存用户信息到全局状态
        const userData = {
          userId: response.data.userId,
          username: response.data.username,
          email: response.data.email || '',
          token: response.data.token
        };

        console.log('💾 保存用户数据:', userData);
        userState.setUser(userData);

        // 验证保存是否成功
        const savedUser = userState.getUser();
        console.log('✔️ 验证保存的用户信息:', savedUser);
        console.log('✔️ 验证登录状态:', userState.isLoggedIn());

        showMessage('登录成功！正在跳转...', 'success', 1500);

        // 1.5秒后跳转到电影列表页
        setTimeout(() => {
          console.log('🔀 正在跳转到电影列表页...');
          window.location.href = 'movies.html';
        }, 1500);
      } else {
        console.error('❌ 登录失败，响应代码:', response.code, '消息:', response.msg);
        showMessage(response.msg || '登录失败，请检查用户名和密码', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = '立即登录';
        }
      }
    } catch (error) {
      console.error('❌ 登录错误详情:');
      console.error('   错误类型:', error.name);
      console.error('   错误信息:', error.message);
      console.error('   完整错误:', error);
      showMessage('网络错误，请检查后端服务是否启动（后端地址：http://localhost:8080）', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '立即登录';
      }
    }
  });

  console.log('✅ 登录表单事件绑定完成');
}

// 确保 DOM 加载完成后再初始化
if (document.readyState === 'loading') {
  console.log('⏳ 等待 DOM 加载...');
  document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
  console.log('✅ DOM 已加载，立即初始化');
  initLoginPage();
}

