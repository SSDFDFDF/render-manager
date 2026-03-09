import { jsonResponse } from '../utils/response.js';
import { withAccount, safeParseJson, clampNumber } from '../utils/helpers.js';
import {
  getServiceInstances,
  getServiceLogs,
  scaleServiceInstances
} from '../services/renderApi.js';
import { HTTP_STATUS, VALIDATION_CONFIG } from '../config/constants.js';
import { invalidateServicesCache } from '../services/cache.js';


/**
 * 处理获取服务实例列表
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleGetInstances(request, match, env) {
  const [, accountId, serviceId] = match;

  return withAccount(
    env,
    accountId,
    { notFoundMessage: '账户不存在', errorLogLabel: '获取实例列表失败:', errorResponseMessage: null },
    async (account) => {
      const instances = await getServiceInstances(account, serviceId);
      return jsonResponse(instances);
    }
  );
}

/**
 * 处理获取服务日志
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleGetLogs(request, match, env) {
  const [, accountId, serviceId] = match;

  return withAccount(
    env,
    accountId,
    { notFoundMessage: '账户不存在', errorLogLabel: '获取日志失败:', errorResponseMessage: null },
    async (account) => {
      const url = new URL(request.url);
      const levelFilter = url.searchParams.get('level') || undefined;
      const options = {
        startTime: url.searchParams.get('startTime') || undefined,
        endTime: url.searchParams.get('endTime') || undefined,
        limit: clampNumber(url.searchParams.get('limit'), 20, VALIDATION_CONFIG.MIN_LIMIT, VALIDATION_CONFIG.MAX_DEPLOY_LIMIT)
      };

      const data = await getServiceLogs(account, serviceId, options);
      let logs = data.logs || [];

      // Render API 返回的日志 level 在 labels 数组中，需要提取并过滤
      if (levelFilter) {
        logs = logs.filter(log => {
          const levelLabel = log.labels?.find(l => l.name === 'level');
          const logLevel = (levelLabel?.value || '').toLowerCase();
          return logLevel === levelFilter.toLowerCase();
        });
      }

      // 转换日志格式以便前端使用
      const formattedLogs = logs.map(log => {
        const levelLabel = log.labels?.find(l => l.name === 'level');
        const level = levelLabel?.value || 'info';

        // message 可能是对象或字符串
        let message;
        if (typeof log.message === 'object') {
          message = log.message.message || JSON.stringify(log.message);
        } else {
          message = log.message || '';
        }

        return {
          id: log.id,
          timestamp: log.timestamp,
          level: level,
          message: message
        };
      });

      return jsonResponse({
        logs: formattedLogs,
        hasMore: data.hasMore,
        nextStartTime: data.nextStartTime,
        nextEndTime: data.nextEndTime
      });
    }
  );
}

/**
 * 处理扩缩容服务
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleScaleService(request, match, env) {
  const [, accountId, serviceId] = match;

  return withAccount(
    env,
    accountId,
    { notFoundMessage: '账户不存在', errorLogLabel: '扩缩容服务失败:', errorResponseMessage: null },
    async (account) => {
      const { data, error: parseError } = await safeParseJson(request);
      if (parseError) {
        return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
      }

      const numInstances = parseInt(data?.numInstances, 10);

      if (isNaN(numInstances) || numInstances < 0) {
        return jsonResponse({ error: '无效的实例数量' }, HTTP_STATUS.BAD_REQUEST);
      }

      if (numInstances > VALIDATION_CONFIG.MAX_INSTANCES) {
        return jsonResponse({ error: `实例数量不能超过 ${VALIDATION_CONFIG.MAX_INSTANCES}` }, HTTP_STATUS.BAD_REQUEST);
      }

      const result = await scaleServiceInstances(account, serviceId, numInstances);
      // 扩缩容后失效缓存
      await invalidateServicesCache(env, account.id);
      return jsonResponse({ success: true, message: `服务已扩缩容至 ${numInstances} 个实例`, data: result });
    }
  );
}
