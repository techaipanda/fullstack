const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const hashPassword = async (password) => {
  if (!password) {
    throw new Error('password is required')
  }
  return bcrypt.hash(password, SALT_ROUNDS)
}

const verifyPassword = async (password, passwordHash) => {
  if (!password || !passwordHash) {
    return false
  }
  return bcrypt.compare(password, passwordHash)
}

module.exports = { hashPassword, verifyPassword }