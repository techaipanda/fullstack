// part5 a — Notes 服务（HTTP 客户端 + token 透传）
// 把 /api/notes 下的 CRUD 操作封装成普通 Promise，
// 方便 App.jsx 通过 notesService.getAll() / create() / update() / deleteNote() 调用。
//
// part5 a 阶段:实现 setToken() —— 登录成功后,把 token 写到这个模块的局部变量,
// create/update/delete 时再放到 Authorization header。
// 后端 controllers/notes.js 通过 utils/userExtractor 读取 header 里的 token,
// 鉴权失败时返回 401。
import axios from 'axios'
const baseUrl = '/api/notes'

// part5 a — 模块级 token,所有 create/update/delete 都用它。
// 启动默认 null(未登录),登录成功后 App.jsx 调 setToken 写入。
let token = null

// part5 a — setToken(newToken)
// 把后端 /api/login 返回的 JWT 存到模块里,后续请求带上 Bearer header
const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

// part5 a — create / update / deleteNote
// 把 token 放进 headers.Authorization,后端 userExtractor 读 request.user
const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newObject) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.put(`${baseUrl}/${id}`, newObject, config)
  return response.data
}

const deleteNote = async (id) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}

export default { getAll, create, update, deleteNote, setToken }