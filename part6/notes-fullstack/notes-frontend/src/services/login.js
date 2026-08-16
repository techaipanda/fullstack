// part5 a — Login 服务
// 把 username/password POST 到 /api/login，后端用 part4 已实现的
// controllers/login.js 验证密码、签发 JWT，返回 { token, username, name }。
// 这里只负责发请求并把 response.data 返回给调用方。
import axios from 'axios'
const baseUrl = '/api/login'

// part5 a — login(credentials)
// credentials: { username, password }
// 成功: { token, username, name }
// 失败: axios 把 401 抛成异常，由调用方捕获
const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }