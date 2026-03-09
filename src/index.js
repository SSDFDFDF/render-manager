import { handleAuth, handleLogout } from './handlers/auth.js';
import { handleGetServices, handleDeploy } from './handlers/services.js';
import { handleGetEvents } from './handlers/events.js';
import {
  handleGetEnvVars,
  handleUpdateAllEnvVars,
  handleUpdateSingleEnvVar,
  handleDeleteEnvVar
} from './handlers/envVars.js';
import {
  handleGetServiceDetails,
  handleSuspendService,
  handleResumeService,
  handleRestartService,
  handleGetDeploys,
  handleCancelDeploy,
  handleRollbackDeploy
} from './handlers/serviceControl.js';
import {
  handleGetInstances,
  handleGetLogs,
  handleScaleService
} from './handlers/monitoring.js';
import {
  handleGetAccounts,
  handleAddAccount,
  handleUpdateAccount,
  handleDeleteAccount,
  handleTestAccount
} from './handlers/accounts.js';
import { handleMainPage, handleAccountsPage } from './handlers/pages.js';
import { handleScheduled } from './handlers/cron.js';
import { verifySession } from './services/session.js';
import { jsonResponse } from './utils/response.js';
import { getCookieValue, generateCsrfToken, getCookieSecurityAttribute } from './utils/helpers.js';
import { HTTP_STATUS, CRON_CONFIG } from './config/constants.js';

/**
 * 静态路由配置
 */
const routes = [
  { path: '/login', method: 'POST', handler: handleAuth, csrf: true },
  { path: '/login', method: 'GET', handler: (req, env) => handleMainPage(req, env, true) },
  { path: '/logout', method: 'POST', handler: handleLogout, auth: true },
  { path: '/api/services', method: 'GET', handler: handleGetServices, auth: true },
  { path: '/api/deploy', method: 'POST', handler: handleDeploy, auth: true },
  { path: '/api/accounts', method: 'GET', handler: handleGetAccounts, auth: true },
  { path: '/api/accounts', method: 'POST', handler: handleAddAccount, auth: true },
  { path: '/api/accounts/test', method: 'POST', handler: handleTestAccount, auth: true },
  { path: '/accounts', method: 'GET', handler: handleAccountsPage, auth: true },
  { path: '/', method: 'GET', handler: (req, env) => handleMainPage(req, env) },
];

/**
 * 动态路由配置
 */
const dynamicRoutes = [
  // 账户管理路由
  { pattern: /^\/api\/accounts\/([^\/]+)$/, method: 'PUT', handler: handleUpdateAccount, auth: true },
  { pattern: /^\/api\/accounts\/([^\/]+)$/, method: 'DELETE', handler: handleDeleteAccount, auth: true },
  // 事件和环境变量路由
  { pattern: /^\/api\/events\/([^\/]+)\/([^\/]+)$/, method: 'GET', handler: handleGetEvents, auth: true },
  { pattern: /^\/api\/env-vars\/([^\/]+)\/([^\/]+)$/, method: 'GET', handler: handleGetEnvVars, auth: true },
  { pattern: /^\/api\/env-vars\/([^\/]+)\/([^\/]+)$/, method: 'PUT', handler: handleUpdateAllEnvVars, auth: true },
  { pattern: /^\/api\/env-vars\/([^\/]+)\/([^\/]+)\/(.+)$/, method: 'PUT', handler: handleUpdateSingleEnvVar, auth: true },
  { pattern: /^\/api\/env-vars\/([^\/]+)\/([^\/]+)\/(.+)$/, method: 'DELETE', handler: handleDeleteEnvVar, auth: true },
  // 服务控制路由
  { pattern: /^\/api\/services\/([^\/]+)\/([^\/]+)$/, method: 'GET', handler: handleGetServiceDetails, auth: true },
  { pattern: /^\/api\/services\/([^\/]+)\/([^\/]+)\/suspend$/, method: 'POST', handler: handleSuspendService, auth: true },
  { pattern: /^\/api\/services\/([^\/]+)\/([^\/]+)\/resume$/, method: 'POST', handler: handleResumeService, auth: true },
  { pattern: /^\/api\/services\/([^\/]+)\/([^\/]+)\/restart$/, method: 'POST', handler: handleRestartService, auth: true },
  // 部署管理路由
  { pattern: /^\/api\/deploys\/([^\/]+)\/([^\/]+)$/, method: 'GET', handler: handleGetDeploys, auth: true },
  { pattern: /^\/api\/deploys\/([^\/]+)\/([^\/]+)\/cancel$/, method: 'POST', handler: handleCancelDeploy, auth: true },
  { pattern: /^\/api\/deploys\/([^\/]+)\/([^\/]+)\/rollback$/, method: 'POST', handler: handleRollbackDeploy, auth: true },
  // 监控路由
  { pattern: /^\/api\/instances\/([^\/]+)\/([^\/]+)$/, method: 'GET', handler: handleGetInstances, auth: true },
  { pattern: /^\/api\/logs\/([^\/]+)\/([^\/]+)$/, method: 'GET', handler: handleGetLogs, auth: true },
  { pattern: /^\/api\/services\/([^\/]+)\/([^\/]+)\/scale$/, method: 'POST', handler: handleScaleService, auth: true },
];

/**
 * CSRF 防护
 */
function shouldCheckCsrf(request) {
  const method = request.method.toUpperCase();
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
}

function isSameOrigin(request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (origin && origin !== 'null') {
    try {
      const originUrl = new URL(origin);
      return originUrl.origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('Referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.origin === requestUrl.origin;
    } catch {
      return false;
    }
  }

  return false;
}

async function getRequestCsrfToken(request) {
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) return headerToken;

  const contentType = request.headers.get('Content-Type') || '';
  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  if (!isForm) return null;

  try {
    const formData = await request.clone().formData();
    const bodyToken = formData.get('csrf_token');
    if (typeof bodyToken === 'string' && bodyToken) {
      return bodyToken;
    }
  } catch {
    // ignore
  }

  try {
    const bodyText = await request.clone().text();
    if (bodyText) {
      const params = new URLSearchParams(bodyText);
      const bodyToken = params.get('csrf_token');
      if (bodyToken) {
        return bodyToken;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

async function verifyCsrf(request) {
  if (!shouldCheckCsrf(request)) return true;

  // 有 Origin/Referer 时要求同源；缺失时仅依赖 token 双提交校验（兼容部分表单 POST）
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const effectiveOrigin = origin === 'null' ? null : origin;
  if ((effectiveOrigin || referer) && !isSameOrigin(request)) return false;

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieToken = getCookieValue(cookieHeader, 'csrf_token');
  const requestToken = await getRequestCsrfToken(request);

  // 强制要求 CSRF token 存在且匹配
  if (!cookieToken || !requestToken) return false;
  return cookieToken === requestToken;
}

function getOrCreateCsrfCookie(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const csrfToken = getCookieValue(cookieHeader, 'csrf_token');

  if (csrfToken) {
    return { token: csrfToken, setCookie: null };
  }

  const newToken = generateCsrfToken();
  const secureAttr = getCookieSecurityAttribute(request);
  return {
    token: newToken,
    setCookie: `csrf_token=${newToken}; Path=/${secureAttr}; SameSite=Strict; Max-Age=86400`,
  };
}

async function withCsrfCookie(request, response) {
  const contentType = response.headers.get('Content-Type') || '';
  const isHtml = contentType.startsWith('text/html');
  if (!isHtml) {
    return response;
  }

  const { token, setCookie } = getOrCreateCsrfCookie(request);

  const headers = new Headers(response.headers);
  if (setCookie) {
    headers.append('Set-Cookie', setCookie);
  }

  if (response.body && response.headers.get('Content-Type')?.startsWith('text/html')) {
    const originalText = await response.text();
    const patchedText = originalText.replace(/__CSRF_TOKEN__/g, token || '');
    return new Response(patchedText, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * 主请求处理器
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 匹配静态路由
  for (const route of routes) {
    if (route.path === path && route.method === method) {
      let sessionSetCookie = null;

      if (route.auth) {
        const { session, setCookie } = await verifySession(request, env, { sliding: true });
        if (!session) {
          return jsonResponse({ error: 'Unauthorized' }, HTTP_STATUS.UNAUTHORIZED);
        }

        const shouldVerifyCsrf = route.csrf !== false;
        if (shouldVerifyCsrf && !(await verifyCsrf(request))) {
          return jsonResponse({ error: 'CSRF validation failed' }, HTTP_STATUS.FORBIDDEN);
        }

        sessionSetCookie = setCookie;
      } else if (route.csrf === true) {
        if (!(await verifyCsrf(request))) {
          return jsonResponse({ error: 'CSRF validation failed' }, HTTP_STATUS.FORBIDDEN);
        }
      }

      let response = await route.handler(request, env, ctx);

      if (sessionSetCookie) {
        const headers = new Headers(response.headers);
        headers.append('Set-Cookie', sessionSetCookie);
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return await withCsrfCookie(request, response);
    }
  }

  // 匹配动态路由
  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match && route.method === method) {
      let sessionSetCookie = null;

      if (route.auth) {
        const { session, setCookie } = await verifySession(request, env, { sliding: true });
        if (!session) {
          return jsonResponse({ error: 'Unauthorized' }, HTTP_STATUS.UNAUTHORIZED);
        }

        const shouldVerifyCsrf = route.csrf !== false;
        if (shouldVerifyCsrf && !(await verifyCsrf(request))) {
          return jsonResponse({ error: 'CSRF validation failed' }, HTTP_STATUS.FORBIDDEN);
        }

        sessionSetCookie = setCookie;
      }

      let response = await route.handler(request, match, env);

      if (sessionSetCookie) {
        const headers = new Headers(response.headers);
        headers.append('Set-Cookie', sessionSetCookie);
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return await withCsrfCookie(request, response);
    }
  }

  return new Response('Not Found', { status: 404 });
}

/**
 * ES Module 格式导出
 */
export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      console.error('全局错误:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },

  // 定时任务入口（带超时控制）
  async scheduled(event, env, ctx) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CRON_CONFIG.TIMEOUT_MS);

    ctx.waitUntil(
      handleScheduled(env, controller.signal)
        .finally(() => clearTimeout(timeoutId))
    );
  }
};
