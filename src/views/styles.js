/**
 * 登录页面样式
 */
export const loginStyles = `
:root {
  /* 背景色 - 温暖纸质色调 */
  --bg-paper: #FCFAF8;
  --bg-surface: #FDFDFC;
  --bg-secondary: #F4F1EB;
  --bg-warm: #F5F2EB;

  /* 文字色 - 柔和对比 */
  --text-primary: #2D2D2D;
  --text-secondary: #6B6B6B;
  --text-muted: #9A9A9A;

  /* 强调色 */
  --accent-terracotta: #D97757;
  --accent-dark: #3D3D3D;
  --accent-success: #5C8A5C;
  --accent-warning: #C4915C;
  --accent-danger: #C45C5C;

  /* 边框色 */
  --border-light: #E8E4DE;
  --border-medium: #D4CFC6;

  /* 字体 */
  --font-serif: "Merriweather", "Georgia", "Times New Roman", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", Monaco, "Consolas", monospace;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* 阴影 - 柔和 */
  --shadow-sm: 0 1px 3px rgba(45, 45, 45, 0.04);
  --shadow-md: 0 4px 12px rgba(45, 45, 45, 0.06);
  --shadow-lg: 0 8px 24px rgba(45, 45, 45, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background: var(--bg-warm);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: var(--text-primary);
  line-height: 1.6;
}

.login-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 48px;
  width: 100%;
  max-width: 420px;
  transition: all 0.3s ease;
}

.login-container:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(45, 45, 45, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: var(--accent-dark);
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon svg {
  width: 28px;
  height: 28px;
  fill: white;
}

h1 {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 15px;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 400;
  transition: all 0.2s ease;
  background-color: var(--bg-surface);
  color: var(--text-primary);
}

input:focus {
  outline: none;
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

input::placeholder {
  color: var(--text-muted);
}

button {
  width: 100%;
  padding: 14px 20px;
  background: var(--accent-dark);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

button:hover {
  background: var(--text-primary);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.error-message {
  color: var(--accent-danger);
  background-color: #FDF5F5;
  border: 1px solid var(--accent-danger);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.footer {
  text-align: center;
  margin-top: 32px;
  color: var(--text-secondary);
  font-size: 13px;
}

.footer a {
  color: var(--accent-terracotta);
  text-decoration: none;
  font-weight: 500;
}

.footer a:hover {
  text-decoration: underline;
}
`;

/**
 * 仪表盘页面样式
 */
export const dashboardStyles = `
:root {
  /* 背景色 - 温暖纸质色调 */
  --bg-paper: #FCFAF8;
  --bg-surface: #FDFDFC;
  --bg-secondary: #F4F1EB;
  --bg-warm: #F5F2EB;

  /* 文字色 - 柔和对比 */
  --text-primary: #2D2D2D;
  --text-secondary: #6B6B6B;
  --text-muted: #9A9A9A;

  /* 强调色 */
  --accent-terracotta: #D97757;
  --accent-dark: #3D3D3D;
  --accent-success: #5C8A5C;
  --accent-warning: #C4915C;
  --accent-danger: #C45C5C;

  /* 边框色 */
  --border-light: #E8E4DE;
  --border-medium: #D4CFC6;

  /* 字体 */
  --font-serif: "Merriweather", "Georgia", "Times New Roman", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", Monaco, "Consolas", monospace;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* 阴影 - 柔和 */
  --shadow-sm: 0 1px 3px rgba(45, 45, 45, 0.04);
  --shadow-md: 0 4px 12px rgba(45, 45, 45, 0.06);
  --shadow-lg: 0 8px 24px rgba(45, 45, 45, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 账户管理页面专属样式 */
.account-card .service-card-header {
  padding: 1.25rem 1.5rem 1rem;
}

.account-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-success);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.account-owner-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-paper);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 1.25rem;
  border: 1px solid var(--border-light);
}

.account-owner-badge svg {
  opacity: 0.9;
}

.account-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.account-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.account-info-item.full-width {
  grid-column: 1 / -1;
}

.account-info-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-info-value {
  font-size: 13px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 500;
}

.account-info-value.id-value {
  color: var(--accent-terracotta);
  background: #FDF5F3;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-size: 12px;
}

.api-key-preview {
  background: #FDF8F3;
  color: var(--accent-warning);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-size: 12px;
}

.action-btn.danger {
  background: var(--accent-danger);
  color: white;
  border: none;
}

.action-btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 92, 92, 0.25);
}

/* 账户卡片按钮布局 - 只有编辑和删除两个按钮 */
.account-card .service-actions {
  grid-template-columns: repeat(2, 1fr);
}

/* 账户卡片编辑按钮样式 */
.account-card .action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.account-card .action-btn.secondary:hover:not(:disabled) {
  background: var(--border-light);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

/* 模态框表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.form-input.api-key-input {
  font-family: var(--font-mono);
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.test-btn-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.test-btn-row .form-input {
  flex: 1;
}

#testResult {
  margin-top: 1rem;
}

.test-success, .test-error, .test-loading {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-md);
}

.test-success {
  background: #F5FAF5;
  border: 1px solid var(--accent-success);
}

.test-error {
  background: #FDF5F5;
  border: 1px solid var(--accent-danger);
  color: var(--accent-danger);
}

.test-loading {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.test-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.test-title {
  font-weight: 600;
  color: var(--accent-success);
}

.test-detail {
  font-size: 13px;
  color: var(--text-primary);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .account-card .service-card-header {
    padding: 1rem;
  }

  .account-owner-badge {
    padding: 0.625rem 0.875rem;
    font-size: 13px;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
  }

  .account-info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.875rem;
    margin-bottom: 1rem;
  }

  .account-info-label {
    font-size: 10px;
  }

  .account-info-value {
    font-size: 12px;
  }

  .account-info-value.id-value {
    font-size: 11px;
    padding: 3px 6px;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input {
    padding: 10px 14px;
    font-size: 14px;
  }

  .form-hint {
    font-size: 11px;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-actions .action-btn {
    width: 100%;
    justify-content: center;
  }

  .test-btn-row {
    flex-direction: column;
  }

  .test-success, .test-error, .test-loading {
    padding: 0.875rem;
    font-size: 13px;
  }
}

body {
  font-family: var(--font-sans);
  background: var(--bg-paper);
  color: var(--text-primary);
  line-height: 1.7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  background: rgba(252, 250, 248, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text-primary);
  height: 60px;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.logo:hover {
  text-decoration: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--accent-dark);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  stroke: currentColor;
}

h1 {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 头部按钮统一样式 */
.header-link,
.logout-btn {
  height: 34px;
  padding: 0 14px;
  background: var(--bg-paper);
  color: var(--text-primary);
  border: var(--bg-paper);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  line-height: 1;
}

.header-link:hover,
.logout-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.logout-form {
  display: flex;
  margin: 0;
}

/* 主容器 */
.main-content {
  flex: 1;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-state h3 {
  font-family: var(--font-serif);
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 14px;
  line-height: 1.6;
}



/* 通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-surface);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  z-index: 1001;
  animation: slideInRight 0.3s ease-out;
}

.notification.success {
  border-left: 3px solid var(--accent-success);
}

.notification.error {
  border-left: 3px solid var(--accent-danger);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-icon {
  width: 20px;
  height: 20px;
}

.notification-text {
  font-size: 14px;
  color: var(--text-primary);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 添加账户按钮 */
.add-account-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-terracotta);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-account-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 统计栏 */
.stats-bar {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 3rem;
  flex: 1;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-terracotta);
}

.stat-info h3 {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.stat-info p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  min-width: 0;
}

.cache-info-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cache-info {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.refresh-services-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.refresh-services-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-dark);
  color: var(--accent-dark);
}

.refresh-services-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-services-btn.spinning svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filters .search-box {
  width: 220px;
  max-width: 100%;
  min-width: 0;
}

.filter-box {
  width: 160px;
  max-width: 100%;
  min-width: 0;
}

.account-filter-select {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.2s ease;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.account-filter-select:focus {
  outline: none;
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.search-box {
  position: relative;
  width: 220px;
  max-width: 100%;
  min-width: 0;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.2s ease;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

/* 添加环境变量部分 */
.add-env-var-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.add-env-var-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-env-var-header h3 {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 添加环境变量表单 */
.add-env-var-form {
  display: none;
}

.add-env-var-form.show {
  display: block !important;
}

.add-env-var-inputs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-env-var-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 0 0 200px;
}

.add-env-var-field-value {
  flex: 1;
}

.add-env-var-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-env-var-input {
  padding: 10px 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-mono);
  transition: all 0.2s ease;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.add-env-var-input:focus {
  outline: none;
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.add-env-var-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* 添加环境变量按钮 */
.add-env-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 8px 14px;
  background: var(--accent-dark);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-env-btn:hover {
  opacity: 0.9;
}

.add-env-btn:active {
  transform: translateY(0);
}

/* 表单按钮 */
.form-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-btn.primary {
  background: var(--accent-dark);
  color: white;
}

.form-btn.primary:hover {
  opacity: 0.9;
}

.form-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.form-btn.secondary:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

/* 服务网格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.service-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-medium);
}

/* 服务卡片头部 */
.service-card-header {
  padding: 1.25rem 1.5rem;
  background: var(--bg-paper);
  border-bottom: 1px solid var(--border-light);
}

.service-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.service-name {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}

.service-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* 服务类型徽章 - 次要样式 */
.service-type {
  padding: 4px 10px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 账户徽章 - 强调样式 */
.account-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--accent-dark);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-item svg {
  opacity: 0.7;
}

/* 服务卡片主体 */
.service-card-body {
  padding: 1.25rem 1.5rem;
}

.service-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-live {
  background: #F5FAF5;
  color: var(--accent-success);
}

.status-live .status-indicator {
  background: var(--accent-success);
}

.status-suspended {
  background: #FDF5F5;
  color: var(--accent-danger);
}

.status-suspended .status-indicator {
  background: var(--accent-danger);
  animation: none;
}

.service-url {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #F5FAF5;
  color: var(--accent-success);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.service-url:hover {
  opacity: 0.8;
}

/* 服务信息网格 */
.service-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 旧版样式兼容 */
.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.service-title h3 {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.service-account {
  font-size: 13px;
  color: var(--text-secondary);
}

.status-active {
  background: #F5FAF5;
  color: var(--accent-success);
}

.service-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
}

.service-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.action-btn {
  min-width: 0;
  padding: 9px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: var(--accent-dark);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--border-light);
  color: var(--text-primary);
}

/* 服务卡片功能按钮 - 统一样式规范 */

/* 第一排操作按钮: deploy/suspend/restart/env-vars - 统一带边框样式 */
.action-btn.deploy-btn,
.action-btn.suspend-btn,
.action-btn.restart-btn,
.action-btn.env-vars-btn {
  background: #FDF8F3;
  color: var(--accent-warning);
  border: 1px solid var(--accent-warning);
}

.action-btn.deploy-btn:hover:not(:disabled),
.action-btn.suspend-btn:hover:not(:disabled),
.action-btn.restart-btn:hover:not(:disabled),
.action-btn.env-vars-btn:hover:not(:disabled) {
  background: var(--accent-warning);
  color: white;
}

/* resume 按钮 - 成功色 */
.action-btn.resume-btn {
  background: #F5FAF5;
  color: var(--accent-success);
  border: 1px solid var(--accent-success);
}

.action-btn.resume-btn:hover:not(:disabled) {
  background: var(--accent-success);
  color: white;
}

/* 第二排操作按钮: instances/deploys/events/logs - 次要样式 */
.action-btn.instances-btn,
.action-btn.deploys-btn,
.action-btn.events-btn,
.action-btn.logs-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.action-btn.instances-btn:hover:not(:disabled),
.action-btn.deploys-btn:hover:not(:disabled),
.action-btn.events-btn:hover:not(:disabled),
.action-btn.logs-btn:hover:not(:disabled) {
  background: var(--border-light);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: var(--text-secondary);
  gap: 1rem;
}

.spinner,
.loading-spinner {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent-terracotta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 45, 45, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  width: 90%;
  max-width: 680px;
  max-height: 80vh;
  overflow: hidden;
  transform: scale(0.95);
  transition: all 0.2s ease;
}

.modal.show .modal-content {
  transform: scale(1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.modal-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.modal-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-service-info {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.modal-service-info strong {
  color: var(--text-primary);
  font-weight: 500;
}

.modal-header h2 {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.modal-close:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(80vh - 130px);
}

/* 环境变量列表 */
.env-var-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.env-var-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.env-var-key {
  flex: 0 0 150px;
  font-weight: 500;
  font-size: 13px;
  color: var(--text-primary);
  word-break: break-all;
}

.env-var-value {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font-mono);
  resize: vertical;
  min-height: 36px;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.env-var-btn {
  padding: 6px 10px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.env-var-btn.save {
  background: var(--accent-success);
  color: white;
}

.env-var-btn.delete {
  background: var(--accent-danger);
  color: white;
}

/* 环境变量项增强样式 */
.env-var-item {
  padding: 1rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.env-var-item:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.env-var-item.editing {
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.env-var-grid {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.env-var-key {
  flex: 0 0 160px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-terracotta);
  background: #FDF5F3;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  word-break: break-all;
}

.env-var-value-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.env-var-value {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-primary);
  padding: 8px 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  word-break: break-all;
  overflow: hidden;
}

.env-var-value.masked {
  color: var(--text-muted);
  letter-spacing: 2px;
}

.env-var-value:hover {
  border-color: var(--accent-dark);
  background: var(--bg-paper);
}

.visibility-toggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.visibility-toggle:hover {
  background: var(--bg-paper);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

/* 可见状态的切换按钮 */
.visibility-toggle.visible {
  background: var(--accent-terracotta);
  border-color: var(--accent-terracotta);
  color: white;
}

.visibility-toggle.visible:hover {
  opacity: 0.9;
}

.inline-editor {
  display: none;
  flex: 1;
  min-width: 0;
}

.inline-editor.active {
  display: block;
}

.inline-editor-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--accent-dark);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
  resize: vertical;
  min-height: 38px;
  box-sizing: border-box;
}

.inline-editor-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.inline-editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.inline-editor-btn {
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-edit-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.cancel-edit-btn:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

.save-edit-btn {
  background: var(--accent-dark);
  color: white;
}

.save-edit-btn:hover {
  opacity: 0.9;
}

.env-var-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.env-var-btn {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.env-var-btn.copy-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.env-var-btn.copy-btn:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

.env-var-btn.edit-btn {
  background: #FDF8F3;
  color: var(--accent-warning);
}

.env-var-btn.edit-btn:hover {
  background: var(--accent-warning);
  color: white;
}

.env-var-btn.delete-btn {
  background: #FDF5F5;
  color: var(--accent-danger);
}

.env-var-btn.delete-btn:hover {
  background: var(--accent-danger);
  color: white;
}

/* 事件日志 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  padding: 1.25rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.event-item:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.event-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-type-badge {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-type-deploy {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.event-type-build {
  background: #FDF8F3;
  color: var(--accent-warning);
}

.event-type-error {
  background: #FDF5F5;
  color: var(--accent-danger);
}

.event-status {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
}

.event-status-started {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.event-status-succeeded {
  background: #F5FAF5;
  color: var(--accent-success);
}

.event-status-failed {
  background: #FDF5F5;
  color: var(--accent-danger);
}

.event-time {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.event-details {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* 部署历史列表 */
.deploys-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deploy-item {
  padding: 1.25rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.deploy-item:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.deploy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.deploy-info {
  flex: 1;
  min-width: 0;
}

.deploy-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.deploy-id .deploy-label {
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.deploy-id code {
  font-size: 12px;
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-primary);
  word-break: break-all;
}

.deploy-commit {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 13px;
  flex-wrap: wrap;
}

.deploy-commit code {
  font-size: 11px;
  background: #FDF5F3;
  color: var(--accent-terracotta);
  padding: 2px 6px;
  border-radius: 4px;
}

.deploy-commit .commit-message {
  color: var(--text-primary);
  word-break: break-word;
}

.deploy-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.deploy-status-live {
  background: #F5FAF5;
  color: var(--accent-success);
}

.deploy-status-succeeded {
  background: #F5FAF5;
  color: var(--accent-success);
}

.deploy-status-failed {
  background: #FDF5F5;
  color: var(--accent-danger);
}

.deploy-status-canceled {
  background: #FDF8F3;
  color: var(--accent-warning);
}

.deploy-status-building {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.deploy-status-deactivated {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.deploy-status-pending {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.live-indicator {
  width: 8px;
  height: 8px;
  background: var(--accent-success);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.deploy-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.deploy-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.deploy-duration {
  color: var(--text-muted);
}

.deploy-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.deploy-action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.cancel-deploy-btn {
  background: #FDF5F5;
  color: var(--accent-danger);
  border: 1px solid var(--accent-danger);
}

.cancel-deploy-btn:hover {
  background: var(--accent-danger);
  color: white;
}

.rollback-deploy-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.rollback-deploy-btn:hover {
  background: var(--accent-dark);
  color: white;
  border-color: var(--accent-dark);
}

.current-live-badge {
  padding: 6px 12px;
  background: #F5FAF5;
  color: var(--accent-success);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

/* 日志样式 */
.logs-toolbar {
  padding: 0.75rem 1.5rem;
  background: var(--bg-paper);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.logs-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 6px 28px 6px 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-surface);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  min-width: 80px;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: var(--border-medium);
  background-color: var(--bg-paper);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-dark);
  box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.08);
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.refresh-btn:hover {
  background: var(--bg-paper);
  border-color: var(--accent-dark);
  color: var(--text-primary);
}

.refresh-btn:active {
  transform: scale(0.95);
}

.logs-filters select {
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-surface);
  cursor: pointer;
}

.logs-filters select:focus {
  outline: none;
  border-color: var(--accent-dark);
}

.logs-body {
  padding: 0 !important;
  max-height: calc(80vh - 180px);
}

.logs-container {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(80vh - 180px);
}

.log-entry {
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 2px;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-entry:hover {
  background: rgba(255, 255, 255, 0.05);
}

.log-timestamp {
  color: #6a9955;
  margin-right: 8px;
}

.log-level {
  font-weight: 600;
  margin-right: 8px;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.log-level-error {
  background: #f44336;
  color: white;
}

.log-level-warn {
  background: #ff9800;
  color: white;
}

.log-level-info {
  background: #2196f3;
  color: white;
}

.log-level-debug {
  background: #9e9e9e;
  color: white;
}

.log-message {
  color: #d4d4d4;
}

/* 实例样式 */
.instances-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.instance-item {
  padding: 1rem;
  background: var(--bg-paper);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.instance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.instance-id {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-primary);
}

.instance-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.instance-status-running {
  background: #F5FAF5;
  color: var(--accent-success);
}

.instance-status-starting {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.instance-status-stopped {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.instance-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 12px;
  color: var(--text-secondary);
}

.scale-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px dashed var(--border-light);
}

.scale-section h3 {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.scale-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.scale-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.scale-btn:hover {
  border-color: var(--accent-dark);
  color: var(--text-primary);
}

.scale-input {
  width: 60px;
  height: 36px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.scale-input:focus {
  outline: none;
  border-color: var(--accent-dark);
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 2.5rem 2rem;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
}

.footer a {
  color: var(--accent-terracotta);
  text-decoration: none;
  font-weight: 500;
}

/* 响应式 - 中等屏幕 */
@media (max-width: 1200px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 响应式 - 小屏幕 */
@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
  }

  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    padding: 0.875rem 1rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-state-icon {
    width: 60px;
    height: 60px;
  }

  .empty-state h3 {
    font-size: 16px;
  }

  .empty-state p {
    font-size: 13px;
  }


  /* 头部 */
  .header-container {
    padding: 0 1rem;
  }

  .logo h1 {
    font-size: 16px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .logo-icon svg {
    width: 18px;
    height: 18px;
  }

  .header-actions {
    gap: 0.5rem;
  }

  .header-link,
  .logout-btn {
    height: 32px;
    padding: 0 10px;
    font-size: 12px;
  }

  .header-link svg,
  .logout-btn svg {
    width: 14px;
    height: 14px;
  }

  /* 统计栏 */
  .stats-bar {
    flex-direction: row;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
  }

  .stats-content {
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-start;
    flex: 1;
    min-width: 0;
  }

  .stat-item {
    padding: 0.5rem;
    min-width: auto;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-icon svg {
    width: 18px;
    height: 18px;
  }

  .stat-info h3 {
    font-size: 18px;
  }

  .stat-info p {
    font-size: 11px;
  }

  .add-account-btn {
    padding: 8px 14px;
    font-size: 13px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .filters {
    width: 100%;
    flex-wrap: nowrap;
  }

  .filter-box {
    width: 120px;
    flex-shrink: 0;
  }

  .search-box,
  .filters .search-box {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .search-input {
    font-size: 16px;
  }

  .account-filter-select {
    padding: 10px 38px 10px 14px;
    font-size: 14px;
  }

  .search-input {
    padding: 10px 14px 10px 14px;
    font-size: 14px;
  }

  /* 服务网格 */
  .services-grid {
    gap: 1rem;
    padding: 0 0.5rem;
  }

  .service-card {
    border-radius: var(--radius-md);
  }

  .service-card-header {
    padding: 1rem;
  }

  .service-name {
    font-size: 15px;
  }

  .service-badges {
    flex-wrap: wrap;
  }

  .service-type, .account-badge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .service-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .meta-item {
    font-size: 11px;
  }

  .service-card-body {
    padding: 1rem;
  }

  .service-info-grid {
    gap: 0.5rem;
  }

  /* 服务操作按钮 */
  .service-actions {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.375rem;
  }

  .action-btn {
    padding: 8px 6px;
    font-size: 11px;
    border-radius: 6px;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  /* 模态框 */
  .modal-content {
    width: 95%;
    max-width: none;
    max-height: 90vh;
    margin: 0.5rem;
    border-radius: 16px;
  }

  .modal-content.modal-large {
    max-width: none;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .modal-body {
    padding: 1rem;
  }

  /* 环境变量 */
  .env-var-list {
    gap: 0.75rem;
  }

  .env-var-item {
    padding: 0.75rem;
  }

  .env-var-grid {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .env-var-key {
    flex: 0 0 100%;
    font-size: 12px;
  }

  .env-var-value-wrapper {
    flex: 1;
    min-width: 0;
  }

  .env-var-value {
    font-size: 12px;
  }

  .env-var-actions {
    flex-shrink: 0;
  }

  .env-var-btn {
    height: 28px;
    padding: 0 8px;
    font-size: 11px;
  }

  .add-env-var-section h3 {
    font-size: 14px !important;
  }

  .add-env-var-inputs {
    flex-direction: column;
  }

  .add-env-var-field {
    flex: 1;
  }

  .add-env-var-actions {
    flex-direction: column;
  }

  .add-env-var-actions .form-btn {
    width: 100%;
    justify-content: center;
  }

  .add-env-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  /* 日志工具栏 */
  .logs-toolbar {
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .logs-filters {
    gap: 0.75rem;
  }

  .filter-label {
    font-size: 10px;
  }

  .filter-select {
    font-size: 12px;
    padding: 6px 24px 6px 8px;
    min-width: 70px;
  }

  .refresh-btn {
    width: 36px;
    height: 36px;
  }

  /* 日志容器 */
  .logs-container {
    font-size: 11px;
    padding: 0.75rem;
  }

  .log-entry {
    padding: 3px 6px;
    font-size: 11px;
  }

  .log-timestamp {
    font-size: 10px;
  }

  /* 部署历史 */
  .deploy-item {
    padding: 0.75rem;
  }

  .deploy-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .deploy-status {
    font-size: 11px;
  }

  .deploy-info {
    flex-direction: column;
    gap: 0.25rem;
  }

  /* 事件日志 */
  .event-item {
    padding: 0.75rem;
  }

  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;
  }

  /* 实例管理 */
  .instance-item {
    padding: 0.75rem;
  }

  .scale-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* 主内容区 */
  .main-content {
    padding: 1rem 0.5rem;
  }

  .container {
    padding: 0;
  }

  /* 页脚 */
  .footer {
    padding: 1rem;
    font-size: 12px;
  }
}

/* 超小屏幕 - 390px (iPhone 12) 以下 */
@media (max-width: 390px) {
  .header-container {
    padding: 0 0.75rem;
  }

  .logo h1 {
    font-size: 14px;
  }

  .header-link,
  .logout-btn {
    padding: 0 8px;
    font-size: 11px;
  }

  .service-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
`;
