import api from '../api.js';
import { showMessage } from '../utils.js';

console.log('register.js 模块已加载');

// 确保 DOM 加载完成后再绑定事件
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 加载完成，开始绑定注册表单事件');

  const registerForm = document.getElementById('registerForm');
  if (!registerForm) {
    console.error('找不到注册表单 #registerForm');
    return;
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('注册表单提交');

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      showMessage('两次输入的密码不一致', 'error');
      return;
    }

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = '注册中...';

    try {
      console.log('调用注册 API...');
      const response = await api.register(username, password, email, confirmPassword);
      console.log('注册 API 响应:', response);

      if (response.code === 1) {
        showMessage('注册成功，跳转到登录页...', 'success', 2000);
        setTimeout(() => window.location.href = 'login.html', 2000);
      } else {
        showMessage(response.msg || '注册失败', 'error');
      }
    } catch (error) {
      console.error('注册错误:', error);
      showMessage('网络错误，请重试', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '注册';
    }
  });

  console.log('注册表单事件绑定完成');
});

