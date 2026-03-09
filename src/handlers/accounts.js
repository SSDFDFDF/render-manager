import { jsonResponse } from '../utils/response.js';
import { getAccounts, saveAccounts, generateAccountId, getApiKeyPreview, safeParseJson } from '../utils/helpers.js';
import { testRenderApiKey } from '../services/renderApi.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * 获取账户列表
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleGetAccounts(request, env) {
  try {
    const accounts = await getAccounts(env);

    // 隐藏完整 API Key，仅返回预览
    const safeAccounts = accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      email: acc.email || '',
      ownerName: acc.ownerName || acc.name,
      apiKeyPreview: getApiKeyPreview(acc.apiKey),
      createdAt: acc.createdAt || new Date().toISOString(),
      updatedAt: acc.updatedAt,
    }));

    return jsonResponse(safeAccounts);
  } catch (error) {
    console.error('获取账户列表出错:', error);
    return jsonResponse({ error: '获取账户列表失败' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 添加新账户
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleAddAccount(request, env) {
  try {
    const { data, error: parseError } = await safeParseJson(request);
    if (parseError) {
      return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
    }

    const { name, apiKey } = data || {};

    if (!name || !name.trim()) {
      return jsonResponse({ error: '账户名称不能为空' }, HTTP_STATUS.BAD_REQUEST);
    }

    if (!apiKey || !apiKey.trim()) {
      return jsonResponse({ error: 'API Key 不能为空' }, HTTP_STATUS.BAD_REQUEST);
    }

    // 测试 API Key 并获取用户信息
    let ownerInfo;
    try {
      ownerInfo = await testRenderApiKey(apiKey.trim());
    } catch (error) {
      return jsonResponse({
        error: 'API Key 无效或无法连接到 Render API'
      }, HTTP_STATUS.BAD_REQUEST);
    }

    const accounts = await getAccounts(env);

    // 检查名称是否重复
    if (accounts.some(acc => acc.name.toLowerCase() === name.trim().toLowerCase())) {
      return jsonResponse({ error: '账户名称已存在' }, HTTP_STATUS.BAD_REQUEST);
    }

    // 检查邮箱是否已存在（防止同一账户多次添加）
    if (accounts.some(acc => acc.email === ownerInfo.ownerEmail)) {
      return jsonResponse({ error: '该 Render 账户已添加' }, HTTP_STATUS.BAD_REQUEST);
    }

    const newAccount = {
      id: generateAccountId(),
      name: name.trim(),
      apiKey: apiKey.trim(),
      email: ownerInfo.ownerEmail,
      ownerName: ownerInfo.ownerName,
      ownerId: ownerInfo.ownerId,
      ownerType: ownerInfo.ownerType,
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    await saveAccounts(accounts, env);

    return jsonResponse({
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      ownerName: newAccount.ownerName,
      apiKeyPreview: getApiKeyPreview(newAccount.apiKey),
      createdAt: newAccount.createdAt
    });
  } catch (error) {
    console.error('添加账户出错:', error);
    return jsonResponse({ error: '添加账户失败' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 更新账户
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleUpdateAccount(request, match, env) {
  try {
    const accountId = match[1];
    const { data, error: parseError } = await safeParseJson(request);
    if (parseError) {
      return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
    }

    const { name, apiKey } = data || {};

    const accounts = await getAccounts(env);
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);

    if (accountIndex === -1) {
      return jsonResponse({ error: '账户不存在' }, HTTP_STATUS.NOT_FOUND);
    }

    let needsSave = false;

    // 更新名称
    if (name && name.trim()) {
      // 检查新名称是否与其他账户冲突
      const nameExists = accounts.some((acc, idx) =>
        idx !== accountIndex && acc.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (nameExists) {
        return jsonResponse({ error: '账户名称已存在' }, HTTP_STATUS.BAD_REQUEST);
      }

      accounts[accountIndex].name = name.trim();
      needsSave = true;
    }

    // 更新 API Key（可选）
    if (apiKey && apiKey.trim()) {
      // 测试新的 API Key
      let ownerInfo;
      try {
        ownerInfo = await testRenderApiKey(apiKey.trim());
      } catch (error) {
        return jsonResponse({
          error: 'API Key 无效或无法连接到 Render API'
        }, HTTP_STATUS.BAD_REQUEST);
      }

      // 检查是否与其他账户的邮箱冲突
      const emailExists = accounts.some((acc, idx) =>
        idx !== accountIndex && acc.email === ownerInfo.ownerEmail
      );

      if (emailExists) {
        return jsonResponse({ error: '该 Render 账户已被其他账户使用' }, HTTP_STATUS.BAD_REQUEST);
      }

      // 更新所有相关字段
      accounts[accountIndex].apiKey = apiKey.trim();
      accounts[accountIndex].email = ownerInfo.ownerEmail;
      accounts[accountIndex].ownerName = ownerInfo.ownerName;
      accounts[accountIndex].ownerId = ownerInfo.ownerId;
      accounts[accountIndex].ownerType = ownerInfo.ownerType;
      needsSave = true;
    }

    if (!needsSave) {
      return jsonResponse({ error: '没有要更新的内容' }, HTTP_STATUS.BAD_REQUEST);
    }

    accounts[accountIndex].updatedAt = new Date().toISOString();
    await saveAccounts(accounts, env);

    const updatedAccount = accounts[accountIndex];
    return jsonResponse({
      id: updatedAccount.id,
      name: updatedAccount.name,
      email: updatedAccount.email,
      ownerName: updatedAccount.ownerName,
      apiKeyPreview: getApiKeyPreview(updatedAccount.apiKey),
      updatedAt: updatedAccount.updatedAt
    });
  } catch (error) {
    console.error('更新账户出错:', error);
    return jsonResponse({ error: '更新账户失败' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 删除账户
 * @param {Request} request - 请求对象
 * @param {Array} match - 路由匹配结果
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleDeleteAccount(request, match, env) {
  try {
    const accountId = match[1];

    const accounts = await getAccounts(env);
    const filteredAccounts = accounts.filter(acc => acc.id !== accountId);

    if (filteredAccounts.length === accounts.length) {
      return jsonResponse({ error: '账户不存在' }, HTTP_STATUS.NOT_FOUND);
    }

    await saveAccounts(filteredAccounts, env);

    return new Response(null, { status: HTTP_STATUS.NO_CONTENT });
  } catch (error) {
    console.error('删除账户出错:', error);
    return jsonResponse({ error: '删除账户失败' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 测试 API Key 连接
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} - 响应
 */
export async function handleTestAccount(request, env) {
  try {
    const { data, error: parseError } = await safeParseJson(request);
    if (parseError) {
      return jsonResponse({ error: parseError }, HTTP_STATUS.BAD_REQUEST);
    }

    const { apiKey } = data || {};

    if (!apiKey || !apiKey.trim()) {
      return jsonResponse({ error: 'API Key 不能为空' }, HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const ownerInfo = await testRenderApiKey(apiKey.trim());
      return jsonResponse({
        success: true,
        message: 'API Key 有效',
        ownerName: ownerInfo.ownerName,
        ownerEmail: ownerInfo.ownerEmail,
        ownerType: ownerInfo.ownerType
      });
    } catch (error) {
      return jsonResponse({
        success: false,
        error: 'API Key 无效或无法连接到 Render API'
      }, HTTP_STATUS.BAD_REQUEST);
    }
  } catch (error) {
    console.error('测试账户连接出错:', error);
    return jsonResponse({
      error: '测试连接失败'
    }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
