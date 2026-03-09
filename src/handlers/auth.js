import { createSession, destroySession } from '../services/session.js';
import { redirectResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';
import {
  getClientIp,
  getCookieValue,
  getCookieSecurityAttribute,
  checkLoginLock,
  recordLoginFailure,
  clearLoginFailures,
  timingSafeEqual,
} from '../utils/helpers.js';

/**
 * 处理用户登录
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleAuth(request, env) {
  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const clientIp = getClientIp(request);

    const lockStatus = await checkLoginLock(env, clientIp, username);
    if (lockStatus.locked) {
      const { renderLoginPage } = await import('../views/login.js');
      return renderLoginPage('尝试次数过多，请稍后再试');
    }

    if (timingSafeEqual(username, env.ADMIN_USERNAME) && timingSafeEqual(password, env.ADMIN_PASSWORD)) {
      const sessionId = await createSession(username, env);
      await clearLoginFailures(env, clientIp, username);

      const secureAttr = getCookieSecurityAttribute(request);
      const headers = new Headers();
      headers.set('Set-Cookie', `session=${sessionId}; Path=/${secureAttr}; HttpOnly; SameSite=Strict; Max-Age=86400`);
      headers.set('Location', '/');

      return new Response(null, { status: HTTP_STATUS.FOUND, headers });
    } else {
      await recordLoginFailure(env, clientIp, username);
      const { renderLoginPage } = await import('../views/login.js');
      return renderLoginPage('用户名或密码无效');
    }
  } catch (error) {
    console.error('登录错误:', error);
    const { renderLoginPage } = await import('../views/login.js');
    return renderLoginPage('登录过程中发生错误');
  }
}

/**
 * 处理用户登出
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleLogout(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const sessionId = getCookieValue(cookieHeader, 'session');

  // 尝试销毁会话，但即使失败也继续登出流程
  if (sessionId) {
    try {
      await destroySession(sessionId, env);
    } catch (error) {
      console.error('销毁会话失败:', error);
      // 继续执行登出流程
    }
  }

  const secureAttr = getCookieSecurityAttribute(request);
  const headers = new Headers();
  headers.append('Set-Cookie', `session=; Path=/${secureAttr}; HttpOnly; SameSite=Strict; Max-Age=0`);
  headers.append('Set-Cookie', `csrf_token=; Path=/${secureAttr}; SameSite=Strict; Max-Age=0`);
  headers.set('Location', '/login');

  return new Response(null, { status: HTTP_STATUS.FOUND, headers });
}
