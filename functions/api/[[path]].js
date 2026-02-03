export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 后端 API 地址
  const BACKEND_API = 'http://176.97.217.106:8080';
  
  // 处理路径：移除 /api 前缀，保留后面的部分
  // 例如：/api/api/v1/xxx -> /api/v1/xxx
  let apiPath = url.pathname.replace(/^\/api/, '');
  const apiUrl = `${BACKEND_API}${apiPath}${url.search}`;
  
  console.log('Original path:', url.pathname);
  console.log('Backend URL:', apiUrl);
  
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }
  
  try {
    // 转发请求到后端
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? await request.arrayBuffer() 
        : undefined,
    });
    
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    // 添加 CORS 头
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', '*');
    
    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ 
      code: 500, 
      msg: '代理请求失败: ' + error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}