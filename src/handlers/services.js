import { getServicesForAccount, triggerDeployment } from '../services/renderApi.js';
import { jsonResponse } from '../utils/response.js';
import { getAccounts, withAccount, safeParseJson } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';
import {
  setServicesCache,
  invalidateServicesCache,
  getAllServicesCaches,
} from '../services/cache.js';

/**
 * 刷新单个账户的 Services 并更新缓存
 * @param {Object} env - 环境变量
 * @param {Object} account - 账户信息
 * @returns {Promise<Array>}
 */
async function refreshAccountServices(env, account) {
  const services = await getServicesForAccount(account);
  const servicesWithAccount = services.map(service => ({
    ...service,
    accountId: account.id,
    accountName: account.name,
  }));
  await setServicesCache(env, account.id, servicesWithAccount);
  return servicesWithAccount;
}

/**
 * 处理获取服务请求（带缓存）
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @param {Object} ctx - 执行上下文
 * @returns {Promise<Response>}
 */
export async function handleGetServices(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    const accounts = await getAccounts(env);

    if (accounts.length === 0) {
      return jsonResponse({
        services: [],
        cachedAt: null,
      });
    }

    // 获取所有账户的缓存状态
    const cacheResults = await getAllServicesCaches(env, accounts);

    let allServices = [];
    const refreshPromises = [];
    const cacheTimes = [];

    // 收集需要同步刷新的账户
    const needsSyncRefresh = [];

    for (const { accountId, account, cache } of cacheResults) {
      if (forceRefresh || !cache) {
        // 强制刷新或无缓存：需要同步刷新
        needsSyncRefresh.push({ accountId, account });
      } else if (cache.status === 'stale') {
        // 软过期：返回缓存，后台刷新
        allServices.push(...cache.services);
        cacheTimes.push(cache.cachedAt);
        refreshPromises.push(refreshAccountServices(env, account));
      } else {
        // 缓存新鲜：直接使用
        allServices.push(...cache.services);
        cacheTimes.push(cache.cachedAt);
      }
    }

    // 并行刷新需要同步获取的账户
    if (needsSyncRefresh.length > 0) {
      const refreshResults = await Promise.allSettled(
        needsSyncRefresh.map(({ account }) => refreshAccountServices(env, account))
      );

      refreshResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allServices.push(...result.value);
          cacheTimes.push(Date.now());
        } else {
          console.error(`刷新账户 ${needsSyncRefresh[index].account.name} 失败:`, result.reason);
        }
      });
    }

    // 后台刷新（不阻塞响应）- 使用 Promise.allSettled 避免部分失败影响
    if (refreshPromises.length > 0 && ctx && ctx.waitUntil) {
      ctx.waitUntil(
        Promise.allSettled(refreshPromises).then(results => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error('后台刷新失败:', result.reason);
            }
          });
        })
      );
    }

    // 计算最旧的缓存时间
    let oldestCacheTime = Date.now();
    if (cacheTimes.length > 0) {
      oldestCacheTime = Math.min(...cacheTimes);
    }

    // 保证返回顺序稳定，避免 UI 每次刷新顺序随机变化
    allServices.sort((a, b) => {
      const accountA = (a.accountName || '').toLowerCase();
      const accountB = (b.accountName || '').toLowerCase();
      if (accountA !== accountB) return accountA < accountB ? -1 : 1;

      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      if (nameA !== nameB) return nameA < nameB ? -1 : 1;

      const idA = a.id || '';
      const idB = b.id || '';
      if (idA !== idB) return idA < idB ? -1 : 1;

      return 0;
    });

    return jsonResponse({
      services: allServices,
      cachedAt: oldestCacheTime,
    });
  } catch (error) {
    console.error('获取服务出错:', error);
    return jsonResponse({ error: '获取服务失败' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 处理部署请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleDeploy(request, env) {
  try {
    const { data, error: parseError } = await safeParseJson(request);
    if (parseError) {
      return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
    }

    const { accountId, serviceId } = data || {};

    if (!accountId || !serviceId) {
      return jsonResponse({ error: '缺少必需参数: accountId 和 serviceId' }, HTTP_STATUS.BAD_REQUEST);
    }

    return withAccount(
      env,
      accountId,
      { notFoundMessage: '找不到账户', errorLogLabel: '触发部署出错:', errorResponseMessage: '触发部署失败' },
      async (account) => {
        const deployResult = await triggerDeployment(account, serviceId);
        // 部署后失效对应账户的缓存
        await invalidateServicesCache(env, account.id);
        return jsonResponse(deployResult);
      }
    );
  } catch (error) {
    console.error('触发部署出错:', error);
    return jsonResponse({ error: '触发部署失败' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// 导出刷新和失效缓存函数供其他模块使用
export { refreshAccountServices, invalidateServicesCache };
