/**
 * 前端共享脚本（以字符串形式注入到页面 <script> 中）
 *
 * 目标：
 * - 复用 CSRF / headers / 通知 / 转义等逻辑
 * - 提供最小的 API 请求封装
 * - 提供 URL 白名单校验（阻断 javascript: 等危险协议）
 */

export const sharedScript = `
// 获取 CSRF Token
function getCsrfToken() {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : '';
}

function initCsrfForms() {
  const token = getCsrfToken();
  if (!token) return;

  document.querySelectorAll('form[data-csrf-form]').forEach(function(form) {
    const input = form.querySelector('input[name="csrf_token"]');
    if (!input) return;
    input.value = token;
  });
}

// 创建带有 CSRF Token 的请求头
function createHeaders(contentType = 'application/json') {
  const headers = {
    'X-CSRF-Token': getCsrfToken()
  };
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
}

// HTML 转义
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// HTML 属性值转义（与 escapeHtml 一致，显式区分上下文）
function escapeAttribute(text) {
  return escapeHtml(text);
}

// 仅允许 http/https（阻断 javascript:, data: 等）
function sanitizeUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(String(url), window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (e) {
    // ignore
  }

  return '';
}

async function readResponseErrorMessage(response) {
  try {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data && typeof data.error === 'string' && data.error) {
        return data.error;
      }
    }

    const text = await response.text();
    if (text) return text;
  } catch (e) {
    // ignore
  }

  return '请求失败: ' + response.status + ' ' + response.statusText;
}

// 统一的 JSON 请求封装：失败时抛出 Error(message)
async function apiJson(url, options) {
  const opts = options || {};
  const method = (opts.method || 'GET').toUpperCase();
  const body = opts.body;
  const contentType = Object.prototype.hasOwnProperty.call(opts, 'contentType')
    ? opts.contentType
    : 'application/json';

  const headers = new Headers(opts.headers || {});

  // 写请求默认带 CSRF
  if (!['GET', 'HEAD'].includes(method) && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', getCsrfToken());
  }

  let finalBody;
  if (body !== undefined) {
    if (body === null) {
      finalBody = null;
    } else if (body instanceof FormData) {
      finalBody = body;
    } else {
      if (contentType !== null && contentType !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', contentType);
      }
      finalBody = typeof body === 'string' ? body : JSON.stringify(body);
    }
  }

  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: finalBody
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readResponseErrorMessage(response));
  }

  // 兼容非 JSON 响应
  const responseContentType = response.headers.get('Content-Type') || '';
  if (responseContentType.includes('application/json')) {
    return await response.json();
  }

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// 显示通知（避免把 message 注入到 innerHTML）
function showNotification(message, type) {
  const kind = type || 'success';

  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(function(notification) { notification.remove(); });

  const notification = document.createElement('div');
  notification.className = 'notification ' + kind;

  const icon = kind === 'success'
    ? '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#10b981"/></svg>'
    : '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ef4444"/></svg>';

  const content = document.createElement('div');
  content.className = 'notification-content';

  const iconWrapper = document.createElement('div');
  iconWrapper.innerHTML = icon;
  const iconElement = iconWrapper.firstElementChild;
  if (iconElement) {
    content.appendChild(iconElement);
  }

  const text = document.createElement('div');
  text.className = 'notification-text';
  text.textContent = message;
  content.appendChild(text);

  notification.replaceChildren(content);
  document.body.appendChild(notification);

  setTimeout(function() {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(function() { notification.remove(); }, 300);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', function() {
  initCsrfForms();
});
`;
