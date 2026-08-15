const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const cors = require('cors')
const middleware = require('./utils/middleware')
const { userExtractor } = require('./utils/userExtractor')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

// 笔记路由挂 userExtractor：登录后可读 request.user，POST/DELETE 据此鉴权
app.use('/api/notes', userExtractor, notesRouter)

// ===== part5d — Controlling the state of the database(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#controlling-the-state-of-the-database
// 课程原文 verbatim:if (process.env.NODE_ENV === 'test') { testingRouter; /api/testing }
// production / development 环境完全不挂这条 router,无法访问 /api/testing/reset。
// 这是 E2E test 隔离的关键 — 每个 test 跑前自己清库,不依赖 DB 初始状态。
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app