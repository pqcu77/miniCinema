import eventBus from './eventBus.js';

/**
 * 全局用户状态管理类
 */
class UserState {
  constructor() {
    this.user = null;
    this.token = null;
    this.loadUserFromStorage();
  }

  /**
   * 从 localStorage 加载用户信息
   */
  loadUserFromStorage() {
    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = localStorage.getItem('token');
      
      if (userInfo && token) {
        this.user = JSON.parse(userInfo);
        this.token = token;
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      this.clearUser();
    }
  }

  /**
   * 获取当前用户信息
   * @returns {Object|null} 用户信息对象
   */
  getUser() {
    return this.user;
  }

  /**
   * 获取用户ID
   * @returns {number|null} 用户ID
   */
  getUserId() {
    return this.user ? this.user.userId : null;
  }

  /**
   * 获取用户名
   * @returns {string|null} 用户名
   */
  getUsername() {
    return this.user ? this.user.username : null;
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return this.user !== null && this.token !== null;
  }

  /**
   * 设置用户信息(登录成功时调用)
   * @param {Object} userInfo - 用户信息对象
   */
  setUser(userInfo) {
    this.user = userInfo;
    this.token = userInfo.token || this.token;
    
    // 保存到 localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    if (this.token) {
      localStorage.setItem('token', this.token);
    }
    
    // 触发全局登录事件
    eventBus.emit('userLogin', userInfo);
    
    console.log('用户登录成功:', userInfo.username);
  }

  /**
   * 清除用户信息(退出登录时调用)
   */
  clearUser() {
    this.user = null;
    this.token = null;
    
    // 清除 localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    
    // 触发全局退出事件
    eventBus.emit('userLogout');
    
    console.log('用户已退出登录');
  }

  /**
   * 获取认证 token
   * @returns {string|null} token
   */
  getToken() {
    return this.token;
  }

  /**
   * 获取带 token 的请求头
   * @returns {Object} 请求头对象
   */
  getAuthHeaders() {
    if (!this.token) {
      return {
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * 更新用户信息
   * @param {Object} updates - 要更新的字段
   */
  updateUser(updates) {
    if (!this.user) return;
    
    this.user = { ...this.user, ...updates };
    localStorage.setItem('userInfo', JSON.stringify(this.user));
    
    // 触发用户信息更新事件
    eventBus.emit('userUpdated', this.user);
  }

  /**
   * 检查用户权限
   * @param {string} permission - 权限名称
   * @returns {boolean} 是否有权限
   */
  hasPermission(permission) {
    if (!this.user || !this.user.permissions) return false;
    return this.user.permissions.includes(permission);
  }
}

// 导出单例
const userState = new UserState();
export default userState;

