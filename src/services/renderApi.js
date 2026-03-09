import { RENDER_API_BASE, API_CONFIG } from '../config/constants.js';

/**
 * Render API 客户端封装
 */

/**
 * 创建 API 请求头
 * @param {string} apiKey - API 密钥
 * @returns {Object} - 请求头对象
 */
function createHeaders(apiKey) {
  return {
    'accept': 'application/json',
    'authorization': `Bearer ${apiKey}`,
    'content-type': 'application/json'
  };
}

/**
 * 延迟函数
 * @param {number} ms - 毫秒数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取重试延迟时间
 * @param {Response} response - 响应对象
 * @param {number} attempt - 当前尝试次数
 * @returns {number} - 延迟毫秒数
 */
function getRetryDelayMs(response, attempt) {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) {
      return seconds * 1000;
    }
  }
  return 500 * attempt;
}

/**
 * 发起带重试的 API 请求
 * @param {string} url - 请求地址
 * @param {Object} options - fetch 选项
 * @param {Object} config - 配置 { timeoutMs, maxAttempts }
 * @returns {Promise<Object|null>} - 响应数据
 */
async function fetchWithRetry(url, options, { timeoutMs = API_CONFIG.TIMEOUT_MS, maxAttempts = API_CONFIG.MAX_ATTEMPTS } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });

      // 如果是 429 或 5xx 错误，尝试重试
      if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
        // 消费响应体以确保连接正确关闭
        await response.text().catch(() => {});
        await sleep(getRetryDelayMs(response, attempt));
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${text || response.statusText}`);
      }

      if (response.status === 204) {
        return null;
      }

      // 处理可能为空的响应体
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error?.name === 'AbortError' && attempt < maxAttempts) {
        await sleep(500 * attempt);
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('请求失败: 超出重试次数');
}

/**
 * 获取特定Render账户的服务
 * @param {Object} account - 账户配置
 * @returns {Promise<Array>} - 服务列表
 */
export async function getServicesForAccount(account) {
  const allItems = [];
  const seenCursors = new Set();
  let cursor = null;

  while (true) {
    const params = new URLSearchParams();
    params.set('includePreviews', 'true');
    params.set('limit', API_CONFIG.PAGE_LIMIT.toString());
    if (cursor) {
      params.set('cursor', cursor);
    }

    const url = `${RENDER_API_BASE}/services?${params.toString()}`;
    const page = await fetchWithRetry(url, {
      headers: createHeaders(account.apiKey)
    });

    if (!page) {
      break;
    }
    if (!Array.isArray(page)) {
      throw new Error('API 返回数据格式错误');
    }
    if (page.length === 0) {
      break;
    }

    allItems.push(...page);

    const nextCursor = page[page.length - 1]?.cursor;
    if (!nextCursor || typeof nextCursor !== 'string') {
      break;
    }
    if (seenCursors.has(nextCursor)) {
      break;
    }

    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  // 根据实际API响应转换服务，仅包含必要信息
  // 过滤掉无效的 item 或缺少 service 字段的数据
  return allItems
    .filter(item => item && item.service)
    .map(item => {
      const service = item.service;
      return {
        id: service.id,
        name: service.name,
        type: service.type,
        autoDeploy: service.autoDeploy,
        autoDeployTrigger: service.autoDeployTrigger,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        suspended: service.suspended,
        dashboardUrl: service.dashboardUrl,
        url: service.serviceDetails?.url,
        region: service.serviceDetails?.region,
        plan: service.serviceDetails?.plan,
        env: service.serviceDetails?.env,
        imagePath: service.imagePath,
        ownerId: service.ownerId
      };
    });
}

/**
 * 触发服务部署
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 要部署的服务ID
 * @returns {Promise<Object>} - 部署结果
 */
export async function triggerDeployment(account, serviceId) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/deploys`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey),
    body: JSON.stringify({ clearCache: 'do_not_clear' })
  });
}

/**
 * 获取服务的事件日志
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {number} limit - 获取数量
 * @returns {Promise<Array>} - 事件列表
 */
export async function getEventsForService(account, serviceId, limit = 5) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/events?limit=${limit}`;
  return await fetchWithRetry(url, {
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 获取服务的环境变量
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @returns {Promise<Array>} - 环境变量列表
 */
export async function getEnvVarsForService(account, serviceId) {
  const allItems = [];
  const seenCursors = new Set();
  let cursor = null;

  while (true) {
    const params = new URLSearchParams();
    params.set('limit', API_CONFIG.PAGE_LIMIT.toString());
    if (cursor) {
      params.set('cursor', cursor);
    }

    const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/env-vars?${params.toString()}`;
    const page = await fetchWithRetry(url, {
      headers: createHeaders(account.apiKey)
    });

    if (!page) {
      break;
    }
    if (!Array.isArray(page)) {
      throw new Error('API 返回数据格式错误');
    }
    if (page.length === 0) {
      break;
    }

    allItems.push(...page);

    const nextCursor = page[page.length - 1]?.cursor;
    if (!nextCursor || typeof nextCursor !== 'string') {
      break;
    }
    if (seenCursors.has(nextCursor)) {
      break;
    }

    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  return allItems;
}

/**
 * 更新服务的所有环境变量
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {Array} envVars - 环境变量列表
 * @returns {Promise<Array>} - 更新后的环境变量
 */
export async function updateAllEnvVarsForService(account, serviceId, envVars) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/env-vars`;
  return await fetchWithRetry(url, {
    method: 'PUT',
    headers: createHeaders(account.apiKey),
    body: JSON.stringify(envVars)
  });
}

/**
 * 更新服务的单个环境变量
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {string} envVarKey - 环境变量键
 * @param {string} value - 环境变量值
 * @returns {Promise<Object>} - 更新后的环境变量
 */
export async function updateSingleEnvVarForService(account, serviceId, envVarKey, value) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/env-vars/${encodeURIComponent(envVarKey)}`;
  return await fetchWithRetry(url, {
    method: 'PUT',
    headers: createHeaders(account.apiKey),
    body: JSON.stringify({ value })
  });
}

/**
 * 删除服务的环境变量
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {string} envVarKey - 环境变量键
 */
export async function deleteEnvVarForService(account, serviceId, envVarKey) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/env-vars/${encodeURIComponent(envVarKey)}`;
  await fetchWithRetry(url, {
    method: 'DELETE',
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 获取单个服务详情
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @returns {Promise<Object>} - 服务详情
 */
export async function getServiceDetails(account, serviceId) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}`;
  return await fetchWithRetry(url, {
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 暂停服务
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @returns {Promise<Object>} - 操作结果
 */
export async function suspendService(account, serviceId) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/suspend`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 恢复服务
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @returns {Promise<Object>} - 操作结果
 */
export async function resumeService(account, serviceId) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/resume`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 重启服务
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @returns {Promise<Object>} - 操作结果
 */
export async function restartService(account, serviceId) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/restart`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 获取服务部署列表
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {number} limit - 获取数量
 * @returns {Promise<Array>} - 部署列表
 */
export async function getDeploysForService(account, serviceId, limit = 10) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/deploys?limit=${limit}`;
  return await fetchWithRetry(url, {
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 取消部署
 * @param {Object} account - 账户配置
 * @param {string} deployId - 部署ID
 * @returns {Promise<Object>} - 操作结果
 */
export async function cancelDeploy(account, deployId) {
  const url = `${RENDER_API_BASE}/deploys/${encodeURIComponent(deployId)}/cancel`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 回滚到指定部署
 * @param {Object} account - 账户配置
 * @param {string} deployId - 部署ID
 * @returns {Promise<Object>} - 操作结果
 */
export async function rollbackDeploy(account, deployId) {
  const url = `${RENDER_API_BASE}/deploys/${encodeURIComponent(deployId)}/rollback`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 获取服务实例列表
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @returns {Promise<Array>} - 实例列表
 */
export async function getServiceInstances(account, serviceId) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/instances`;
  return await fetchWithRetry(url, {
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 获取服务日志
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} - 日志数据
 */
export async function getServiceLogs(account, serviceId, options = {}) {
  const params = new URLSearchParams();

  // 必需参数
  params.append('ownerId', account.ownerId);
  params.append('resource', serviceId);
  params.append('direction', 'backward');

  // 可选参数
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.startTime) params.append('startTime', options.startTime);
  if (options.endTime) params.append('endTime', options.endTime);

  const url = `${RENDER_API_BASE}/logs?${params.toString()}`;
  return await fetchWithRetry(url, {
    headers: createHeaders(account.apiKey)
  });
}

/**
 * 扩缩容服务实例
 * @param {Object} account - 账户配置
 * @param {string} serviceId - 服务ID
 * @param {number} numInstances - 目标实例数
 * @returns {Promise<Object>} - 操作结果
 */
export async function scaleServiceInstances(account, serviceId, numInstances) {
  const url = `${RENDER_API_BASE}/services/${encodeURIComponent(serviceId)}/scale`;
  return await fetchWithRetry(url, {
    method: 'POST',
    headers: createHeaders(account.apiKey),
    body: JSON.stringify({ numInstances })
  });
}

/**
 * 测试 Render API Key 有效性
 * @param {string} apiKey - API 密钥
 * @returns {Promise<Object>} - 用户信息 { ownerId, ownerEmail, ownerName, ownerType }
 */
export async function testRenderApiKey(apiKey) {
  const url = `${RENDER_API_BASE}/owners?limit=1`;
  const data = await fetchWithRetry(url, {
    headers: createHeaders(apiKey)
  });

  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('API 返回数据格式错误');
  }

  const ownerWrapper = data[0];
  if (!ownerWrapper || typeof ownerWrapper !== 'object' || !ownerWrapper.owner) {
    throw new Error('API 返回数据格式错误: 缺少 owner 字段');
  }

  const owner = ownerWrapper.owner;
  if (!owner.id || !owner.email) {
    throw new Error('API 返回数据格式错误: owner 缺少必要字段');
  }

  return {
    ownerId: owner.id,
    ownerEmail: owner.email,
    ownerName: owner.name || owner.email,
    ownerType: owner.type || 'user'
  };
}
