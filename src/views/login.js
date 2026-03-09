import { htmlResponse } from '../utils/response.js';
import { loginStyles } from './styles.js';
import { escapeHtml } from '../utils/helpers.js';
import { sharedScript } from './sharedScript.js';

/**
 * 渲染登录页面
 * @param {string} error - 错误信息
 * @returns {Response} - HTML响应
 */
export function renderLoginPage(error = '') {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Render Service Management - Login</title>
  <style nonce="__CSP_NONCE__">${loginStyles}</style>
</head>
<body>
  <div class="login-container">
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 25L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2M12 4.18L19.25 7.8V12C19.25 15.58 17.58 18.85 15 20.75V13.25H9V20.75C6.42 18.85 4.75 15.58 4.75 12V7.8L12 4.18Z" />
        </svg>
      </div>
      <h1>Render Manager</h1>
      <p class="subtitle">登录您的账户</p>
    </div>

    ${error ? `<div class="error-message">${escapeHtml(error)}</div>` : ''}

    <form method="post" action="/login">
      <input type="hidden" name="csrf_token" value="__CSRF_TOKEN__">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" name="username" required placeholder="输入您的用户名" autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" name="password" required placeholder="输入您的密码" autocomplete="current-password">
      </div>
      <button type="submit">登录</button>
    </form>

    <div class="footer">
      <p>© 2025 Render Service Manager | <a href="https://github.com/ssfun/render-service-manager" target="_blank" rel="noopener noreferrer">@sfun</a></p>
    </div>
  </div>
  <script nonce="__CSP_NONCE__">${sharedScript}</script>
</body>
</html>
  `;

  return htmlResponse(html);
}
