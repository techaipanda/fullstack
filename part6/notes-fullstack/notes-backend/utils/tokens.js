const jwt = require('jsonwebtoken')
const config = require('./config')

const TOKEN_TTL = '1h'

const signToken = (payload) => {
  if (!config.SECRET) {
    throw new Error('SECRET is not configured')
  }
  return jwt.sign(payload, config.SECRET, { expiresIn: TOKEN_TTL })
}

const verifyToken = (token) => {
  if (!config.SECRET) {
    throw new Error('SECRET is not configured')
  }
  return jwt.verify(token, config.SECRET)
}

module.exports = { signToken, verifyToken }