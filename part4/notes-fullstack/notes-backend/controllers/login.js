const loginRouter = require('express').Router()
const User = require('../models/user')
const { verifyPassword } = require('../utils/passwords')
const { signToken } = require('../utils/tokens')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'username and password are required' })
  }

  const user = await User.findOne({ username })
  const passwordCorrect = user
    ? await verifyPassword(password, user.passwordHash)
    : false

  if (!user || !passwordCorrect) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const token = signToken({ username: user.username, id: user._id })

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter