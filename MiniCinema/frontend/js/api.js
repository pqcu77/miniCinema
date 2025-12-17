const API_BASE_URL = 'http://localhost:8080';

const api = {
  // 通用 HTTP 方法
  get: (url, params = {}) => {
    // 构建查询字符串
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    const fullUrl = queryString ? `${API_BASE_URL}${url}?${queryString}` : `${API_BASE_URL}${url}`;

    return fetch(fullUrl, {
      method: 'GET',
      // GET requests should not include Content-Type to avoid preflight
      credentials: 'include' // allow cookies if backend uses session
    }).then(res => res.json());
  },

  post: (url, data = {}) => {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // include cookies
      body: JSON.stringify(data)
    }).then(res => res.json());
  },

  // 电影相关 - 搜索和推荐
  searchMovies: (keyword = '', genre = '', page = 1, pageSize = 8) => {
    return api.get('/api/movies', { keyword, genre, page, pageSize });
  },

  getRecommendedMovies: (limit = 8) => {
    return api.get('/api/movies/recommend', { limit });
  },

  // 用户相关
  login: (username, password) => {
    return fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    }).then(res => res.json());
  },

  register: (username, password, email, confirmPassword = password) => {
    return fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password, email, confirmPassword })
    }).then(res => res.json());
  },

  getUserInfo: (token) => {
    // if token provided use Authorization header, else rely on cookie/session
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    return fetch(`${API_BASE_URL}/user/info`, {
      headers,
      credentials: 'include'
    }).then(res => res.json());
  },

  updateUser: (token, userData) => {
    const headers = token ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } : { 'Content-Type': 'application/json' };

    return fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(userData)
    }).then(res => res.json());
  },

  changePassword: (token, oldPassword, newPassword) => {
    const headers = token ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } : { 'Content-Type': 'application/json' };

    return fetch(`${API_BASE_URL}/user/changePassword`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ oldPassword, newPassword })
    }).then(res => res.json());
  },

  logout: (token) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    return fetch(`${API_BASE_URL}/user/logout`, {
      method: 'POST',
      headers,
      credentials: 'include'
    }).then(res => res.json());
  },

  // 电影相关
  getMovies: (page = 1, pageSize = 10) => {
    return api.get('/api/movies', { page, pageSize });
  },

  getMovieDetail: (movieId) => {
    // backend maps GET /api/movies/{movieId}
    return api.get(`/api/movies/${movieId}`);
  },

  // 收藏相关
  addFavorite: (token, movieId) => {
    return fetch(`${API_BASE_URL}/favorite/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ movieId })
    }).then(res => res.json());
  },

  removeFavorite: (token, movieId) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    return fetch(`${API_BASE_URL}/favorite/remove/${movieId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    }).then(res => res.json());
  },

  getFavorites: (token) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    return fetch(`${API_BASE_URL}/favorite/list`, {
      headers,
      credentials: 'include'
    }).then(res => res.json());
  }
};

// 旧版全局函数 searchMovies / getMovieRecommendations 已移除，
// 请统一使用 api.searchMovies 和 api.getRecommendedMovies 或
// 在需要推荐列表的地方直接调用后端 /api/movies/{movieId}/recommendations 接口。

// 导出 API 对象和常量，以便在模块中使用
export { API_BASE_URL, api };
export default api;
