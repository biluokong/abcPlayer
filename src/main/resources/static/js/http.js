/**
 * 通用HTTP请求工具类
 * 基于fetch API封装，自动携带JWT令牌，支持async/await语法
 */
const HttpUtil = {
  /**
   * 基础URL配置
   */
  baseURL: '',

  /**
   * 设置基础URL
   * @param {string} url - 基础URL
   */
  setBaseURL(url) {
    this.baseURL = url;
  },

  /**
   * 获取完整的请求URL
   * @param {string} url - 请求路径
   * @returns {string} 完整URL
   */
  getFullURL(url) {
    return this.baseURL + url;
  },

  /**
   * 构建请求头（自动携带Token）
   * @param {Object} customHeaders - 自定义请求头
   * @returns {Object} 完整的请求头
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // 自动添加JWT Token
    const token = AuthUtil ? AuthUtil.getToken() : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  /**
   * 处理响应
   * @param {Response} response - fetch响应对象
   * @returns {Promise<any>} 解析后的数据
   */
  async handleResponse(response) {
    // 处理401未授权
    if (response.status === 401) {
      confirm('登录已过期，请重新登录！')
      if (AuthUtil) {
        AuthUtil.logout();
        window.location.href = '/login.html';
      }
    }

    // 处理其他错误状态码
    if (!response.ok) {
      let errorMessage = `HTTP错误: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 如果无法解析JSON，使用默认错误消息
      }
      throw new Error(errorMessage);
    }

    // 解析JSON响应
    try {
      const data = await response.json();

      // 检查业务逻辑是否成功（假设后端返回格式为 {code, message, data}）
      if (data.code === 401) {
        confirm(data.message || '登录已过期，请重新登录！')
        if (AuthUtil) {
          AuthUtil.logout();
          window.location.href = '/login.html';
        }
      }
      if (data.code !== 200) {
        throw new Error(data.message || '请求失败');
      }

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // 如果不是JSON响应，返回文本
        return await response.text();
      }
      throw error;
    }
  },

  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {Object} params - URL查询参数
   * @param {Object} options - 其他选项
   * @returns {Promise<any>} 响应数据
   *
   * @example
   * const result = await HttpUtil.get('/api/user/list', { page: 1, size: 10 });
   */
  async get(url, params = {}, options = {}) {
    // 构建查询字符串
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const fullURL = queryString ? `${this.getFullURL(url)}?${queryString}` : this.getFullURL(url);

    const response = await fetch(fullURL, {
      method: 'GET',
      headers: this.buildHeaders(options.headers),
      ...options
    });

    return this.handleResponse(response);
  },

  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求体数据
   * @param {Object} options - 其他选项
   * @returns {Promise<any>} 响应数据
   *
   * @example
   * const result = await HttpUtil.post('/api/user/login', { username: 'admin', password: '123456' });
   */
  async post(url, data = {}, options = {}) {
    const response = await fetch(this.getFullURL(url), {
      method: 'POST',
      headers: this.buildHeaders(options.headers),
      body: JSON.stringify(data),
      ...options
    });

    return this.handleResponse(response);
  },

  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求体数据
   * @param {Object} options - 其他选项
   * @returns {Promise<any>} 响应数据
   */
  async put(url, data = {}, options = {}) {
    const response = await fetch(this.getFullURL(url), {
      method: 'PUT',
      headers: this.buildHeaders(options.headers),
      body: JSON.stringify(data),
      ...options
    });

    return this.handleResponse(response);
  },

  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} options - 其他选项
   * @returns {Promise<any>} 响应数据
   */
  async delete(url, options = {}) {
    const response = await fetch(this.getFullURL(url), {
      method: 'DELETE',
      headers: this.buildHeaders(options.headers),
      ...options
    });

    return this.handleResponse(response);
  },

  /**
   * 表单提交（POST with form-data）
   * @param {string} url - 请求URL
   * @param {Object} formData - 表单数据
   * @param {Object} options - 其他选项
   * @returns {Promise<any>} 响应数据
   *
   * @example
   * const result = await HttpUtil.postForm('/api/user/login', { username: 'admin', password: '123456' });
   */
  async postForm(url, formData = {}, options = {}) {
    // 构建表单数据
    const formBody = Object.keys(formData)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`)
      .join('&');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers
    };

    const response = await fetch(this.getFullURL(url), {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: formBody,
      ...options
    });

    return this.handleResponse(response);
  }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HttpUtil;
}