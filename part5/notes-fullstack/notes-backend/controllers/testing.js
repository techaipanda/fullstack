// ===== part5d — Controlling the state of the database(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#controlling-the-state-of-the-database
// 课程原文 verbatim:express.Router() + Note.deleteMany({}) + User.deleteMany({}) + 204。
//
// 这是 E2E 测试专用的"清库"端点,只在 NODE_ENV=test 时由 app.js 挂上(/api/testing)。
// 生产环境 (NODE_ENV=production 或 development) 不挂载,无法被外部访问。
//
// 安全说明:任何能调 /api/testing/reset 的客户端都能清空整个 DB,
// 所以这个端点必须在 test 环境之外不暴露。课程用 if (NODE_ENV === 'test') 守卫,
// 这里 1:1 复刻。
const router = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Note.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = router