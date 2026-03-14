import { jsonResponse } from '../utils/response.js';
import { withAccount, clampNumber } from '../utils/helpers.js';
import {
  getServiceDetails,
  suspendService,
  resumeService,
  restartService,
  getDeploysForService,
  cancelDeploy,
  rollbackDeploy
} from '../services/renderApi.js';
import { invalidateServicesCache } from '../services/cache.js';
import { VALIDATION_CONFIG } from '../config/constants.js';

/**
 * 创建服务控制 handler 工厂函数
 * @param {Function} apiFn - API 函数
 * @param {string} errorLogLabel - 错误日志标签
 * @param {string} successMessage - 成功消息
 * @param {boolean} invalidateCache - 是否失效缓存
 * @returns {Function} - handler 函数
 */
function createServiceControlHandler(apiFn, errorLogLabel, successMessage, invalidateCache = true) {
  return async (request, match, env) => {
    const [, accountId, serviceId] = match;

    return withAccount(
      env,
      accountId,
      { notFoundMessage: '账户不存在', errorLogLabel, errorResponseMessage: null },
      async (account) => {
        const result = await apiFn(account, serviceId);
        if (invalidateCache) {
          await invalidateServicesCache(env, account.id);
        }
        return jsonResponse({ success: true, message: successMessage, data: result });
      }
    );
  };
}

/**
 * 创建部署控制 handler 工厂函数（使用 deployId 而非 serviceId）
 * @param {Function} apiFn - API 函数
 * @param {string} errorLogLabel - 错误日志标签
 * @param {string} successMessage - 成功消息
 * @returns {Function} - handler 函数
 */
function createDeployControlHandler(apiFn, errorLogLabel, successMessage) {
  return async (request, match, env) => {
    const [, accountId, deployId] = match;

    return withAccount(
      env,
      accountId,
      { notFoundMessage: '账户不存在', errorLogLabel, errorResponseMessage: null },
      async (account) => {
        const result = await apiFn(account, deployId);
        await invalidateServicesCache(env, account.id);
        return jsonResponse({ success: true, message: successMessage, data: result });
      }
    );
  };
}

/**
 * 处理获取服务详情
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleGetServiceDetails(request, match, env) {
  const [, accountId, serviceId] = match;

  return withAccount(
    env,
    accountId,
    { notFoundMessage: '账户不存在', errorLogLabel: '获取服务详情失败:', errorResponseMessage: null },
    async (account) => {
      const service = await getServiceDetails(account, serviceId);
      return jsonResponse(service);
    }
  );
}

/**
 * 处理暂停服务
 */
export const handleSuspendService = createServiceControlHandler(
  suspendService,
  '暂停服务失败:',
  '服务已暂停'
);

/**
 * 处理恢复服务
 */
export const handleResumeService = createServiceControlHandler(
  resumeService,
  '恢复服务失败:',
  '服务已恢复'
);

/**
 * 处理重启服务
 */
export const handleRestartService = createServiceControlHandler(
  restartService,
  '重启服务失败:',
  '服务已重启'
);

/**
 * 处理获取部署列表
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleGetDeploys(request, match, env) {
  const [, accountId, serviceId] = match;

  return withAccount(
    env,
    accountId,
    { notFoundMessage: '账户不存在', errorLogLabel: '获取部署列表失败:', errorResponseMessage: null },
    async (account) => {
      const url = new URL(request.url);
      const limit = clampNumber(url.searchParams.get('limit'), 10, VALIDATION_CONFIG.MIN_LIMIT, VALIDATION_CONFIG.MAX_DEPLOY_LIMIT);
      const deploys = await getDeploysForService(account, serviceId, limit);
      return jsonResponse(deploys);
    }
  );
}

/**
 * 处理取消部署
 */
export const handleCancelDeploy = createDeployControlHandler(
  cancelDeploy,
  '取消部署失败:',
  '部署已取消'
);

/**
 * 处理回滚部署
 */
export const handleRollbackDeploy = createDeployControlHandler(
  rollbackDeploy,
  '回滚部署失败:',
  '已回滚到此部署'
);

/**
 * 处理检查更新
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleCheckUpdate(request, match, env) {
  const [, accountId, serviceId] = match;

  return withAccount(
    env,
    accountId,
    { notFoundMessage: '账户不存在', errorLogLabel: '检查更新失败:', errorResponseMessage: null },
    async (account) => {
      try {
        // 1. 获取服务详情以获取 repo 和 branch
        const service = await getServiceDetails(account, serviceId);
        const repoUrl = service?.repo;
        const branch = service?.branch;

        if (!repoUrl) {
          return jsonResponse({ hasUpdate: false, message: '未找到关联的代码仓库' });
        }

        if (!repoUrl.includes('github.com')) {
          return jsonResponse({ hasUpdate: false, message: '目前仅支持通过 GitHub 仓库检查更新' });
        }

        // 解析 owner 和 repo, URL通常为 https://github.com/owner/repo
        const urlObj = new URL(repoUrl);
        const urlParts = urlObj.pathname.split('/').filter(Boolean); // e.g. ['owner', 'repo']
        const owner = urlParts[0];
        let repoName = urlParts[1];
        if (repoName && repoName.endsWith('.git')) {
          repoName = repoName.slice(0, -4);
        }

        if (!owner || !repoName || !branch) {
          return jsonResponse({ hasUpdate: false, message: '无法解析 GitHub 仓库信息' });
        }

        // 2. 获取 GitHub 最新 commit
        let latestGithubCommitSha = null;
        let githubCommitMessage = null;
        
        try {
          const githubApiUrl = `https://api.github.com/repos/${owner}/${repoName}/commits/${branch}`;
          const githubResponse = await fetch(githubApiUrl, {
            headers: {
              'User-Agent': 'Render-Service-Manager',
              'Accept': 'application/vnd.github.v3+json'
            }
          });

          if (githubResponse.ok) {
            const githubData = await githubResponse.json();
            latestGithubCommitSha = githubData.sha;
            githubCommitMessage = githubData.commit?.message;
          } else {
            return jsonResponse({ hasUpdate: false, message: `GitHub API 请求失败: ${githubResponse.status}` });
          }
        } catch (githubErr) {
          console.error('获取 GitHub commit 失败:', githubErr);
          return jsonResponse({ hasUpdate: false, message: '无法获取 Github 最新提交' });
        }

        // 3. 获取 Render 当前 Live 的部署
        const deploys = await getDeploysForService(account, serviceId, 10);
        const liveDeploy = (deploys || []).find(d => {
          const deployInfo = d.deploy || d;
          return deployInfo.status === 'live';
        });

        const deployInfo = liveDeploy ? (liveDeploy.deploy || liveDeploy) : null;
        const liveCommitSha = deployInfo?.commit?.id;

        const hasUpdate = Boolean(liveCommitSha && latestGithubCommitSha && latestGithubCommitSha !== liveCommitSha);

        return jsonResponse({
          hasUpdate,
          latestCommit: {
            id: latestGithubCommitSha,
            message: githubCommitMessage
          },
          liveCommitId: liveCommitSha
        });
      } catch (error) {
        console.error('检查更新出错:', error);
        return jsonResponse({ error: '检查更新时发生错误', details: error.message }, 500);
      }
    }
  );
}
