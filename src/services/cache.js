/**
 * 缓存服务
 * 使用 KV 存储 Services 数据，支持软/硬 TTL
 */

import { CACHE_CONFIG, KV_KEYS } from '../config/constants.js';

/**
 * 生成账户缓存 Key（包含版本号）
 * @param {string} accountId - 账户 ID
 * @returns {string}
 */
function getCacheKey(accountId) {
  return `${KV_KEYS.SERVICES_CACHE_PREFIX}${CACHE_CONFIG.VERSION}:${accountId}`;
}

/**
 * 获取账户的 Services 缓存
 * @param {Object} env - 环境变量
 * @param {string} accountId - 账户 ID
 * @returns {Promise<{data: Array, cachedAt: number, status: 'fresh'|'stale'|'expired'}|null>}
 */
export async function getServicesCache(env, accountId) {
  try {
    const key = getCacheKey(accountId);
    const cached = await env.RENDER_KV.get(key, 'json');

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = now - cached.cachedAt;

    if (age < CACHE_CONFIG.SOFT_TTL) {
      return { ...cached, status: 'fresh' };
    } else if (age < CACHE_CONFIG.HARD_TTL) {
      return { ...cached, status: 'stale' };
    } else {
      // 硬过期：返回 null 强制重新获取
      return null;
    }
  } catch (error) {
    console.error('读取缓存出错:', error);
    return null;
  }
}

/**
 * 设置账户的 Services 缓存
 * @param {Object} env - 环境变量
 * @param {string} accountId - 账户 ID
 * @param {Array} services - Services 数据
 * @returns {Promise<void>}
 */
export async function setServicesCache(env, accountId, services) {
  try {
    const key = getCacheKey(accountId);
    const data = {
      services,
      cachedAt: Date.now(),
    };

    await env.RENDER_KV.put(key, JSON.stringify(data), {
      expirationTtl: CACHE_CONFIG.KV_TTL,
    });
  } catch (error) {
    console.error('写入缓存出错:', error);
  }
}

/**
 * 删除账户的 Services 缓存
 * @param {Object} env - 环境变量
 * @param {string} accountId - 账户 ID
 * @returns {Promise<void>}
 */
export async function invalidateServicesCache(env, accountId) {
  try {
    const key = getCacheKey(accountId);
    await env.RENDER_KV.delete(key);
  } catch (error) {
    console.error('删除缓存出错:', error);
  }
}

/**
 * 获取所有账户的缓存状态
 * @param {Object} env - 环境变量
 * @param {Array} accounts - 账户列表
 * @returns {Promise<{accountId: string, cache: Object|null}[]>}
 */
export async function getAllServicesCaches(env, accounts) {
  const results = await Promise.all(
    accounts.map(async (account) => ({
      accountId: account.id,
      account,
      cache: await getServicesCache(env, account.id),
    }))
  );
  return results;
}
