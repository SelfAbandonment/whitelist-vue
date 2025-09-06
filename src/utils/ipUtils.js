/**
 * IP获取工具函数
 * 提供多种IP获取方式，确保能够成功获取用户IP
 */

/**
 * 主要IP获取接口
 * @returns {Promise<Object>} 包含IP信息的对象
 */
const getIpFromPrimarySource = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://ip.useragentinfo.com/json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('主要IP获取接口失败，尝试备用接口:', error);
    return getIpFromBackupSource();
  }
};

/**
 * 备用IP获取接口1
 * @returns {Promise<Object>} 包含IP信息的对象
 */
const getIpFromBackupSource = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://ipinfo.io/json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('备用IP获取接口1失败，尝试备用接口2:', error);
    return getIpFromBackupSource2();
  }
};

/**
 * 备用IP获取接口2
 * @returns {Promise<Object>} 包含IP信息的对象
 */
const getIpFromBackupSource2 = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('备用IP获取接口2也失败:', error);
    return {};
  }
};

/**
 * 获取用户IP地址
 * 按优先级尝试多个IP获取接口，确保能够成功获取IP
 * @returns {Promise<string|null>} 用户IP地址，如果获取失败返回null
 */
export const getUserIP = async () => {
  try {
    const data = await getIpFromPrimarySource();
    return data && data.ip ? data.ip : null;
  } catch (error) {
    console.error('获取用户IP失败:', error);
    return null;
  }
};

/**
 * 获取包含IP的请求头
 * 用于在API请求中添加用户IP信息
 * @returns {Promise<Object>} 包含IP信息的请求头对象
 */
export const getHeadersWithIP = async () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const ip = await getUserIP();
    if (ip) {
      headers['X-Real-IP'] = ip;
    }
  } catch (error) {
    console.warn('获取IP失败，将使用默认请求头:', error);
  }

  return headers;
};

/**
 * 为现有请求头添加IP信息
 * @param {Object} existingHeaders - 现有的请求头对象
 * @returns {Promise<Object>} 添加了IP信息的新请求头对象
 */
export const addIPToHeaders = async (existingHeaders = {}) => {
  const headers = { ...existingHeaders };
  
  try {
    const ip = await getUserIP();
    if (ip) {
      headers['X-Real-IP'] = ip;
    }
  } catch (error) {
    console.warn('获取IP失败，将使用原始请求头:', error);
  }

  return headers;
};
