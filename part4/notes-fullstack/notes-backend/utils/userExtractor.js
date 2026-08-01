const { verifyToken } = require('./tokens')
const User = require('../models/user')

// 从 Authorization: Bearer <token> 中提取 token，校验后挂到 request.user
const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7)
    try {
      const decodedToken = verifyToken(token)
      if (decodedToken && decodedToken.id) {
        request.user = await User.findById(decodedToken.id)
      }
    } catch {
      // token 失效时视作未登录：让后续处理器自行处理 401
      request.user = null
    }
  }
  next()
}

module.exports = { userExtractor }