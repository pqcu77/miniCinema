const API_BASE_URL = 'http://localhost:8080';

// Add import for global user state so we reliably resolve userId/token
import userState from './userState.js';

const api = {
  // 通用 HTTP 方法
  get: (url, params = {}) => {
    // 构建查询字符串使用 URLSearchParams 保证不会把 undefined 序列化为字符串
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || typeof v === 'undefined') return;
      searchParams.append(k, String(v));
    });
    const queryString = searchParams.toString();
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

  // ✅ 添加 DELETE 方法
  delete: (url) => {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
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

  changePassword: (token, oldPassword, newPassword, confirmPassword, userId) => {
    // resolve userId from userState/localStorage if not provided
    let resolvedUserId = userId;
    if (typeof resolvedUserId === 'undefined' || resolvedUserId === null) {
      try {
        const s = userState?.getUserId?.();
        if (s) resolvedUserId = s;
        else {
          const u = JSON.parse(localStorage.getItem('userInfo'));
          if (u && (u.userId || u.userId === 0)) resolvedUserId = u.userId;
        }
      } catch (e) {
        resolvedUserId = null;
      }
    }

    const body = {
      userId: resolvedUserId,
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword || newPassword
    };

    const headers = token ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } : { 'Content-Type': 'application/json' };

    const urlUserParam = resolvedUserId ? `?userId=${encodeURIComponent(resolvedUserId)}` : '';
    return fetch(`${API_BASE_URL}/user/changePassword${urlUserParam}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
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

  // 购物车相关
  cart: {
      getCart: () => request('/api/cart', 'GET'),
      addToCart: (data) => request('/api/cart', 'POST', data),
      removeFromCart: (itemId) => request(`/api/cart/${itemId}`, 'DELETE'),
      clearCart: () => request('/api/cart/clear', 'DELETE')
  },

  // 订单相关
  order: {
      createOrder: (data) => request('/api/orders', 'POST', data),
      getOrderById: (orderId) => request(`/api/orders/${orderId}`, 'GET'),
      getUserOrders: () => request('/api/orders/user', 'GET'),
      cancelOrder: (orderId) => request(`/api/orders/${orderId}/cancel`, 'PUT')
  },

  // 支付相关
  payment: {
      createPayment: (data) => request('/api/payments', 'POST', data),
      confirmPayment: (orderId) => request(`/api/payments/${orderId}/confirm`, 'PUT'),
      getPaymentStatus: (paymentId) => request(`/api/payments/${paymentId}`, 'GET')
  },

  // 票据相关
  ticket: {
      // 获取用户票据
      getUserTickets: (userId) => {
        // ✅ 如果没有传 userId，从 userState 获取
        if (!userId) {
          try {
            const user = userState?.getUser?.();
            userId = user?.userId;
          } catch (e) {
            console.error('获取用户信息失败:', e);
          }
        }
        
        if (!userId) {
          return Promise.reject(new Error('用户未登录'));
        }
        
        return api.get(`/api/ticket/user/${userId}`);
      },
      
      // 根据 ID 获取票据
      getTicketById: (ticketId) => {
        return api.get(`/api/ticket/${ticketId}`);
      },
      
      // 使用票据
      useTicket: (ticketId) => {
        return api.put(`/api/ticket/${ticketId}/use`);
      }
  },

  // 收藏相关
  // NOTE: backend FavoriteController expects userId as request parameter or Authorization header. Frontend will auto-resolve userId from userState/localStorage if not provided.
  addFavorite: (token, movieId, userId) => {
    // Prefer explicit param, then userState, then localStorage as fallback
    let resolvedUserId = null;
    if (typeof userId !== 'undefined' && userId !== null) resolvedUserId = userId;
    else {
      try {
        const s = userState?.getUserId?.();
        if (s) resolvedUserId = s;
        else {
          const u = JSON.parse(localStorage.getItem('userInfo'));
          if (u && (u.userId || u.userId === 0)) resolvedUserId = u.userId;
        }
      } catch (e) {
        resolvedUserId = null;
      }
    }

    // ensure numeric id or null
    const uid = Number(resolvedUserId);
    const finalUserId = Number.isFinite(uid) ? uid : null;

    const headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };

    const params = new URLSearchParams();
    if (finalUserId !== null) params.append('userId', String(finalUserId));
    params.append('movieId', String(movieId));

    const url = `${API_BASE_URL}/favorite/add?${params.toString()}`;
    return fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include'
    }).then(res => res.json());
  },

  removeFavorite: (token, movieId, userId) => {
    let resolvedUserId = null;
    if (typeof userId !== 'undefined' && userId !== null) resolvedUserId = userId;
    else {
      try {
        const s = userState?.getUserId?.();
        if (s) resolvedUserId = s;
        else {
          const u = JSON.parse(localStorage.getItem('userInfo'));
          if (u && (u.userId || u.userId === 0)) resolvedUserId = u.userId;
        }
      } catch (e) {
        resolvedUserId = null;
      }
    }

    const uid = Number(resolvedUserId);
    const finalUserId = Number.isFinite(uid) ? uid : null;

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const params = new URLSearchParams();
    if (finalUserId !== null) params.append('userId', String(finalUserId));

    const paramStr = params.toString();
    const url = `${API_BASE_URL}/favorite/remove/${encodeURIComponent(movieId)}${paramStr ? `?${paramStr}` : ''}`;
    return fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    }).then(res => res.json());
  },

  getFavorites: (token, userId) => {
    let resolvedUserId = null;
    if (typeof userId !== 'undefined' && userId !== null) resolvedUserId = userId;
    else {
      try {
        const s = userState?.getUserId?.();
        if (s) resolvedUserId = s;
        else {
          const u = JSON.parse(localStorage.getItem('userInfo'));
          if (u && (u.userId || u.userId === 0)) resolvedUserId = u.userId;
        }
      } catch (e) {
        resolvedUserId = null;
      }
    }

    const uid = Number(resolvedUserId);
    const finalUserId = Number.isFinite(uid) ? uid : null;

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const params = new URLSearchParams();
    if (finalUserId !== null) params.append('userId', String(finalUserId));

    const url = `${API_BASE_URL}/favorite/list${params.toString() ? `?${params.toString()}` : ''}`;
    return fetch(url, {
      headers,
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        // Normalize to a consistent array of { movieId, posterUrl, title, rating }
        let rawList = [];
        if (!json) return [];
        if (Array.isArray(json)) rawList = json;
        else if ((json.code === 1 || json.code === 200) && json.data) {
          if (Array.isArray(json.data)) rawList = json.data;
          else if (Array.isArray(json.data.records)) rawList = json.data.records;
        } else if (Array.isArray(json.data)) rawList = json.data;
        else if (Array.isArray(json.records)) rawList = json.records;

        // map to normalized objects
        const normalized = rawList.map(raw => {
          const movieIdRaw = raw.movieId ?? raw.movie_id ?? raw.movieid ?? raw.movie?.movieId ?? raw.movie?.movie_id ?? raw.movie?.id ?? raw.id ?? null;
          const movieId = movieIdRaw != null ? String(movieIdRaw) : null;
          const posterUrl = raw.posterUrl ?? raw.poster_url ?? raw.posterurl ?? raw.poster ?? raw.movie?.posterUrl ?? raw.movie?.poster_url ?? raw.movie?.poster ?? raw.movie?.poster_path ?? null;
          const title = raw.title ?? raw.name ?? raw.movie?.title ?? raw.movie?.name ?? '';
          const rating = raw.rating ?? raw.score ?? raw.movie?.rating ?? raw.movie?.vote_average ?? null;
          return { movieId, posterUrl, title, rating, raw };
        }).filter(item => item.movieId != null);

        return normalized;
      });
  }
};

// 兼容旧版全局函数：某些页面仍然直接调用 searchMovies() 或 getMovieRecommendations(movieId)
function searchMovies(keyword = '', page = 1, size = 10) {
  // backend expects page starting from 1
  return api.searchMovies(keyword, '', page, size);
}

function getMovieRecommendations(movieId, userId = null, limit = 6) {
  // current backend has no per-movie recommendations endpoint; use global top-rated recommendations as fallback
  return api.getRecommendedMovies(limit);
}

// 绑定到 window 以兼容非模块加载的页面
if (typeof window !== 'undefined') {
  window.api = api;
  window.searchMovies = searchMovies;
  window.getMovieRecommendations = getMovieRecommendations;
}

// 导出 API 对象和常量，以便在模块中使用
export { API_BASE_URL, api };
export default api;
