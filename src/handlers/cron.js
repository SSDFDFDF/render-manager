/**
 * 定时任务处理器 - 服务保活 Ping
 */

import { getAccounts } from '../utils/helpers.js';
import { getServicesForAccount } from '../services/renderApi.js';
import { getServicesCache, setServicesCache } from '../services/cache.js';
import { PING_CONFIG, CRON_CONFIG, CACHE_CONFIG } from '../config/constants.js';

/**
 * 固定延迟
 * @param {number} ms - 毫秒数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 单个服务 Ping (带指数退避重试)
 * @param {string} url - 服务 URL
 * @param {number} retries - 剩余重试次数
 * @returns {Promise<Object>} - Ping 结果
 */
async function pingService(url, retries = PING_CONFIG.MAX_RETRIES) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PING_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RenderManager-KeepAlive/1.0' }
    });
    return { url, status: response.status, success: true };
  } catch (error) {
    if (retries > 0) {
      // 指数退避：基础延迟 * 2^(已重试次数)
      const retryDelay = PING_CONFIG.RETRY_DELAY_MS * Math.pow(2, PING_CONFIG.MAX_RETRIES - retries);
      await delay(retryDelay);
      return pingService(url, retries - 1);
    }
    return { url, error: error.message, success: false };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 分批并发 Ping 所有服务
 * @param {Array} services - 服务列表 [{id, name, url}]
 * @returns {Promise<Array>} - Ping 结果列表
 */
async function pingAllServicesInBatches(services) {
  const results = [];
  const batchSize = PING_CONFIG.BATCH_SIZE;

  for (let i = 0; i < services.length; i += batchSize) {
    const batch = services.slice(i, i + batchSize);

    // 批内并发执行
    const batchResults = await Promise.allSettled(
      batch.map(s => pingService(s.url))
    );

    // 收集结果
    batchResults.forEach((result, idx) => {
      const service = batch[idx];
      if (result.status === 'fulfilled') {
        results.push({ id: service.id, name: service.name, ...result.value });
      } else {
        results.push({
          id: service.id,
          name: service.name,
          url: service.url,
          success: false,
          error: result.reason?.message
        });
      }
    });

    // 批次间固定短间隔（仅在还有更多批次时）
    if (i + batchSize < services.length) {
      await delay(PING_CONFIG.BATCH_INTERVAL_MS);
    }
  }

  return results;
}

/**
 * 获取账户服务（优先使用缓存）
 * @param {Object} env - 环境变量
 * @param {Object} account - 账户信息
 * @returns {Promise<Array>} - 服务列表
 */
async function getServicesWithCache(env, account) {
  // 尝试从缓存获取
  const cached = await getServicesCache(env, account.id);

  if (cached && cached.services) {
    // 缓存有效（fresh 或 stale 都可用）
    return cached.services;
  }

  // 无缓存或过期，从 API 获取并更新缓存
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
 * 定时任务主处理函数
 * @param {Object} env - 环境变量
 * @param {AbortSignal} signal - 可选的中止信号
 */
export async function handleScheduled(env, signal) {
  const startTime = Date.now();

  // 检查是否已超时
  const checkTimeout = () => {
    if (signal?.aborted) {
      throw new Error('Cron 任务已超时');
    }
    if (Date.now() - startTime > CRON_CONFIG.TIMEOUT_MS) {
      throw new Error('Cron 任务执行超时');
    }
  };

  try {
    // 1. 获取所有账户
    const accounts = await getAccounts(env);
    if (accounts.length === 0) {
      console.log('[Cron] 无账户配置，跳过');
      return;
    }

    checkTimeout();

    // 2. 并行获取所有账户的服务（利用缓存）
    const serviceResults = await Promise.allSettled(
      accounts.map(account => getServicesWithCache(env, account))
    );

    const allServices = [];
    serviceResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allServices.push(...result.value);
      } else {
        console.error(`[Cron] 获取账户 ${accounts[index].name} 服务失败:`, result.reason?.message);
      }
    });

    checkTimeout();

    // 3. 过滤出有 url 且未暂停的服务
    const pingTargets = allServices.filter(s => s.url && s.suspended !== 'suspended');

    if (pingTargets.length === 0) {
      console.log('[Cron] 无可 Ping 服务');
      return;
    }

    // 4. 分批并发 Ping
    const results = await pingAllServicesInBatches(pingTargets);

    // 5. 统计结果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    const duration = Date.now() - startTime;

    console.log(`[Cron] Ping 完成: ${successCount}/${results.length} 成功, ${failCount} 失败, 耗时 ${duration}ms`);

    // 记录失败详情
    results.filter(r => !r.success).forEach(r => {
      console.warn(`[Cron] Ping 失败: ${r.name} (${r.url}) - ${r.error}`);
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Cron] 任务异常终止 (${duration}ms):`, error.message);
  }
}
