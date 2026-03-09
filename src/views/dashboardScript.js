/**
 * 仪表盘前端 JavaScript
 */
export const dashboardScript = `
let currentServiceId = '';
let currentAccountId = '';
let currentServiceName = '';
let allEnvVars = [];
let allServices = [];
let isFormVisible = false;
let editingKey = null;
let lastCachedAt = null;

// 禁止/恢复 body 滚动
function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
}

// 格式化缓存时间
function formatCacheTime(cachedAt) {
  if (!cachedAt) return '';

  const now = Date.now();
  const diffMs = now - cachedAt;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return diffMinutes + ' 分钟前';
  } else {
    const date = new Date(cachedAt);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
}

// 更新缓存信息显示
function updateCacheInfo(cachedAt) {
  lastCachedAt = cachedAt;
  const cacheInfo = document.getElementById('cacheInfo');
  if (cacheInfo && cachedAt) {
    cacheInfo.textContent = '更新于 ' + formatCacheTime(cachedAt);
  }
}

// 定期更新缓存显示时间
setInterval(function() {
  if (lastCachedAt) {
    updateCacheInfo(lastCachedAt);
  }
}, 30000);

// 从API获取服务
async function fetchServices(forceRefresh) {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.classList.add('spinning');
  }

  try {
    const url = forceRefresh ? '/api/services?refresh=true' : '/api/services';
    const response = await apiJson(url);

    // 处理新的响应格式
    if (response && typeof response === 'object' && Array.isArray(response.services)) {
      allServices = response.services;
      updateCacheInfo(response.cachedAt);
    } else if (Array.isArray(response)) {
      // 兼容旧格式
      allServices = response;
    }

    populateAccountFilter(allServices);
    renderServices(allServices);
    applyFilters();
    updateStats();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('services-container').style.display = 'grid';

    if (forceRefresh) {
      showNotification('数据已刷新', 'success');
    }
  } catch (error) {
    console.error('获取服务出错:', error);
    document.getElementById('loading').style.display = 'none';
    showNotification('加载服务出错: ' + (error?.message || String(error)), 'error');
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove('spinning');
    }
  }
}

// 在UI中渲染服务
function renderServices(services) {
  const container = document.getElementById('services-container');
  container.innerHTML = '';

  if (services.length === 0) {
    container.innerHTML = \`
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>未找到服务</h3>
        <p>请先前往<a href="/accounts" style="color: #3b82f6; text-decoration: underline;">账户管理</a>添加您的 Render 账户。</p>
      </div>
    \`;
    return;
  }

  services.forEach(service => {
    const serviceCard = createServiceCard(service);
    container.appendChild(serviceCard);
  });
}

// 创建服务卡片元素
function createServiceCard(service) {
  const card = document.createElement('div');
  card.className = 'service-card';
  card.setAttribute('data-name', (service?.name || '').toLowerCase());
  card.setAttribute('data-account', (service?.accountName || '').toLowerCase());
  card.setAttribute('data-account-name', service?.accountName || '');

  const statusClass = service?.suspended === 'suspended' ? 'status-suspended' : 'status-live';
  const statusText = service?.suspended === 'suspended' ? '已暂停' : '运行中';

  const updatedDate = service?.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : 'N/A';

  const header = document.createElement('div');
  header.className = 'service-card-header';

  const headerTop = document.createElement('div');
  headerTop.className = 'service-header-top';

  const nameEl = document.createElement('h3');
  nameEl.className = 'service-name';
  nameEl.textContent = service?.name || '';

  const badges = document.createElement('div');
  badges.className = 'service-badges';

  const typeBadge = document.createElement('span');
  typeBadge.className = 'service-type';
  typeBadge.textContent = service?.type || '';

  const accountBadge = document.createElement('span');
  accountBadge.className = 'account-badge';
  accountBadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z" fill="currentColor"/></svg> ';
  accountBadge.appendChild(document.createTextNode(service?.accountName || ''));

  badges.appendChild(typeBadge);
  badges.appendChild(accountBadge);

  headerTop.appendChild(nameEl);
  headerTop.appendChild(badges);

  const meta = document.createElement('div');
  meta.className = 'service-meta';

  const updatedItem = document.createElement('div');
  updatedItem.className = 'meta-item';
  updatedItem.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM16.2 16.2L11 13V7H12.5V12.2L17 14.9L16.2 16.2Z" fill="currentColor"/></svg> ';
  updatedItem.appendChild(document.createTextNode('更新于 ' + updatedDate));

  const regionItem = document.createElement('div');
  regionItem.className = 'meta-item';
  regionItem.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C15.31 2 18 4.66 18 7.95C18 12.41 12 19 12 19S6 12.41 6 7.95C6 4.66 8.69 2 12 2M12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6Z" fill="currentColor"/></svg> ';
  regionItem.appendChild(document.createTextNode(service?.region || 'N/A'));

  meta.appendChild(updatedItem);
  meta.appendChild(regionItem);

  header.appendChild(headerTop);
  header.appendChild(meta);

  const body = document.createElement('div');
  body.className = 'service-card-body';

  const statusRow = document.createElement('div');
  statusRow.className = 'service-status-row';

  const status = document.createElement('div');
  status.className = 'service-status ' + statusClass;

  const indicator = document.createElement('div');
  indicator.className = 'status-indicator';

  status.appendChild(indicator);
  status.appendChild(document.createTextNode(statusText));
  statusRow.appendChild(status);

  if (service?.url) {
    const safeUrl = sanitizeUrl(service.url);

    const link = document.createElement('a');
    link.className = 'service-url';
    link.href = safeUrl || '#';

    if (safeUrl) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.classList.add('disabled-link');
    }

    link.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11M15 3H21M21 3V9M21 3L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ';
    link.appendChild(document.createTextNode('访问服务'));

    statusRow.appendChild(link);
  }

  const infoGrid = document.createElement('div');
  infoGrid.className = 'service-info-grid';

  function appendInfo(label, value) {
    const item = document.createElement('div');
    item.className = 'info-item';

    const labelEl = document.createElement('span');
    labelEl.className = 'info-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'info-value';
    valueEl.textContent = value;

    item.appendChild(labelEl);
    item.appendChild(valueEl);
    infoGrid.appendChild(item);
  }

  appendInfo('套餐', service?.plan || 'N/A');
  appendInfo('环境', service?.env || 'N/A');
  appendInfo('自动部署', service?.autoDeploy === 'yes' ? '已启用' : '已禁用');

  const idItem = document.createElement('div');
  idItem.className = 'info-item';

  const idLabel = document.createElement('span');
  idLabel.className = 'info-label';
  idLabel.textContent = '服务ID';

  const idValue = document.createElement('span');
  idValue.className = 'info-value';
  idValue.style.fontSize = '12px';
  idValue.style.fontFamily = 'monospace';
  idValue.textContent = service?.id || '';

  idItem.appendChild(idLabel);
  idItem.appendChild(idValue);
  infoGrid.appendChild(idItem);

  const actions = document.createElement('div');
  actions.className = 'service-actions';

  function makeActionButton(className, action, label, svgHtml, disabled) {
    const btn = document.createElement('button');
    btn.className = className;
    btn.dataset.action = action;
    btn.dataset.accountId = String(service?.accountId || '');
    btn.dataset.serviceId = String(service?.id || '');
    btn.dataset.serviceName = String(service?.name || '');
    btn.innerHTML = svgHtml + ' ';
    btn.appendChild(document.createTextNode(label));
    if (disabled) btn.disabled = true;
    return btn;
  }

  actions.appendChild(
    makeActionButton(
      'action-btn deploy-btn',
      'deploy',
      '部署',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L18 7L16.74 12L22 13.09L15.74 14L17 19L12 17.74L7 19L8.26 14L2 13.09L8.26 12L7 7L12 8.26V2Z" fill="currentColor"/></svg>',
      service?.suspended === 'suspended'
    )
  );

  if (service?.suspended === 'suspended') {
    actions.appendChild(
      makeActionButton(
        'action-btn resume-btn',
        'resume',
        '恢复',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>',
        false
      )
    );
  } else {
    actions.appendChild(
      makeActionButton(
        'action-btn suspend-btn',
        'suspend',
        '暂停',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="currentColor"/></svg>',
        false
      )
    );
  }

  actions.appendChild(
    makeActionButton(
      'action-btn restart-btn',
      'restart',
      '重启',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/></svg>',
      service?.suspended === 'suspended'
    )
  );

  actions.appendChild(
    makeActionButton(
      'action-btn env-vars-btn',
      'env',
      '环境',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM19 11H15V15H13V11H9V9H13V5H15V9H19V11Z" fill="currentColor"/></svg>',
      false
    )
  );

  // 第二排按钮顺序: instances, deploys, events, logs
  actions.appendChild(
    makeActionButton(
      'action-btn instances-btn',
      'instances',
      '实例',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z" fill="currentColor"/></svg>',
      false
    )
  );

  actions.appendChild(
    makeActionButton(
      'action-btn deploys-btn',
      'deploys',
      '历史',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5S20 8.13 20 12S16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12S17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/></svg>',
      false
    )
  );

  actions.appendChild(
    makeActionButton(
      'action-btn events-btn',
      'events',
      '事件',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      false
    )
  );

  actions.appendChild(
    makeActionButton(
      'action-btn logs-btn',
      'logs',
      '日志',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="currentColor"/></svg>',
      false
    )
  );

  body.appendChild(statusRow);
  body.appendChild(infoGrid);
  body.appendChild(actions);

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

// 更新统计信息
function updateStats() {
  const totalServices = allServices.length;
  const liveServices = allServices.filter(s => s.suspended !== 'suspended').length;
  const accounts = [...new Set(allServices.map(s => s.accountName))];

  document.getElementById('totalServices').textContent = totalServices;
  document.getElementById('liveServices').textContent = liveServices;
  document.getElementById('totalAccounts').textContent = accounts.length;
}

function populateAccountFilter(services) {
  const select = document.getElementById('accountFilter');
  if (!select) return;

  const selectedValue = select.value;

  const accounts = Array.from(
    new Set((services || []).map(s => s.accountName).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'));

  select.innerHTML = '<option value="">全部账户</option>';

  accounts.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  select.value = accounts.includes(selectedValue) ? selectedValue : '';
}

function applyFilters() {
  const searchTerm = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  const selectedAccount = document.getElementById('accountFilter')?.value || '';

  const serviceCards = document.querySelectorAll('.service-card');

  serviceCards.forEach(card => {
    const name = card.getAttribute('data-name') || '';
    const account = card.getAttribute('data-account') || '';
    const rawAccountName = card.getAttribute('data-account-name') || '';

    const matchesAccount = !selectedAccount || rawAccountName === selectedAccount;
    const matchesSearch = name.includes(searchTerm) || account.includes(searchTerm);

    card.style.display = matchesAccount && matchesSearch ? 'block' : 'none';
  });
}

// 部署服务
async function deployService(accountId, serviceId, serviceName) {
  if (!confirm(\`确定要部署 \${serviceName}?\`)) {
    return;
  }

  try {
    const result = await apiJson('/api/deploy', {
      method: 'POST',
      body: {
        accountId: accountId,
        serviceId: serviceId
      }
    });

    const deployId = result && typeof result.id === 'string' ? result.id : '';
    showNotification(
      deployId
        ? \`已成功触发 \${serviceName} 的部署。部署ID: \${deployId}\`
        : \`已成功触发 \${serviceName} 的部署。\`,
      'success'
    );

    setTimeout(fetchServices, 2000);
  } catch (error) {
    console.error('部署服务出错:', error);
    showNotification('部署服务出错: ' + (error?.message || String(error)), 'error');
  }
}

// 暂停服务
async function suspendService(accountId, serviceId, serviceName) {
  if (!confirm(\`确定要暂停 \${serviceName}?\\n\\n暂停后服务将停止运行，但配置会保留。\`)) {
    return;
  }

  try {
    await apiJson(\`/api/services/\${accountId}/\${serviceId}/suspend\`, {
      method: 'POST'
    });

    showNotification(\`已成功暂停 \${serviceName}\`, 'success');
    setTimeout(fetchServices, 2000);
  } catch (error) {
    console.error('暂停服务出错:', error);
    showNotification('暂停服务出错: ' + (error?.message || String(error)), 'error');
  }
}

// 恢复服务
async function resumeService(accountId, serviceId, serviceName) {
  if (!confirm(\`确定要恢复 \${serviceName}?\`)) {
    return;
  }

  try {
    await apiJson(\`/api/services/\${accountId}/\${serviceId}/resume\`, {
      method: 'POST'
    });

    showNotification(\`已成功恢复 \${serviceName}\`, 'success');
    setTimeout(fetchServices, 2000);
  } catch (error) {
    console.error('恢复服务出错:', error);
    showNotification('恢复服务出错: ' + (error?.message || String(error)), 'error');
  }
}

// 重启服务
async function restartService(accountId, serviceId, serviceName) {
  if (!confirm(\`确定要重启 \${serviceName}?\\n\\n重启将导致服务短暂不可用。\`)) {
    return;
  }

  try {
    await apiJson(\`/api/services/\${accountId}/\${serviceId}/restart\`, {
      method: 'POST'
    });

    showNotification(\`已成功重启 \${serviceName}\`, 'success');
    setTimeout(fetchServices, 2000);
  } catch (error) {
    console.error('重启服务出错:', error);
    showNotification('重启服务出错: ' + (error?.message || String(error)), 'error');
  }
}

// 当前部署模态框的上下文
let currentDeployAccountId = '';
let currentDeployServiceId = '';
let currentDeployServiceName = '';

// 打开部署历史模态框
async function openDeploysModal(accountId, serviceId, serviceName) {
  lockBodyScroll();
  const modal = document.getElementById('deploysModal');
  const container = document.getElementById('deploysContainer');
  const serviceInfo = document.getElementById('deploysModalServiceInfo');

  currentDeployAccountId = accountId;
  currentDeployServiceId = serviceId;
  currentDeployServiceName = serviceName;

  const accountName = allServices.find(s => s.id === serviceId && s.accountId === accountId)?.accountName || accountId;
  serviceInfo.replaceChildren(
    document.createTextNode('查看 '),
    (() => {
      const strong = document.createElement('strong');
      strong.textContent = serviceName;
      return strong;
    })(),
    document.createTextNode(' (' + accountName + ') 的部署历史')
  );

  container.innerHTML = '<div class="loading" style="padding: 2rem;"><div class="loading-spinner"></div><p>加载部署历史中...</p></div>';

  modal.classList.add('show');

  try {
    const deploys = await apiJson(\`/api/deploys/\${accountId}/\${serviceId}\`);
    renderDeploys(deploys);
  } catch (error) {
    console.error('获取部署历史出错:', error);
    container.innerHTML = \`
      <div class="empty-state">
        <h3>加载部署历史出错</h3>
        <p>\${escapeHtml(error?.message || String(error))}</p>
      </div>
    \`;
  }
}

// 渲染部署历史
function renderDeploys(deploys) {
  const container = document.getElementById('deploysContainer');

  if (!deploys || deploys.length === 0) {
    container.innerHTML = \`
      <div class="empty-state">
        <h3>没有部署记录</h3>
        <p>此服务暂无部署历史。</p>
      </div>
    \`;
    return;
  }

  container.innerHTML = '';

  deploys.forEach((item, index) => {
    const deploy = item.deploy || item;
    const deployItem = document.createElement('div');
    deployItem.className = 'deploy-item';

    const deployTime = new Date(deploy.createdAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let statusClass = 'deploy-status-pending';
    let statusText = deploy.status || 'unknown';

    switch (deploy.status) {
      case 'live':
        statusClass = 'deploy-status-live';
        statusText = '运行中';
        break;
      case 'build_succeeded':
        statusClass = 'deploy-status-succeeded';
        statusText = '构建成功';
        break;
      case 'build_failed':
        statusClass = 'deploy-status-failed';
        statusText = '构建失败';
        break;
      case 'update_failed':
        statusClass = 'deploy-status-failed';
        statusText = '更新失败';
        break;
      case 'canceled':
        statusClass = 'deploy-status-canceled';
        statusText = '已取消';
        break;
      case 'build_in_progress':
        statusClass = 'deploy-status-building';
        statusText = '构建中';
        break;
      case 'update_in_progress':
        statusClass = 'deploy-status-building';
        statusText = '更新中';
        break;
      case 'pre_deploy_in_progress':
        statusClass = 'deploy-status-building';
        statusText = '预部署中';
        break;
      case 'pre_deploy_failed':
        statusClass = 'deploy-status-failed';
        statusText = '预部署失败';
        break;
      case 'deactivated':
        statusClass = 'deploy-status-deactivated';
        statusText = '已停用';
        break;
      default:
        statusText = deploy.status?.replace(/_/g, ' ') || '未知';
    }

    // 判断是否可以操作
    const canCancel = ['build_in_progress', 'update_in_progress', 'pre_deploy_in_progress'].includes(deploy.status);
    const canRollback = deploy.status === 'deactivated' || (deploy.status === 'live' && index > 0);
    const isCurrentLive = deploy.status === 'live';

    deployItem.innerHTML = \`
      <div class="deploy-header">
        <div class="deploy-info">
          <div class="deploy-id" title="\${escapeHtml(deploy.id)}">
            <span class="deploy-label">部署 ID:</span>
            <code>\${escapeHtml(deploy.id)}</code>
          </div>
          <div class="deploy-commit" title="\${escapeHtml(deploy.commit?.message || '')}">
            \${deploy.commit?.id ? \`<code>\${escapeHtml(deploy.commit.id.substring(0, 7))}</code>\` : ''}
            \${deploy.commit?.message ? \`<span class="commit-message">\${escapeHtml(deploy.commit.message)}</span>\` : ''}
          </div>
        </div>
        <div class="deploy-status \${statusClass}">
          \${isCurrentLive ? '<span class="live-indicator"></span>' : ''}
          \${statusText}
        </div>
      </div>
      <div class="deploy-meta">
        <span class="deploy-time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM16.2 16.2L11 13V7H12.5V12.2L17 14.9L16.2 16.2Z" fill="currentColor"/>
          </svg>
          \${deployTime}
        </span>
        \${deploy.finishedAt ? \`<span class="deploy-duration">耗时: \${formatDuration(deploy.createdAt, deploy.finishedAt)}</span>\` : ''}
      </div>
      <div class="deploy-actions">
        \${canCancel ? \`
          <button class="deploy-action-btn cancel-deploy-btn" data-action="cancel-deploy" data-deploy-id="\${escapeHtml(deploy.id)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
            取消
          </button>
        \` : ''}
        \${canRollback && !isCurrentLive ? \`
          <button class="deploy-action-btn rollback-deploy-btn" data-action="rollback-deploy" data-deploy-id="\${escapeHtml(deploy.id)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 8C9.85 8 7.45 9 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.22C21.08 11.03 17.15 8 12.5 8Z" fill="currentColor"/>
            </svg>
            回滚到此版本
          </button>
        \` : ''}
        \${isCurrentLive ? '<span class="current-live-badge">当前运行版本</span>' : ''}
      </div>
    \`;

    container.appendChild(deployItem);
  });
}

// 格式化部署耗时
function formatDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return \`\${hours}小时\${minutes % 60}分钟\`;
  } else if (minutes > 0) {
    return \`\${minutes}分钟\${seconds % 60}秒\`;
  } else {
    return \`\${seconds}秒\`;
  }
}

// 取消部署
async function cancelDeploy(deployId) {
  if (!confirm('确定要取消此部署？')) {
    return;
  }

  try {
    await apiJson(\`/api/deploys/\${currentDeployAccountId}/\${deployId}/cancel\`, {
      method: 'POST'
    });

    showNotification('部署已取消', 'success');

    // 刷新部署列表
    setTimeout(() => {
      openDeploysModal(currentDeployAccountId, currentDeployServiceId, currentDeployServiceName);
    }, 1000);
  } catch (error) {
    console.error('取消部署出错:', error);
    showNotification('取消部署出错: ' + (error?.message || String(error)), 'error');
  }
}

// 回滚部署
async function rollbackDeploy(deployId) {
  if (!confirm('确定要回滚到此部署版本？\\n\\n这将重新部署此版本的代码。')) {
    return;
  }

  try {
    await apiJson(\`/api/deploys/\${currentDeployAccountId}/\${deployId}/rollback\`, {
      method: 'POST'
    });

    showNotification('已开始回滚部署', 'success');

    // 关闭模态框并刷新服务列表
    closeDeploysModal();
    setTimeout(fetchServices, 2000);
  } catch (error) {
    console.error('回滚部署出错:', error);
    showNotification('回滚部署出错: ' + (error?.message || String(error)), 'error');
  }
}

// 关闭部署历史模态框
function closeDeploysModal() {
  unlockBodyScroll();
  const modal = document.getElementById('deploysModal');
  modal.classList.remove('show');

  currentDeployAccountId = '';
  currentDeployServiceId = '';
  currentDeployServiceName = '';
}

// 日志模态框上下文
let currentLogsAccountId = '';
let currentLogsServiceId = '';
let currentLogsServiceName = '';

// 打开日志模态框
async function openLogsModal(accountId, serviceId, serviceName) {
  lockBodyScroll();
  const modal = document.getElementById('logsModal');
  const container = document.getElementById('logsContainer');
  const serviceInfo = document.getElementById('logsModalServiceInfo');

  currentLogsAccountId = accountId;
  currentLogsServiceId = serviceId;
  currentLogsServiceName = serviceName;

  const accountName = allServices.find(s => s.id === serviceId && s.accountId === accountId)?.accountName || accountId;
  serviceInfo.replaceChildren(
    document.createTextNode('查看 '),
    (() => {
      const strong = document.createElement('strong');
      strong.textContent = serviceName;
      return strong;
    })(),
    document.createTextNode(' (' + accountName + ') 的服务日志')
  );

  container.innerHTML = '<div class="loading" style="padding: 2rem; color: white;"><div class="loading-spinner"></div><p>加载日志中...</p></div>';

  modal.classList.add('show');

  await fetchLogs();
}

// 获取日志
async function fetchLogs() {
  const container = document.getElementById('logsContainer');
  const levelFilter = document.getElementById('logLevelFilter').value;
  const limitFilter = document.getElementById('logLimitFilter').value;

  try {
    let url = \`/api/logs/\${currentLogsAccountId}/\${currentLogsServiceId}?limit=\${limitFilter}\`;
    if (levelFilter) {
      url += \`&level=\${levelFilter}\`;
    }

    const data = await apiJson(url);
    renderLogs(data);
  } catch (error) {
    console.error('获取日志出错:', error);
    container.innerHTML = \`
      <div class="empty-state" style="color: white;">
        <h3>加载日志出错</h3>
        <p>\${escapeHtml(error?.message || String(error))}</p>
      </div>
    \`;
  }
}

// 刷新日志
function refreshLogs() {
  if (currentLogsServiceId) {
    fetchLogs();
  }
}

// 渲染日志
function renderLogs(data) {
  const container = document.getElementById('logsContainer');
  const logs = data.logs || data || [];

  if (!logs || logs.length === 0) {
    container.innerHTML = \`
      <div class="empty-state" style="color: white; padding: 2rem;">
        <h3>暂无日志</h3>
        <p>此服务暂无日志记录，或所选级别没有日志。</p>
      </div>
    \`;
    return;
  }

  container.innerHTML = '';

  logs.forEach(log => {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';

    const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString('zh-CN') : '';
    const level = log.level || 'info';
    const message = log.message || log.text || JSON.stringify(log);

    let levelClass = 'log-level-info';
    switch (level.toLowerCase()) {
      case 'error':
        levelClass = 'log-level-error';
        break;
      case 'warn':
      case 'warning':
        levelClass = 'log-level-warn';
        break;
      case 'debug':
        levelClass = 'log-level-debug';
        break;
    }

    logEntry.innerHTML = \`
      <span class="log-timestamp">\${escapeHtml(timestamp)}</span>
      <span class="log-level \${levelClass}">\${escapeHtml(level.toUpperCase())}</span>
      <span class="log-message">\${escapeHtml(message)}</span>
    \`;

    container.appendChild(logEntry);
  });
}

// 关闭日志模态框
function closeLogsModal() {
  unlockBodyScroll();
  const modal = document.getElementById('logsModal');
  modal.classList.remove('show');

  currentLogsAccountId = '';
  currentLogsServiceId = '';
  currentLogsServiceName = '';
}

// 实例管理上下文
let currentInstancesAccountId = '';
let currentInstancesServiceId = '';
let currentInstancesServiceName = '';
let currentInstanceCount = 0;

// 打开实例管理模态框
async function openInstancesModal(accountId, serviceId, serviceName) {
  lockBodyScroll();
  const modal = document.getElementById('instancesModal');
  const container = document.getElementById('instancesContainer');
  const serviceInfo = document.getElementById('instancesModalServiceInfo');
  const scaleSection = document.getElementById('scaleSection');

  currentInstancesAccountId = accountId;
  currentInstancesServiceId = serviceId;
  currentInstancesServiceName = serviceName;

  const accountName = allServices.find(s => s.id === serviceId && s.accountId === accountId)?.accountName || accountId;
  serviceInfo.replaceChildren(
    document.createTextNode('管理 '),
    (() => {
      const strong = document.createElement('strong');
      strong.textContent = serviceName;
      return strong;
    })(),
    document.createTextNode(' (' + accountName + ') 的实例')
  );

  container.innerHTML = '<div class="loading" style="padding: 2rem;"><div class="loading-spinner"></div><p>加载实例信息中...</p></div>';
  scaleSection.style.display = 'none';

  modal.classList.add('show');

  try {
    const instances = await apiJson(\`/api/instances/\${accountId}/\${serviceId}\`);
    renderInstances(instances);
  } catch (error) {
    console.error('获取实例信息出错:', error);
    container.innerHTML = \`
      <div class="empty-state">
        <h3>加载实例信息出错</h3>
        <p>\${escapeHtml(error?.message || String(error))}</p>
      </div>
    \`;
  }
}

// 渲染实例列表
function renderInstances(instances) {
  const container = document.getElementById('instancesContainer');
  const scaleSection = document.getElementById('scaleSection');
  const scaleInput = document.getElementById('scaleInput');

  const instanceList = instances || [];
  currentInstanceCount = instanceList.length;
  scaleInput.value = currentInstanceCount;

  if (instanceList.length === 0) {
    container.innerHTML = \`
      <div class="empty-state">
        <h3>没有运行中的实例</h3>
        <p>此服务当前没有运行中的实例。</p>
      </div>
    \`;
    scaleSection.style.display = 'block';
    return;
  }

  container.innerHTML = '';

  instanceList.forEach((item, index) => {
    const instance = item.instance || item;
    const instanceItem = document.createElement('div');
    instanceItem.className = 'instance-item';

    let statusClass = 'instance-status-running';
    let statusText = instance.status || '运行中';

    switch (instance.status?.toLowerCase()) {
      case 'running':
        statusClass = 'instance-status-running';
        statusText = '运行中';
        break;
      case 'starting':
        statusClass = 'instance-status-starting';
        statusText = '启动中';
        break;
      case 'stopped':
        statusClass = 'instance-status-stopped';
        statusText = '已停止';
        break;
    }

    const createdAt = instance.createdAt ? new Date(instance.createdAt).toLocaleString('zh-CN') : 'N/A';

    instanceItem.innerHTML = \`
      <div class="instance-header">
        <div class="instance-id">实例 #\${index + 1} - \${escapeHtml(instance.id?.substring(0, 12) || 'N/A')}...</div>
        <div class="instance-status \${statusClass}">\${statusText}</div>
      </div>
      <div class="instance-meta">
        <span>创建时间: \${createdAt}</span>
        \${instance.region ? \`<span>区域: \${escapeHtml(instance.region)}</span>\` : ''}
      </div>
    \`;

    container.appendChild(instanceItem);
  });

  scaleSection.style.display = 'block';
}

// 调整实例数量
function adjustScale(delta) {
  const scaleInput = document.getElementById('scaleInput');
  let value = parseInt(scaleInput.value, 10) || 0;
  value = Math.max(0, Math.min(10, value + delta));
  scaleInput.value = value;
}

// 应用扩缩容
async function applyScale() {
  const scaleInput = document.getElementById('scaleInput');
  const numInstances = parseInt(scaleInput.value, 10);

  if (isNaN(numInstances) || numInstances < 0) {
    showNotification('请输入有效的实例数量', 'error');
    return;
  }

  if (numInstances === currentInstanceCount) {
    showNotification('实例数量未改变', 'error');
    return;
  }

  if (!confirm(\`确定要将实例数量从 \${currentInstanceCount} 调整为 \${numInstances}？\`)) {
    return;
  }

  try {
    await apiJson(\`/api/services/\${currentInstancesAccountId}/\${currentInstancesServiceId}/scale\`, {
      method: 'POST',
      body: { numInstances }
    });

    showNotification(\`服务已扩缩容至 \${numInstances} 个实例\`, 'success');

    // 刷新实例列表
    setTimeout(() => {
      openInstancesModal(currentInstancesAccountId, currentInstancesServiceId, currentInstancesServiceName);
    }, 2000);
  } catch (error) {
    console.error('扩缩容出错:', error);
    showNotification('扩缩容出错: ' + (error?.message || String(error)), 'error');
  }
}

// 关闭实例管理模态框
function closeInstancesModal() {
  unlockBodyScroll();
  const modal = document.getElementById('instancesModal');
  modal.classList.remove('show');

  currentInstancesAccountId = '';
  currentInstancesServiceId = '';
  currentInstancesServiceName = '';
  currentInstanceCount = 0;
}

// 打开事件日志模态框
async function openEventsModal(accountId, serviceId, serviceName) {
  lockBodyScroll();
  const modal = document.getElementById('eventsModal');
  const container = document.getElementById('eventsContainer');
  const serviceInfo = document.getElementById('eventsModalServiceInfo');

  const accountName = allServices.find(s => s.id === serviceId && s.accountId === accountId)?.accountName || accountId;
  serviceInfo.replaceChildren(
    document.createTextNode('查看 '),
    (() => {
      const strong = document.createElement('strong');
      strong.textContent = serviceName;
      return strong;
    })(),
    document.createTextNode(' (' + accountName + ') 的最近事件')
  );

  container.innerHTML = '<div class="loading" style="padding: 2rem;"><div class="loading-spinner"></div><p>加载事件日志中...</p></div>';

  modal.classList.add('show');

  try {
    const events = await apiJson(\`/api/events/\${accountId}/\${serviceId}\`);
    renderEvents(events);
  } catch (error) {
    console.error('获取事件日志出错:', error);
    container.innerHTML = \`
      <div class="empty-state">
        <h3>加载事件日志出错</h3>
        <p>\${escapeHtml(error?.message || String(error))}</p>
      </div>
    \`;
  }
}

// 渲染事件日志
function renderEvents(events) {
  const container = document.getElementById('eventsContainer');

  if (!events || !Array.isArray(events) || events.length === 0) {
    container.innerHTML = \`
      <div class="empty-state">
        <h3>没有事件日志</h3>
        <p>此服务暂无事件记录。</p>
      </div>
    \`;
    return;
  }

  container.innerHTML = '';

  events.forEach(item => {
    const event = item.event;
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';

    const eventTime = new Date(event.timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const rawEventType = typeof event.type === 'string' ? event.type : '';
    let eventTypeText = escapeHtml(rawEventType.replace(/_/g, ' ').toUpperCase());
    let eventTypeBadgeClass = 'event-type-deploy';
    let statusHtml = '';

    if (rawEventType.includes('deploy')) {
      eventTypeBadgeClass = 'event-type-deploy';

      if (event.details && event.details.deployStatus) {
        const status = event.details.deployStatus;
        let statusClass = 'event-status-started';
        let statusText = status.toUpperCase();

        if (status === 'succeeded') {
          statusClass = 'event-status-succeeded';
          statusText = '成功';
        } else if (status === 'failed') {
          statusClass = 'event-status-failed';
          statusText = '失败';
        } else if (status === 'started') {
          statusClass = 'event-status-started';
          statusText = '开始';
        }

        statusHtml = \`<div class="event-status \${statusClass}">\${statusText}</div>\`;
      }
    } else if (rawEventType.includes('build')) {
      eventTypeBadgeClass = 'event-type-build';
    } else if (rawEventType.includes('error') || rawEventType.includes('fail')) {
      eventTypeBadgeClass = 'event-type-error';
    }

    eventItem.innerHTML = \`
      <div class="event-header">
        <div class="event-type">
          <span class="event-type-badge \${eventTypeBadgeClass}">\${eventTypeText}</span>
          \${statusHtml}
        </div>
        <div class="event-time">\${eventTime}</div>
      </div>
      <div class="event-details">
        <div>事件ID: \${escapeHtml(event.id)}</div>
        \${event.details && event.details.deployId ? \`<div>部署ID: \${escapeHtml(event.details.deployId)}</div>\` : ''}
      </div>
    \`;

    container.appendChild(eventItem);
  });
}

// 关闭事件日志模态框
function closeEventsModal() {
  unlockBodyScroll();
  const modal = document.getElementById('eventsModal');
  modal.classList.remove('show');
}

// 打开环境变量模态框
async function openEnvVarsModal(accountId, serviceId, serviceName) {
  lockBodyScroll();
  currentServiceId = serviceId;
  currentServiceName = serviceName;
  currentAccountId = accountId;

  const modal = document.getElementById('envVarsModal');
  const container = document.getElementById('envVarsContainer');
  const serviceInfo = document.getElementById('modalServiceInfo');

  const accountName = allServices.find(s => s.id === serviceId && s.accountId === accountId)?.accountName || accountId;
  serviceInfo.replaceChildren(
    document.createTextNode('管理 '),
    (() => {
      const strong = document.createElement('strong');
      strong.textContent = serviceName;
      return strong;
    })(),
    document.createTextNode(' (' + accountName + ') 的变量')
  );

  container.innerHTML = '<div class="loading" style="padding: 2rem;"><div class="loading-spinner"></div><p>加载环境变量中...</p></div>';
  resetAddForm();

  modal.classList.add('show');

  try {
    const envVars = await apiJson(\`/api/env-vars/\${currentAccountId}/\${currentServiceId}\`);
    allEnvVars = envVars;
    renderEnvVars(envVars);
  } catch (error) {
    console.error('获取环境变量出错:', error);
    container.innerHTML = \`
      <div class="empty-state">
        <h3>加载变量出错</h3>
        <p>\${escapeHtml(error?.message || String(error))}</p>
      </div>
    \`;
  }
}

// 渲染环境变量
function renderEnvVars(envVars) {
  const container = document.getElementById('envVarsContainer');

  if (envVars.length === 0) {
    container.innerHTML = \`
      <div class="empty-state">
        <h3>没有环境变量</h3>
        <p>此服务尚未设置任何环境变量。<br>点击"添加变量"创建您的第一个环境变量。</p>
      </div>
    \`;
    return;
  }

  container.innerHTML = '';

  envVars.forEach(item => {
    const envVar = item.envVar;
    const envVarItem = document.createElement('div');
    envVarItem.className = 'env-var-item';
    envVarItem.dataset.key = envVar.key;

    envVarItem.innerHTML = \`
      <div class="env-var-grid">
        <div class="env-var-key">\${escapeHtml(envVar.key)}</div>
        <div class="env-var-value-wrapper">
          <div class="env-var-value masked" data-role="value" data-action="start-inline-edit" title="点击编辑">••••••••••••••••</div>
          <button class="visibility-toggle" data-action="toggle-visibility" title="切换可见性">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="inline-editor" data-role="editor">
            <textarea class="inline-editor-input" data-role="input">\${escapeHtml(envVar.value)}</textarea>
            <div class="inline-editor-actions">
              <button class="inline-editor-btn cancel-edit-btn" data-action="cancel-inline-edit">取消</button>
              <button class="inline-editor-btn save-edit-btn" data-action="save-inline-edit">保存</button>
            </div>
          </div>
        </div>
        <div class="env-var-actions">
          <button class="env-var-btn copy-btn" data-action="copy-value" title="复制值">复制</button>
          <button class="env-var-btn delete-btn" data-action="delete-env-var">删除</button>
        </div>
      </div>
    \`;

    container.appendChild(envVarItem);
  });
}

// 切换值的可见性
function toggleValueVisibility(key) {
  const item = document.querySelector('.env-var-item[data-key="' + CSS.escape(key) + '"]');
  if (!item) return;

  const valueElement = item.querySelector('[data-role="value"]');
  const toggleBtn = item.querySelector('.visibility-toggle');
  if (!valueElement) return;

  const isCurrentlyMasked = valueElement.classList.contains('masked');

  if (isCurrentlyMasked) {
    const envVar = allEnvVars.find(item => item.envVar.key === key);
    if (envVar) {
      valueElement.textContent = envVar.envVar.value;
      valueElement.classList.remove('masked');
      toggleBtn?.classList.add('visible');
    }
  } else {
    valueElement.textContent = '••••••••••••••••';
    valueElement.classList.add('masked');
    toggleBtn?.classList.remove('visible');
  }
}

// 开始内联编辑
function startInlineEdit(key) {
  if (editingKey && editingKey !== key) {
    cancelInlineEdit(editingKey);
  }

  editingKey = key;
  const item = document.querySelector('.env-var-item[data-key="' + CSS.escape(key) + '"]');
  if (!item) return;

  const valueWrapper = item.querySelector('.env-var-value-wrapper');
  const valueDiv = item.querySelector('[data-role="value"]');
  const editor = item.querySelector('[data-role="editor"]');
  const input = item.querySelector('[data-role="input"]');
  const visibilityToggle = valueWrapper?.querySelector('.visibility-toggle');

  if (!valueWrapper || !valueDiv || !editor || !input || !visibilityToggle) return;

  item.classList.add('editing');

  valueDiv.style.display = 'none';
  visibilityToggle.style.display = 'none';
  editor.classList.add('active');

  input.focus();
  input.select();

  autoResizeTextarea(input);
}

// 取消内联编辑
function cancelInlineEdit(key) {
  editingKey = null;
  const item = document.querySelector('.env-var-item[data-key="' + CSS.escape(key) + '"]');
  if (!item) return;

  const valueWrapper = item.querySelector('.env-var-value-wrapper');
  const valueDiv = item.querySelector('[data-role="value"]');
  const editor = item.querySelector('[data-role="editor"]');
  const input = item.querySelector('[data-role="input"]');
  const visibilityToggle = valueWrapper?.querySelector('.visibility-toggle');

  if (!valueWrapper || !valueDiv || !editor || !input || !visibilityToggle) return;

  item.classList.remove('editing');

  const originalValue = allEnvVars.find(item => item.envVar.key === key)?.envVar.value || '';
  input.value = originalValue;

  valueDiv.style.display = 'block';
  visibilityToggle.style.display = 'flex';
  editor.classList.remove('active');

  if (valueDiv.classList.contains('masked')) {
    valueDiv.textContent = '••••••••••••••••';
  }
}

// 保存内联编辑
async function saveInlineEdit(key) {
  const item = document.querySelector('.env-var-item[data-key="' + CSS.escape(key) + '"]');
  const input = item?.querySelector('[data-role="input"]');
  const newValue = input?.value.trim();

  if (newValue === '') {
    showNotification('值不能为空。', 'error');
    return;
  }

  const originalValue = allEnvVars.find(item => item.envVar.key === key)?.envVar.value || '';
  if (newValue === originalValue) {
    cancelInlineEdit(key);
    return;
  }

  try {
    await apiJson(\`/api/env-vars/\${currentAccountId}/\${currentServiceId}/\${encodeURIComponent(key)}\`, {
      method: 'PUT',
      body: {
        value: newValue
      }
    });

    const envVarIndex = allEnvVars.findIndex(item => item.envVar.key === key);
    if (envVarIndex !== -1) {
      allEnvVars[envVarIndex].envVar.value = newValue;
    }

    const item = document.querySelector('.env-var-item[data-key="' + CSS.escape(key) + '"]');
    const valueDiv = item?.querySelector('[data-role="value"]');
    if (valueDiv) {
      valueDiv.textContent = '••••••••••••••••';
      valueDiv.classList.add('masked');
    }

    cancelInlineEdit(key);

    showNotification(\`环境变量 '\${key}' 更新成功。\`, 'success');

  } catch (error) {
    console.error('更新环境变量出错:', error);
    showNotification('更新环境变量出错: ' + (error?.message || String(error)), 'error');
  }
}

// 删除环境变量
async function deleteEnvVar(key) {
  if (!confirm(\`确定要删除环境变量 '\${key}'?\\n\\n此操作无法撤销。\`)) {
    return;
  }

  try {
    await apiJson(\`/api/env-vars/\${currentAccountId}/\${currentServiceId}/\${encodeURIComponent(key)}\`, {
      method: 'DELETE',
      contentType: null
    });

    allEnvVars = allEnvVars.filter(item => item.envVar.key !== key);
    renderEnvVars(allEnvVars);

    showNotification(\`环境变量 '\${key}' 删除成功。\`, 'success');

  } catch (error) {
    console.error('删除环境变量出错:', error);
    showNotification('删除环境变量出错: ' + (error?.message || String(error)), 'error');
  }
}

// 复制值到剪贴板
async function copyValue(key) {
  const envVar = allEnvVars.find(item => item.envVar.key === key);
  if (!envVar) return;

  const value = envVar.envVar.value;

  try {
    await navigator.clipboard.writeText(value);
    showNotification(\`已复制 \${key} 的值到剪贴板\`, 'success');
  } catch (err) {
    console.error('复制失败: ', err);
    const textArea = document.createElement('textarea');
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification(\`已复制 \${key} 的值到剪贴板\`, 'success');
  }
}

// 切换添加表单可见性
function toggleAddForm() {
  const form = document.getElementById('addEnvVarForm');
  const toggleText = document.getElementById('toggleFormText');

  isFormVisible = !isFormVisible;

  if (isFormVisible) {
    form.classList.add('show');
    toggleText.textContent = '取消';
    setTimeout(() => {
      document.getElementById('newEnvVarKey').focus();
    }, 300);
  } else {
    form.classList.remove('show');
    toggleText.textContent = '添加变量';
    resetAddForm();
  }
}

// 重置添加表单
function resetAddForm() {
  document.getElementById('newEnvVarKey').value = '';
  document.getElementById('newEnvVarValue').value = '';
  isFormVisible = false;
  const form = document.getElementById('addEnvVarForm');
  const toggleText = document.getElementById('toggleFormText');
  form.classList.remove('show');
  toggleText.textContent = '添加变量';
}


// 处理编辑器中的键盘快捷键
function handleEditorKeyDown(event, key) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    saveInlineEdit(key);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelInlineEdit(key);
  }

  setTimeout(() => autoResizeTextarea(event.target), 0);
}

function getServiceActionPayloadFromButton(button) {
  if (!button) return null;

  const accountId = button.dataset.accountId;
  const serviceId = button.dataset.serviceId;
  const serviceName = button.dataset.serviceName;
  const action = button.dataset.action;

  if (!accountId || !serviceId || !serviceName || !action) return null;
  return { accountId, serviceId, serviceName, action };
}

function getEnvVarKeyFromEventTarget(target) {
  const envVarItem = target?.closest?.('.env-var-item');
  const key = envVarItem?.dataset?.key;
  return key || null;
}

function initEventDelegation() {
  const servicesContainer = document.getElementById('services-container');
  servicesContainer?.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    const payload = getServiceActionPayloadFromButton(button);
    if (!payload) return;

    switch (payload.action) {
      case 'deploy':
        await deployService(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'resume':
        await resumeService(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'suspend':
        await suspendService(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'restart':
        await restartService(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'env':
        await openEnvVarsModal(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'deploys':
        await openDeploysModal(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'logs':
        await openLogsModal(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'instances':
        await openInstancesModal(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      case 'events':
        await openEventsModal(payload.accountId, payload.serviceId, payload.serviceName);
        break;
      default:
        break;
    }
  });

  const envVarsModal = document.getElementById('envVarsModal');
  envVarsModal?.addEventListener('click', async (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;

    if (action === 'cancel-deploy' || action === 'rollback-deploy') {
      const deployId = actionElement.dataset.deployId;
      if (!deployId) return;

      if (action === 'cancel-deploy') {
        await cancelDeploy(deployId);
      } else {
        await rollbackDeploy(deployId);
      }
      return;
    }

    if (action === 'toggle-add-form') {
      toggleAddForm();
      return;
    }

    if (action === 'add-env-var') {
      await addEnvVar();
      return;
    }

    const key = getEnvVarKeyFromEventTarget(actionElement);
    if (!key) return;

    switch (action) {
      case 'toggle-visibility':
        toggleValueVisibility(key);
        break;
      case 'start-inline-edit':
        startInlineEdit(key);
        break;
      case 'cancel-inline-edit':
        cancelInlineEdit(key);
        break;
      case 'save-inline-edit':
        await saveInlineEdit(key);
        break;
      case 'copy-value':
        await copyValue(key);
        break;
      case 'delete-env-var':
        await deleteEnvVar(key);
        break;
      default:
        break;
    }
  });

  envVarsModal?.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    if (target.dataset.role !== 'input') return;

    const key = getEnvVarKeyFromEventTarget(target);
    if (!key) return;

    handleEditorKeyDown(event, key);
  });

  const closeHandlers = {
    'close-env-vars-modal': closeEnvVarsModal,
    'close-events-modal': closeEventsModal,
    'close-deploys-modal': closeDeploysModal,
    'close-logs-modal': closeLogsModal,
    'close-instances-modal': closeInstancesModal,
  };

  document.addEventListener('click', async (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;

    if (action === 'refresh-logs') {
      refreshLogs();
      return;
    }

    if (action === 'adjust-scale') {
      const delta = parseInt(actionElement.dataset.delta || '0', 10);
      adjustScale(delta);
      return;
    }

    if (action === 'apply-scale') {
      await applyScale();
      return;
    }

    const closeHandler = closeHandlers[action];
    if (closeHandler) {
      closeHandler();
    }
  });

  const accountFilter = document.getElementById('accountFilter');
  accountFilter?.addEventListener('change', () => {
    applyFilters();
  });

  const searchInput = document.getElementById('serviceSearch');
  searchInput?.addEventListener('input', () => {
    applyFilters();
  });

  const logLevelFilter = document.getElementById('logLevelFilter');
  logLevelFilter?.addEventListener('change', () => {
    refreshLogs();
  });

  const logLimitFilter = document.getElementById('logLimitFilter');
  logLimitFilter?.addEventListener('change', () => {
    refreshLogs();
  });

  const envVarKeyInput = document.getElementById('newEnvVarKey');
  const envVarValueInput = document.getElementById('newEnvVarValue');

  function handleEnvVarFormKeydown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      addEnvVar();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      toggleAddForm();
    }
  }

  envVarKeyInput?.addEventListener('keydown', handleEnvVarFormKeydown);
  envVarValueInput?.addEventListener('keydown', handleEnvVarFormKeydown);
}

// 自动调整文本区域大小
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.max(38, textarea.scrollHeight) + 'px';
}

// 添加环境变量
async function addEnvVar() {
  const key = document.getElementById('newEnvVarKey').value.trim();
  const value = document.getElementById('newEnvVarValue').value.trim();

  if (!key || !value) {
    showNotification('请输入环境变量的键和值。', 'error');
    return;
  }

  const existingVar = allEnvVars.find(item => item.envVar.key === key);
  if (existingVar) {
    if (!confirm(\`环境变量 '\${key}' 已存在。是否要更新它？\`)) {
      return;
    }
  }

  try {
    const result = await apiJson(\`/api/env-vars/\${currentAccountId}/\${currentServiceId}/\${encodeURIComponent(key)}\`, {
      method: 'PUT',
      body: {
        value: value
      }
    });

    // 直接使用返回结果更新本地数据，避免重复请求
    // API 返回格式是 { key, value }，需要包装成 { envVar: { key, value } }
    const wrappedResult = { envVar: result };
    if (existingVar) {
      // 更新已存在的变量
      const envVarIndex = allEnvVars.findIndex(item => item.envVar.key === key);
      if (envVarIndex !== -1) {
        allEnvVars[envVarIndex] = wrappedResult;
      }
    } else {
      // 添加新变量
      allEnvVars.push(wrappedResult);
    }
    renderEnvVars(allEnvVars);

    resetAddForm();

    showNotification(\`环境变量 '\${key}' \${existingVar ? '更新' : '添加'}成功。\`, 'success');

  } catch (error) {
    console.error('添加环境变量出错:', error);
    showNotification('添加环境变量出错: ' + (error?.message || String(error)), 'error');
  }
}

// 关闭环境变量模态框
function closeEnvVarsModal() {
  unlockBodyScroll();
  if (editingKey) {
    cancelInlineEdit(editingKey);
  }

  const modal = document.getElementById('envVarsModal');
  modal.classList.remove('show');

  resetAddForm();

  currentServiceId = '';
  currentAccountId = '';
  currentServiceName = '';
  allEnvVars = [];
}


// 处理Escape键
document.addEventListener('keydown', function(event) {
  if (event.key !== 'Escape') return;

  const envVarsModal = document.getElementById('envVarsModal');
  const eventsModal = document.getElementById('eventsModal');
  const deploysModal = document.getElementById('deploysModal');
  const logsModal = document.getElementById('logsModal');
  const instancesModal = document.getElementById('instancesModal');

  if (envVarsModal.classList.contains('show')) {
    if (editingKey) {
      cancelInlineEdit(editingKey);
    } else {
      closeEnvVarsModal();
    }
  } else if (eventsModal.classList.contains('show')) {
    closeEventsModal();
  } else if (deploysModal.classList.contains('show')) {
    closeDeploysModal();
  } else if (logsModal.classList.contains('show')) {
    closeLogsModal();
  } else if (instancesModal.classList.contains('show')) {
    closeInstancesModal();
  }
});

// 点击 modal 遮罩关闭（避免依赖 inline onclick）
document.addEventListener('click', function(event) {
  const envVarsModal = document.getElementById('envVarsModal');
  const eventsModal = document.getElementById('eventsModal');
  const deploysModal = document.getElementById('deploysModal');
  const logsModal = document.getElementById('logsModal');
  const instancesModal = document.getElementById('instancesModal');

  if (event.target === envVarsModal) {
    closeEnvVarsModal();
  } else if (event.target === eventsModal) {
    closeEventsModal();
  } else if (event.target === deploysModal) {
    closeDeploysModal();
  } else if (event.target === logsModal) {
    closeLogsModal();
  } else if (event.target === instancesModal) {
    closeInstancesModal();
  }
});

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
  initEventDelegation();
  fetchServices();

  // 刷新按钮事件
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchServices(true);
    });
  }
});
`;
