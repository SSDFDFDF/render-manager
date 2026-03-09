import { HTTP_STATUS } from '../config/constants.js';

/**
 * 获取安全响应头
 * @param {string} contentType - 内容类型
 * @returns {Object} - 响应头对象
 */
function getSecurityHeaders(contentType, options = {}) {
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };

  if (contentType.startsWith('text/html')) {
    const nonce = options.nonce;
    const styleSrc = nonce ? "'self' 'nonce-" + nonce + "'" : "'self'";
    const scriptSrc = nonce ? "'self' 'nonce-" + nonce + "'" : "'self'";

    headers['X-Frame-Options'] = 'DENY';
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data:",
      "style-src " + styleSrc,
      "style-src-attr 'unsafe-inline'",
      "script-src " + scriptSrc,
      "script-src-attr 'none'",
      "connect-src 'self'",
      "object-src 'none'",
    ].join('; ');
  }

  return headers;
}

function generateNonce() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function applyHtmlNonce(html, nonce) {
  if (!nonce || !html) return html;
  return html.replace(/__CSP_NONCE__/g, nonce);
}

/**
 * 创建 JSON 响应
 * @param {Object} data - 响应数据
 * @param {number} status - HTTP 状态码
 * @returns {Response} - JSON 响应
 */
export function jsonResponse(data, status = HTTP_STATUS.OK) {
  return new Response(JSON.stringify(data), {
    status,
    headers: getSecurityHeaders('application/json; charset=utf-8')
  });
}

/**
 * 创建重定向响应
 * @param {string} location - 重定向目标
 * @param {Object} additionalHeaders - 额外的响应头
 * @returns {Response} - 重定向响应
 */
export function redirectResponse(location, additionalHeaders = {}) {
  const headers = new Headers(additionalHeaders);
  headers.set('Location', location);

  return new Response(null, {
    status: HTTP_STATUS.FOUND,
    headers
  });
}

/**
 * 创建 HTML 响应
 * @param {string} html - HTML 内容
 * @param {number} status - HTTP 状态码
 * @returns {Response} - HTML 响应
 */
export function htmlResponse(html, status = HTTP_STATUS.OK) {
  const nonce = generateNonce();
  const safeHtml = applyHtmlNonce(html, nonce);

  return new Response(safeHtml, {
    status,
    headers: getSecurityHeaders('text/html; charset=utf-8', { nonce })
  });
}

/**
 * 创建无内容响应
 * @returns {Response} - 204 响应
 */
export function noContentResponse() {
  return new Response(null, { status: HTTP_STATUS.NO_CONTENT });
}
