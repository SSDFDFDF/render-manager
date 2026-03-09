/**
 * 应用常量配置
 */

// 会话配置
export const SESSION_CONFIG = {
  EXPIRY: 24 * 60 * 60 * 1000,           // 会话过期时间: 24小时
  MIN_REFRESH_INTERVAL: 5 * 60 * 1000,   // 滑动刷新最小间隔: 5分钟
};

// 缓存配置
export const CACHE_CONFIG = {
  SOFT_TTL: 15 * 60 * 1000,       // 软 TTL: 15 分钟（fresh）
  HARD_TTL: 24 * 60 * 60 * 1000,  // 硬 TTL: 24 小时（stale -> expired）
  KV_TTL: 48 * 60 * 60,           // KV 存储 TTL: 48 小时（秒）
  VERSION: 'v1',                   // 缓存版本（数据结构变更时递增）
};

// API 请求配置
export const API_CONFIG = {
  TIMEOUT_MS: 15000,         // 请求超时: 15秒
  MAX_ATTEMPTS: 3,           // 最大重试次数
  PAGE_LIMIT: 100,           // 分页大小
};

// Render API 基础地址
export const RENDER_API_BASE = 'https://api.render.com/v1';

// KV 存储键
export const KV_KEYS = {
  ACCOUNTS: 'render:accounts',
  SESSION_PREFIX: 'session:',
  LOGIN_ATTEMPT_PREFIX: 'login_attempt:',
  SERVICES_CACHE_PREFIX: 'services:',
};

// 登录防暴力配置
export const LOGIN_RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_SECONDS: 15 * 60,
  BASE_LOCK_SECONDS: 5 * 60,
  MAX_LOCK_SECONDS: 60 * 60,
};

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  NO_CONTENT: 204,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Ping 保活配置
export const PING_CONFIG = {
  TIMEOUT_MS: 10000,        // 单次请求超时 10s
  MAX_RETRIES: 2,           // 最多重试 2 次
  RETRY_DELAY_MS: 1000,     // 重试基础间隔 1s（使用指数退避）
  BATCH_SIZE: 10,           // 每批并发数（提升性能）
  BATCH_INTERVAL_MS: 100,   // 批次间固定间隔 ms
};

// Cron 任务配置
export const CRON_CONFIG = {
  TIMEOUT_MS: 25000,        // Cron 任务超时 25s（Workers 限制 30s）
};

// 输入验证配置
export const VALIDATION_CONFIG = {
  MAX_INSTANCES: 100,       // 最大实例数上限
  MAX_DEPLOY_LIMIT: 100,    // 部署历史最大查询数
  MIN_LIMIT: 1,             // 最小查询数
  API_KEY_MIN_LENGTH: 12,   // API Key 最小长度
};
