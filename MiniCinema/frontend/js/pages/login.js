document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = '登录中...';

  try {
    const response = await api.login(username, password);

    if (response.code === 1) {
      auth.login(response.data.token, response.data.user);
      showMessage('登录成功！', 'success', 2000);
      setTimeout(() => window.location.href = 'movies.html', 2000);
    } else {
      showMessage(response.msg || '登录失败', 'error');
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '登录';
  }
});

