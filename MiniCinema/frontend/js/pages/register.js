document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

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
    const response = await api.register(username, password, email, confirmPassword);

    if (response.code === 1) {
      showMessage('注册成功，跳转到登录页...', 'success', 2000);
      setTimeout(() => window.location.href = 'login.html', 2000);
    } else {
      showMessage(response.msg || '注册失败', 'error');
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '注册';
  }
});

