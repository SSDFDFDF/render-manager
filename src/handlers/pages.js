import { verifySession } from '../services/session.js';
import { renderLoginPage } from '../views/login.js';
import { renderDashboard } from '../views/dashboard.js';
import { renderAccountsPage } from '../views/accounts.js';

/**
 * 处理主页请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @param {boolean} isLoginPage - 是否强制显示登录页
 * @returns {Promise<Response>}
 */
export async function handleMainPage(request, env, isLoginPage = false) {
  if (isLoginPage) {
    return renderLoginPage();
  }

  // 检查用户是否已登录
  const { session } = await verifySession(request, env);
  if (!session) {
    return renderLoginPage();
  }

  // 渲染仪表盘
  return renderDashboard();
}

/**
 * 处理账户管理页面请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>}
 */
export async function handleAccountsPage(request, env) {
  // 渲染账户管理页面
  return renderAccountsPage();
}
