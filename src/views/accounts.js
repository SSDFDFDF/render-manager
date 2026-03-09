import { htmlResponse } from '../utils/response.js';
import { dashboardStyles } from './styles.js';
import { sharedScript } from './sharedScript.js';

/**
 * 账户管理页面脚本
 */
const accountsScript = `
let accounts = [];
let editingAccountId = null;


// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 获取账户列表
async function fetchAccounts() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('accounts-container');

  loading.style.display = 'flex';
  container.style.display = 'none';

  try {
    const response = await fetch('/api/accounts');
    if (!response.ok) {
      throw new Error('获取账户列表失败');
    }

    accounts = await response.json();
    renderAccounts();
  } catch (error) {
    console.error('获取账户失败:', error);
    showNotification(error.message, 'error');
  } finally {
    loading.style.display = 'none';
    container.style.display = 'block';
  }
}

// 渲染账户列表
function renderAccounts() {
  const container = document.getElementById('accountsList');
  const totalAccounts = document.getElementById('totalAccounts');

  totalAccounts.textContent = accounts.length;

  if (accounts.length === 0) {
    container.innerHTML = \`
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <h3>暂无账户</h3>
        <p>添加您的第一个 Render 账户开始管理服务</p>
        <button class="add-account-btn" type="button" data-action="open-add-modal" style="margin-top: 1.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加账户
        </button>
      </div>
    \`;
    return;
  }

  container.innerHTML = accounts.map(account => \`
    <div class="service-card account-card">
      <div class="service-card-header">
        <div class="service-header-top">
          <h3 class="service-name">\${escapeHtml(account.name)}</h3>
          <div class="service-badges">
            <span class="account-type-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
              \${account.ownerType === 'team' ? '团队' : '个人'}
            </span>
          </div>
        </div>
        <div class="service-meta">
          <div class="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            创建于 \${formatDate(account.createdAt)}
          </div>
          \${account.updatedAt ? \`
          <div class="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 105.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
            </svg>
            更新于 \${formatDate(account.updatedAt)}
          </div>
          \` : ''}
        </div>
      </div>
      <div class="service-card-body">
        <div class="account-owner-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <span>\${escapeHtml(account.email)}</span>
        </div>
        <div class="account-info-grid">
          <div class="account-info-item">
            <span class="account-info-label">账户 ID</span>
            <span class="account-info-value id-value">\${escapeHtml(account.id)}</span>
          </div>
          <div class="account-info-item">
            <span class="account-info-label">API Key</span>
            <span class="account-info-value api-key-preview">\${escapeHtml(account.apiKeyPreview)}</span>
          </div>
          <div class="account-info-item full-width">
            <span class="account-info-label">所有者</span>
            <span class="account-info-value">\${escapeHtml(account.ownerName || '')}</span>
          </div>
        </div>
        <div class="service-actions">
          <button class="action-btn secondary" type="button" data-action="open-edit-modal" data-account-id="\${escapeHtml(account.id)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑
          </button>
          <button class="action-btn danger" type="button" data-action="delete-account" data-account-id="\${escapeHtml(account.id)}" data-account-name="\${escapeHtml(account.name)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            删除
          </button>
        </div>
      </div>
    </div>
  \`).join('');
}

// 打开添加账户模态框
function openAddModal() {
  editingAccountId = null;
  document.getElementById('modalTitle').textContent = '添加账户';
  document.getElementById('accountName').value = '';
  document.getElementById('accountApiKey').value = '';
  document.getElementById('apiKeyHint').style.display = 'none';
  document.getElementById('testResult').innerHTML = '';
  document.getElementById('accountModal').classList.add('show');
}

// 打开编辑账户模态框
function openEditModal(accountId) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return;

  editingAccountId = accountId;
  document.getElementById('modalTitle').textContent = '编辑账户';
  document.getElementById('accountName').value = account.name;
  document.getElementById('accountApiKey').value = '';
  document.getElementById('apiKeyHint').style.display = 'block';
  document.getElementById('testResult').innerHTML = '';
  document.getElementById('accountModal').classList.add('show');
}

// 关闭模态框
function closeAccountModal() {
  document.getElementById('accountModal').classList.remove('show');
  editingAccountId = null;
}

// 测试 API Key 连接
async function testConnection() {
  const apiKey = document.getElementById('accountApiKey').value.trim();
  const testBtn = document.getElementById('testBtn');
  const testResult = document.getElementById('testResult');

  if (!apiKey) {
    showNotification('请先输入 API Key', 'error');
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = '测试中...';
  testResult.innerHTML = '<div class="test-loading">正在验证...</div>';

  try {
    const response = await fetch('/api/accounts/test', {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ apiKey })
    });

    const result = await response.json();

    if (result.success) {
      testResult.innerHTML = \`
        <div class="test-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div class="test-info">
            <div class="test-title">连接成功!</div>
            <div class="test-detail">用户: \${escapeHtml(result.ownerName)}</div>
            <div class="test-detail">邮箱: \${escapeHtml(result.ownerEmail)}</div>
            <div class="test-detail">类型: \${result.ownerType === 'user' ? '个人账户' : '团队账户'}</div>
          </div>
        </div>
      \`;
    } else {
      testResult.innerHTML = \`
        <div class="test-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>\${escapeHtml(result.error || '连接失败')}</span>
        </div>
      \`;
    }
  } catch (error) {
    console.error('测试连接失败:', error);
    testResult.innerHTML = \`
      <div class="test-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>测试连接出错</span>
      </div>
    \`;
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = '测试连接';
  }
}

// 保存账户
async function saveAccount(event) {
  event.preventDefault();

  const name = document.getElementById('accountName').value.trim();
  const apiKey = document.getElementById('accountApiKey').value.trim();
  const submitBtn = document.getElementById('submitBtn');

  if (!name) {
    showNotification('请输入账户名称', 'error');
    return;
  }

  if (!editingAccountId && !apiKey) {
    showNotification('请输入 API Key', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '保存中...';

  try {
    let response;

    if (editingAccountId) {
      // 更新账户
      const updateData = { name };
      if (apiKey) {
        updateData.apiKey = apiKey;
      }

      response = await fetch('/api/accounts/' + editingAccountId, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(updateData)
      });
    } else {
      // 添加账户
      response = await fetch('/api/accounts', {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ name, apiKey })
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '操作失败');
    }

    const result = await response.json();
    showNotification('账户 "' + result.name + '" ' + (editingAccountId ? '更新' : '添加') + '成功', 'success');
    closeAccountModal();
    await fetchAccounts();
  } catch (error) {
    console.error('保存账户失败:', error);
    showNotification(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '保存账户';
  }
}

// 删除账户
async function deleteAccount(accountId, accountName) {
  if (!confirm('确定要删除账户 "' + accountName + '" 吗？\\n\\n此操作不可撤销，删除后该账户下的所有服务将不再显示在管理界面中。')) {
    return;
  }

  try {
    const response = await fetch('/api/accounts/' + accountId, {
      method: 'DELETE',
      headers: createHeaders(null)
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.error || '删除失败');
    }

    showNotification('账户 "' + accountName + '" 已删除', 'success');
    await fetchAccounts();
  } catch (error) {
    console.error('删除账户失败:', error);
    showNotification(error.message, 'error');
  }
}

// 处理模态框外的点击
document.addEventListener('click', function(event) {
  const modal = document.getElementById('accountModal');
  if (event.target === modal) {
    closeAccountModal();
  }
});

// 处理 Escape 键
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('accountModal');
    if (modal.classList.contains('show')) {
      closeAccountModal();
    }
  }
});

function initEventDelegation() {
  document.addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;

    switch (action) {
      case 'open-add-modal':
        openAddModal();
        break;
      case 'open-edit-modal': {
        const accountId = actionElement.dataset.accountId;
        if (!accountId) return;
        openEditModal(accountId);
        break;
      }
      case 'delete-account': {
        const accountId = actionElement.dataset.accountId;
        const accountName = actionElement.dataset.accountName;
        if (!accountId || !accountName) return;
        deleteAccount(accountId, accountName);
        break;
      }
      case 'close-account-modal':
        closeAccountModal();
        break;
      case 'test-connection':
        testConnection();
        break;
      default:
        break;
    }
  });

  const accountForm = document.getElementById('accountForm');
  accountForm?.addEventListener('submit', function(event) {
    saveAccount(event);
  });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
  initEventDelegation();
  fetchAccounts();
});
`;

/**
 * 渲染账户管理页面
 * @returns {Response} - HTML响应
 */
export function renderAccountsPage() {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>账户管理 - Render Service Manager</title>
  <style nonce="__CSP_NONCE__">${dashboardStyles}</style>
</head>
<body>
  <header class="header">
    <div class="header-container">
      <a href="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 25L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2M12 4.18L19.25 7.8V12C19.25 15.58 17.58 18.85 15 20.75V13.25H9V20.75C6.42 18.85 4.75 15.58 4.75 12V7.8L12 4.18Z" />
          </svg>
        </div>
        <h1>Render Manager</h1>
      </a>
      <div class="header-actions">
        <a href="/" class="header-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          仪表盘
        </a>
        <form action="/logout" method="POST" class="logout-form" data-csrf-form>
          <input type="hidden" name="csrf_token" value="">
          <button type="submit" class="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            登出
          </button>
        </form>
      </div>
    </div>
  </header>

  <div class="main-content">
    <div class="container">
      <div class="stats-bar">
        <div class="stats-content">
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3 id="totalAccounts">0</h3>
              <p>账户数</p>
            </div>
          </div>
        </div>
        <button class="add-account-btn" type="button" data-action="open-add-modal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加账户
        </button>
      </div>

      <div id="loading" class="loading">
        <div class="spinner"></div>
        <p>加载账户中...</p>
      </div>

      <div id="accounts-container" style="display: none;">
        <div class="services-grid" id="accountsList">
          <!-- 账户将在这里动态加载 -->
        </div>
      </div>
    </div>
  </div>

  <footer class="footer">
    <p>© 2025 Render Service Manager | <a href="https://github.com/ssfun/render-service-manager" target="_blank" rel="noopener noreferrer">@sfun</a></p>
  </footer>

  <!-- 添加/编辑账户模态框 -->
  <div id="accountModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title-section">
          <h2 class="modal-title" id="modalTitle">添加账户</h2>
          <button class="modal-close" type="button" data-action="close-account-modal">×</button>
        </div>
      </div>
      <div class="modal-body">
        <form id="accountForm">
          <div class="form-group">
            <label class="form-label" for="accountName">账户名称</label>
            <input type="text" id="accountName" class="form-input" placeholder="为此账户起一个易于识别的名称" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="accountApiKey">Render API Key</label>
            <div class="test-btn-row">
              <input type="text" id="accountApiKey" class="form-input api-key-input" placeholder="rnd_xxxxxxxxxx">
              <button type="button" id="testBtn" class="action-btn secondary" data-action="test-connection">
                测试连接
              </button>
            </div>
            <p class="form-hint" id="apiKeyHint" style="display: none;">留空表示不修改 API Key</p>
            <div id="testResult"></div>
          </div>

          <div class="form-actions">
            <button type="button" class="action-btn secondary" data-action="close-account-modal">取消</button>
            <button type="submit" id="submitBtn" class="action-btn primary">保存账户</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script nonce="__CSP_NONCE__">${sharedScript}\n${accountsScript}</script>
</body>
</html>
  `;

  return htmlResponse(html);
}
