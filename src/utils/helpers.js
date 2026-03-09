/**
 * 辅助工具函数
 */

import { HTTP_STATUS, KV_KEYS, LOGIN_RATE_LIMIT } from '../config/constants.js';
import { jsonResponse } from './response.js';

/**
 * 生成随机ID
 * @param {number} length - ID长度（字节数）
 * @returns {string} - 十六进制随机ID
 */
export function generateRandomId(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 生成账户 ID
 * @returns {string} - 格式为 acc_xxxx 的账户 ID
 */
export function generateAccountId() {
  return `acc_${generateRandomId(8)}`;
}

/**
 * 从 Cookie 头中读取指定 Cookie 值
 * @param {string} cookieHeader - Cookie 头字符串
 * @param {string} name - Cookie 名称
 * @returns {string|null} - Cookie 值
 */
export function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.trim().split('=');
    if (cookieName === name) {
      return rest.join('=');
    }
  }

  return null;
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} text - 原始文本
 * @returns {string} - 转义后的文本
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * 生成用于 CSRF 的随机 token
 * @returns {string} - CSRF token
 */
export function generateCsrfToken() {
  return generateRandomId(32);
}

/**
 * 通过ID或名称查找账户（内部使用）
 * @param {Array} accounts - 账户列表
 * @param {string} accountNameOrId - 账户ID或名称
 * @returns {Object|undefined} - 找到的账户
 */
function findAccount(accounts, accountNameOrId) {
  return accounts.find(acc =>
    acc.id === accountNameOrId ||
    acc.name.toLowerCase() === accountNameOrId.toLowerCase()
  );
}

/**
 * 获取并查找账户（内部使用）
 * @param {Object} env - 环境变量
 * @param {string} accountNameOrId - 账户ID或名称
 * @returns {Promise<Object|undefined>} - 找到的账户
 */
async function getAccountByNameOrId(env, accountNameOrId) {
  const accounts = await getAccounts(env);
  return findAccount(accounts, accountNameOrId);
}

/**
 * 在 handler 中获取账户并统一处理“找不到账户”和异常响应
 * @param {Object} env - 环境变量
 * @param {string} accountNameOrId - 账户ID或名称
 * @param {Object} options - 选项
 * @param {string} options.notFoundMessage - 账户不存在时返回的错误文案
 * @param {string} options.errorLogLabel - 捕获异常时的日志前缀
 * @param {string} options.errorResponseMessage - 捕获异常时返回给客户端的错误文案
 * @param {(account: Object) => Promise<Response>} fn - 业务处理函数
 * @returns {Promise<Response>}
 */
export async function withAccount(env, accountNameOrId, options, fn) {
  const { notFoundMessage, errorLogLabel, errorResponseMessage } = options;

  const account = await getAccountByNameOrId(env, accountNameOrId);
  if (!account) {
    return jsonResponse({ error: notFoundMessage }, HTTP_STATUS.NOT_FOUND);
  }

  try {
    return await fn(account);
  } catch (error) {
    console.error(errorLogLabel, error);

    const message =
      typeof errorResponseMessage === 'string' && errorResponseMessage
        ? errorResponseMessage
        : '服务端错误';

    return jsonResponse({ error: message }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 从 KV 读取账户列表
 * @param {Object} env - 环境变量
 * @returns {Promise<Array>} - 账户列表
 */
export async function getAccounts(env) {
  try {
    const accountsData = await env.RENDER_KV.get(KV_KEYS.ACCOUNTS);
    if (!accountsData) {
      return [];
    }
    return JSON.parse(accountsData);
  } catch (error) {
    console.error('获取账户配置失败:', error);
    return [];
  }
}

/**
 * 保存账户列表到 KV
 * @param {Array} accounts - 账户列表
 * @param {Object} env - 环境变量
 */
export async function saveAccounts(accounts, env) {
  try {
    await env.RENDER_KV.put(KV_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (error) {
    console.error('保存账户配置失败:', error);
    throw error;
  }
}

function normalizeIp(ip) {
  if (!ip) return 'unknown';
  return ip.trim().toLowerCase();
}

function normalizeUsername(username) {
  if (!username) return 'unknown';
  return String(username).trim().toLowerCase();
}

export function getClientIp(request) {
  // 优先使用 CF-Connecting-IP，因为在 Cloudflare Workers 环境中更可靠且难以伪造
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return normalizeIp(cfIp);

  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return normalizeIp(first);
  }

  return 'unknown';
}

export function getCookieSecurityAttribute(request) {
  try {
    const url = new URL(request.url);
    return url.protocol === 'https:' ? '; Secure' : '';
  } catch {
    return '';
  }
}

function getLoginAttemptKey(type, value) {
  return KV_KEYS.LOGIN_ATTEMPT_PREFIX + type + ':' + value;
}

function computeLockSeconds(attempts) {
  const exponent = Math.max(0, attempts - LOGIN_RATE_LIMIT.MAX_ATTEMPTS);
  const lock = LOGIN_RATE_LIMIT.BASE_LOCK_SECONDS * Math.pow(2, exponent);
  return Math.min(lock, LOGIN_RATE_LIMIT.MAX_LOCK_SECONDS);
}

async function readLoginAttempt(env, key) {
  const raw = await env.RENDER_KV.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('解析登录尝试记录失败:', error);
    return null;
  }
}

async function writeLoginAttempt(env, key, data) {
  await env.RENDER_KV.put(
    key,
    JSON.stringify(data),
    { expirationTtl: LOGIN_RATE_LIMIT.WINDOW_SECONDS }
  );
}

async function clearLoginAttempt(env, key) {
  await env.RENDER_KV.delete(key);
}

async function evaluateAttemptLock(attempt) {
  if (!attempt) return { locked: false, lockedUntil: 0 };
  const lockedUntil = Number(attempt.lockedUntil || 0);
  if (!lockedUntil) return { locked: false, lockedUntil: 0 };
  const now = Date.now();
  return { locked: lockedUntil > now, lockedUntil };
}

export async function checkLoginLock(env, ip, username) {
  const normalizedIp = normalizeIp(ip);
  const normalizedUser = normalizeUsername(username);

  const ipKey = getLoginAttemptKey('ip', normalizedIp);
  const userKey = getLoginAttemptKey('user', normalizedUser);

  const [ipAttempt, userAttempt] = await Promise.all([
    readLoginAttempt(env, ipKey),
    readLoginAttempt(env, userKey)
  ]);

  const ipLock = await evaluateAttemptLock(ipAttempt);
  if (ipLock.locked) return { locked: true, lockedUntil: ipLock.lockedUntil };

  const userLock = await evaluateAttemptLock(userAttempt);
  if (userLock.locked) return { locked: true, lockedUntil: userLock.lockedUntil };

  return { locked: false, lockedUntil: 0 };
}

export async function recordLoginFailure(env, ip, username) {
  const normalizedIp = normalizeIp(ip);
  const normalizedUser = normalizeUsername(username);

  const ipKey = getLoginAttemptKey('ip', normalizedIp);
  const userKey = getLoginAttemptKey('user', normalizedUser);

  const [ipAttempt, userAttempt] = await Promise.all([
    readLoginAttempt(env, ipKey),
    readLoginAttempt(env, userKey)
  ]);

  const now = Date.now();

  const nextIpAttempts = (ipAttempt?.attempts || 0) + 1;
  const nextUserAttempts = (userAttempt?.attempts || 0) + 1;

  const ipLockSeconds = nextIpAttempts >= LOGIN_RATE_LIMIT.MAX_ATTEMPTS
    ? computeLockSeconds(nextIpAttempts)
    : 0;
  const userLockSeconds = nextUserAttempts >= LOGIN_RATE_LIMIT.MAX_ATTEMPTS
    ? computeLockSeconds(nextUserAttempts)
    : 0;

  const nextIpState = {
    attempts: nextIpAttempts,
    lockedUntil: ipLockSeconds ? now + ipLockSeconds * 1000 : 0,
    updatedAt: now,
  };

  const nextUserState = {
    attempts: nextUserAttempts,
    lockedUntil: userLockSeconds ? now + userLockSeconds * 1000 : 0,
    updatedAt: now,
  };

  await Promise.all([
    writeLoginAttempt(env, ipKey, nextIpState),
    writeLoginAttempt(env, userKey, nextUserState)
  ]);

  return {
    ip: nextIpState,
    user: nextUserState,
  };
}

export async function clearLoginFailures(env, ip, username) {
  const normalizedIp = normalizeIp(ip);
  const normalizedUser = normalizeUsername(username);

  const ipKey = getLoginAttemptKey('ip', normalizedIp);
  const userKey = getLoginAttemptKey('user', normalizedUser);

  await Promise.all([
    clearLoginAttempt(env, ipKey),
    clearLoginAttempt(env, userKey)
  ]);
}

/**
 * 时序安全的字符串比较（防止时序攻击）
 * @param {string} a - 字符串 a
 * @param {string} b - 字符串 b
 * @returns {boolean} - 是否相等
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  if (aBytes.length !== bBytes.length) {
    // 为了时序安全，仍需遍历完整长度
    let result = 1;
    const maxLen = Math.max(aBytes.length, bBytes.length);
    for (let i = 0; i < maxLen; i++) {
      result |= (aBytes[i % aBytes.length] || 0) ^ (bBytes[i % bBytes.length] || 0);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

/**
 * 安全生成 API Key 预览（处理短 Key 边界情况）
 * @param {string} apiKey - 完整 API Key
 * @param {number} minLength - 最小长度要求
 * @returns {string} - API Key 预览
 */
export function getApiKeyPreview(apiKey, minLength = 12) {
  if (!apiKey) return '';
  if (apiKey.length < minLength) {
    return '***';
  }
  return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
}

/**
 * 安全解析 JSON 请求体
 * @param {Request} request - 请求对象
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function safeParseJson(request) {
  try {
    const data = await request.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: '无效的 JSON 格式' };
  }
}

/**
 * 验证并限制数字范围
 * @param {any} value - 输入值
 * @param {number} defaultValue - 默认值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} - 验证后的数字
 */
export function clampNumber(value, defaultValue, min, max) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return Math.min(Math.max(num, min), max);
}
