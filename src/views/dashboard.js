import { htmlResponse } from '../utils/response.js';
import { dashboardStyles } from './styles.js';
import { sharedScript } from './sharedScript.js';
import { dashboardScript } from './dashboardScript.js';

/**
 * 渲染仪表盘页面
 * @returns {Response} - HTML响应
 */
export function renderDashboard() {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Render Service Management</title>
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
        <a href="/accounts" class="header-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
          账户管理
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3 id="totalServices">0</h3>
              <p>服务数</p>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3 id="liveServices">0</h3>
              <p>运行中</p>
            </div>
          </div>
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
        <div class="filters">
          <div class="cache-info-wrapper">
            <span id="cacheInfo" class="cache-info"></span>
            <button type="button" id="refreshBtn" class="refresh-services-btn" title="刷新数据">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>
          <div class="filter-box">
            <select id="accountFilter" class="account-filter-select">
              <option value="">全部账户</option>
            </select>
          </div>
          <div class="search-box">
            <input
              type="text"
              id="serviceSearch"
              class="search-input"
              placeholder="搜索服务..."
            >
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div id="loading" class="loading">
        <div class="spinner"></div>
        <p>加载服务中...</p>
      </div>

      <div id="services-container" class="services-grid" style="display: none;">
        <!-- 服务将在这里动态加载 -->
      </div>
    </div>
  </div>

  <footer class="footer">
    <p>© 2025 Render Service Manager | <a href="https://github.com/ssfun/render-service-manager" target="_blank" rel="noopener noreferrer">@sfun</a></p>
  </footer>

  <!-- 环境变量模态框 -->
  <div id="envVarsModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <div class="modal-title-section">
            <h2 class="modal-title">环境变量</h2>
            <button class="modal-close" data-action="close-env-vars-modal" type="button">×</button>
          </div>
          <div class="modal-service-info" id="modalServiceInfo">
            <!-- 服务信息将在这里插入 -->
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div id="envVarsContainer" class="env-var-list">
          <!-- 环境变量将在这里加载 -->
        </div>

        <!-- 添加新环境变量部分 -->
        <div class="add-env-var-section">
          <div class="add-env-var-header">
            <h3>添加新变量</h3>
            <button class="add-env-btn" data-action="toggle-add-form" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span id="toggleFormText">添加</span>
            </button>
          </div>
          <div class="add-env-var-form" id="addEnvVarForm">
            <div class="add-env-var-inputs">
              <div class="add-env-var-field">
                <label class="add-env-var-label">键</label>
                <input
                  type="text"
                  id="newEnvVarKey"
                  class="add-env-var-input"
                  placeholder="VARIABLE_NAME"
                >
              </div>
              <div class="add-env-var-field add-env-var-field-value">
                <label class="add-env-var-label">值</label>
                <input
                  type="text"
                  id="newEnvVarValue"
                  class="add-env-var-input"
                  placeholder="variable_value"
                >
              </div>
            </div>
            <div class="add-env-var-actions">
              <button class="form-btn secondary" data-action="toggle-add-form" type="button">取消</button>
              <button class="form-btn primary" data-action="add-env-var" type="button">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 事件日志模态框 -->
  <div id="eventsModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <div class="modal-title-section">
            <h2 class="modal-title">事件日志</h2>
            <button class="modal-close" data-action="close-events-modal" type="button">×</button>
          </div>
          <div class="modal-service-info" id="eventsModalServiceInfo">
            <!-- 服务信息将在这里插入 -->
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div id="eventsContainer" class="events-list">
          <!-- 事件日志将在这里加载 -->
        </div>
      </div>
    </div>
  </div>

  <!-- 部署历史模态框 -->
  <div id="deploysModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <div class="modal-title-section">
            <h2 class="modal-title">部署历史</h2>
            <button class="modal-close" data-action="close-deploys-modal" type="button">×</button>
          </div>
          <div class="modal-service-info" id="deploysModalServiceInfo">
            <!-- 服务信息将在这里插入 -->
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div id="deploysContainer" class="deploys-list">
          <!-- 部署历史将在这里加载 -->
        </div>
      </div>
    </div>
  </div>

  <!-- 日志查看模态框 -->
  <div id="logsModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <div class="modal-title-section">
            <h2 class="modal-title">服务日志</h2>
            <button class="modal-close" data-action="close-logs-modal" type="button">×</button>
          </div>
          <div class="modal-service-info" id="logsModalServiceInfo">
            <!-- 服务信息将在这里插入 -->
          </div>
        </div>
      </div>
      <div class="logs-toolbar">
        <div class="logs-filters">
          <div class="filter-group">
            <label class="filter-label">级别</label>
            <select id="logLevelFilter" class="filter-select">
              <option value="">全部</option>
              <option value="error">错误</option>
              <option value="warn">警告</option>
              <option value="info">信息</option>
              <option value="debug">调试</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">数量</label>
            <select id="logLimitFilter" class="filter-select">
              <option value="20" selected>20 条</option>
              <option value="50">50 条</option>
              <option value="100">100 条</option>
              <option value="200">200 条</option>
            </select>
          </div>
        </div>
        <button class="refresh-btn" data-action="refresh-logs" type="button" title="刷新日志">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div class="modal-body logs-body">
        <div id="logsContainer" class="logs-container">
          <!-- 日志将在这里加载 -->
        </div>
      </div>
    </div>
  </div>

  <!-- 实例管理模态框 -->
  <div id="instancesModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <div class="modal-title-section">
            <h2 class="modal-title">实例管理</h2>
            <button class="modal-close" data-action="close-instances-modal" type="button">×</button>
          </div>
          <div class="modal-service-info" id="instancesModalServiceInfo">
            <!-- 服务信息将在这里插入 -->
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div id="instancesContainer" class="instances-container">
          <!-- 实例信息将在这里加载 -->
        </div>
        <div class="scale-section" id="scaleSection" style="display: none;">
          <h3>扩缩容</h3>
          <div class="scale-controls">
            <button class="scale-btn" data-action="adjust-scale" data-delta="-1" type="button">-</button>
            <input type="number" id="scaleInput" min="0" max="10" value="1" class="scale-input">
            <button class="scale-btn" data-action="adjust-scale" data-delta="1" type="button">+</button>
            <button class="action-btn primary" data-action="apply-scale" type="button">应用</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script nonce="__CSP_NONCE__">${sharedScript}\n${dashboardScript}</script>
</body>
</html>
  `;

  return htmlResponse(html);
}
