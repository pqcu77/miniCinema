const API_BASE_URL = 'http://localhost:8080';

const api = {
  // 用户相关
  login: (username, password) => {
    return fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(res => res.json());
  },

  register: (username, password, email, confirmPassword = password) => {
    return fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, confirmPassword })
    }).then(res => res.json());
  },

  getUserInfo: (token) => {
    return fetch(`${API_BASE_URL}/user/info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());
  },

  updateUser: (token, userData) => {
    return fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    }).then(res => res.json());
  },

  changePassword: (token, oldPassword, newPassword) => {
    return fetch(`${API_BASE_URL}/user/changePassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    }).then(res => res.json());
  },

  logout: (token) => {
    return fetch(`${API_BASE_URL}/user/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());
  },

  // 电影相关
  getMovies: (page = 1, pageSize = 10) => {
    return fetch(`${API_BASE_URL}/movie/list?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json());
  },

  getMovieDetail: (movieId) => {
    return fetch(`${API_BASE_URL}/movie/${movieId}`)
      .then(res => res.json());
  },

  searchMovies: (keyword) => {
    return fetch(`${API_BASE_URL}/movie/search?keyword=${encodeURIComponent(keyword)}`)
      .then(res => res.json());
  },

  // 收藏相关
  addFavorite: (token, movieId) => {
    return fetch(`${API_BASE_URL}/favorite/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ movieId })
    }).then(res => res.json());
  },

  removeFavorite: (token, movieId) => {
    return fetch(`${API_BASE_URL}/favorite/remove/${movieId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());
  },

  getFavorites: (token) => {
    return fetch(`${API_BASE_URL}/favorite/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());
  }
};

// ===== 电影搜索和推荐 API =====

/**
 * 搜索电影
 */
function searchMovies(keyword, page = 0, size = 10) {
  return fetch(`${API_BASE_URL}/movies/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`)
    .then(res => res.json())
    .catch(error => {
      console.error('Search error:', error);
      return { code: -1, message: '搜索失败' };
    });
}

/**
 * 获取电影推荐
 */
function getMovieRecommendations(movieId, userId = null, limit = 6) {
  let url = `${API_BASE_URL}/movies/${movieId}/recommendations?limit=${limit}`;
  if (userId) {
    url += `&userId=${userId}`;
  }

  return fetch(url)
    .then(res => res.json())
    .catch(error => {
      console.error('Recommendation error:', error);
      return { code: -1, message: '推荐获取失败' };
    });
}
