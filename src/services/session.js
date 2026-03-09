import { SESSION_CONFIG, KV_KEYS } from '../config/constants.js';
import { generateRandomId, getCookieValue, getCookieSecurityAttribute } from '../utils/helpers.js';

/**
 * 创建会话
 * @param {string} username - 用户名
 * @param {Object} env - 环境变量
 * @returns {Promise<string>} - 会话ID
 */
export async function createSession(username, env) {
  const sessionId = generateRandomId(32);
  const sessionData = {
    username: username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_CONFIG.EXPIRY
  };

  const key = `${KV_KEYS.SESSION_PREFIX}${sessionId}`;
  try {
    // 设置 KV 过期时间（秒）
    const ttlSeconds = Math.floor(SESSION_CONFIG.EXPIRY / 1000);
    await env.RENDER_KV.put(key, JSON.stringify(sessionData), { expirationTtl: ttlSeconds });
  } catch (error) {
    console.error('保存会话到 KV 失败:', error);
    throw error;
  }

  return sessionId;
}

/**
 * 验证用户会话（支持滑动续期）
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @param {Object} options - 选项 { sliding: boolean }
 * @returns {Promise<{session: Object|null, setCookie: string|null}>}
 */
export async function verifySession(request, env, options = {}) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const sessionId = getCookieValue(cookieHeader, 'session');

  if (!sessionId) {
    return { session: null, setCookie: null };
  }

  try {
    const key = `${KV_KEYS.SESSION_PREFIX}${sessionId}`;
    const sessionData = await env.RENDER_KV.get(key);

    if (!sessionData) {
      return { session: null, setCookie: null };
    }

    const session = JSON.parse(sessionData);
    const now = Date.now();

    // 检查会话是否过期
    if (session.expiresAt < now) {
      await env.RENDER_KV.delete(key);
      return { session: null, setCookie: null };
    }

    // 滑动续期
    if (options.sliding) {
      const newExpiresAt = now + SESSION_CONFIG.EXPIRY;

      // 仅在"真正需要延长"时才刷新，减少 KV 写入频率
      const shouldRefresh =
        typeof session.expiresAt !== 'number' ||
        newExpiresAt - session.expiresAt >= SESSION_CONFIG.MIN_REFRESH_INTERVAL;

      if (shouldRefresh) {
        session.expiresAt = newExpiresAt;
        session.lastSeenAt = now;

        const ttlSeconds = Math.floor(SESSION_CONFIG.EXPIRY / 1000);
        await env.RENDER_KV.put(key, JSON.stringify(session), { expirationTtl: ttlSeconds });

        const maxAgeSeconds = Math.floor(SESSION_CONFIG.EXPIRY / 1000);
        // 动态判断 Secure 属性，与登录时保持一致
        const secureAttr = getCookieSecurityAttribute(request);
        const setCookie = `session=${sessionId}; Path=/${secureAttr}; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}`;

        return { session, setCookie };
      }
    }

    return { session, setCookie: null };
  } catch (error) {
    console.error('会话验证错误:', error);
    return { session: null, setCookie: null };
  }
}

/**
 * 销毁会话
 * @param {string} sessionId - 会话ID
 * @param {Object} env - 环境变量
 */
export async function destroySession(sessionId, env) {
  const key = `${KV_KEYS.SESSION_PREFIX}${sessionId}`;
  await env.RENDER_KV.delete(key);
}
