import {
  getEnvVarsForService,
  updateAllEnvVarsForService,
  updateSingleEnvVarForService,
  deleteEnvVarForService
} from '../services/renderApi.js';
import { jsonResponse, noContentResponse } from '../utils/response.js';
import { withAccount, safeParseJson } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * 处理获取环境变量请求
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果 [fullPath, accountId, serviceId]
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleGetEnvVars(request, match, env) {
  const accountNameOrId = match[1];
  const serviceId = match[2];

  return withAccount(
    env,
    accountNameOrId,
    { notFoundMessage: '找不到账户', errorLogLabel: '获取环境变量出错:', errorResponseMessage: '获取环境变量失败' },
    async (account) => {
      const envVars = await getEnvVarsForService(account, serviceId);
      return jsonResponse(envVars);
    }
  );
}

/**
 * 处理更新所有环境变量请求
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果 [fullPath, accountId, serviceId]
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleUpdateAllEnvVars(request, match, env) {
  const accountNameOrId = match[1];
  const serviceId = match[2];

  return withAccount(
    env,
    accountNameOrId,
    { notFoundMessage: '找不到账户', errorLogLabel: '更新环境变量出错:', errorResponseMessage: '更新环境变量失败' },
    async (account) => {
      const { data: envVars, error: parseError } = await safeParseJson(request);
      if (parseError) {
        return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(envVars)) {
        return jsonResponse({ error: '环境变量必须是数组格式' }, HTTP_STATUS.BAD_REQUEST);
      }
      const result = await updateAllEnvVarsForService(account, serviceId, envVars);
      return jsonResponse(result);
    }
  );
}

/**
 * 处理更新单个环境变量请求
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果 [fullPath, accountId, serviceId, envVarKey]
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleUpdateSingleEnvVar(request, match, env) {
  const accountNameOrId = match[1];
  const serviceId = match[2];
  const envVarKey = match[3];

  return withAccount(
    env,
    accountNameOrId,
    { notFoundMessage: '找不到账户', errorLogLabel: '更新环境变量出错:', errorResponseMessage: '更新环境变量失败' },
    async (account) => {
      const { data, error: parseError } = await safeParseJson(request);
      if (parseError) {
        return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
      }
      const { value } = data || {};
      if (value === undefined) {
        return jsonResponse({ error: '缺少必需参数: value' }, HTTP_STATUS.BAD_REQUEST);
      }
      const result = await updateSingleEnvVarForService(account, serviceId, envVarKey, value);
      return jsonResponse(result);
    }
  );
}

/**
 * 处理删除环境变量请求
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果 [fullPath, accountId, serviceId, envVarKey]
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleDeleteEnvVar(request, match, env) {
  const accountNameOrId = match[1];
  const serviceId = match[2];
  const envVarKey = match[3];

  return withAccount(
    env,
    accountNameOrId,
    { notFoundMessage: '找不到账户', errorLogLabel: '删除环境变量出错:', errorResponseMessage: '删除环境变量失败' },
    async (account) => {
      await deleteEnvVarForService(account, serviceId, envVarKey);
      return noContentResponse();
    }
  );
}
