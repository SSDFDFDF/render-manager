import { getEventsForService } from '../services/renderApi.js';
import { jsonResponse } from '../utils/response.js';
import { withAccount } from '../utils/helpers.js';

/**
 * 处理获取事件日志请求
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果 [fullPath, accountId, serviceId]
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleGetEvents(request, match, env) {
  const accountNameOrId = match[1];
  const serviceId = match[2];

  return withAccount(
    env,
    accountNameOrId,
    { notFoundMessage: '找不到账户', errorLogLabel: '获取事件日志出错:', errorResponseMessage: '获取事件日志失败' },
    async (account) => {
      const events = await getEventsForService(account, serviceId);
      return jsonResponse(events);
    }
  );
}
