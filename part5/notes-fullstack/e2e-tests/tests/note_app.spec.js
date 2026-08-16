// ===== part5d — Controlling the state of the database(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#controlling-the-state-of-the-database
// 课程原文(代码块)逐字 1:1 复刻:
//   1. 顶层 beforeEach 参数加 request fixture(Playwright 内置,无需 require)
//   2. request.post('/api/testing/reset') → 清空 noteApp-test DB(Note + User 全删)
//   3. request.post('/api/users', { data: {...} }) → 重建 mluukkai(之前用 mongosh 手工 seed,
//      现在改用 API 自建,e2e 测试不再依赖 DB 预存状态)
//   4. page.goto → 跳到前端(每个 test 拿一个新 page)
//
// 关键依赖(后端必须存在):
//   POST /api/testing/reset  → controllers/testing.js
//   该路由只在 NODE_ENV=test 时由 app.js 挂上,所以 e2e 测试必须跑 start:test backend,
//   不能跑 npm run dev(后者 NODE_ENV=development,没挂 testingRouter)
//
// 副作用:
//   - 之前 test_helper.js 的 initialE2EUser 不再被 e2e 用到(只 backend test 仍可能用,保留)
//   - 之前手工 mongosh 插入的 mluukkai 用户也不再需要

// ===== part5d — Test initialization(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#test-initialization
// 课程原文(代码块 1)逐字 1:1 复刻:
//   1. require 多解构出 beforeEach
//   2. describe 顶层加 beforeEach({ page }) => page.goto('http://localhost:5173')
//   3. 各 test 内部不再各自 page.goto(共享 beforeEach)
//
// 课程 d.5 在此节做的事:把"打开浏览器 → 访问首页"抽到 beforeEach,
// 让后续每个 test 不重复写 page.goto。
// 这是 Playwright 的标准实践——按 test isolation,每个 test 独立 page,
// 但"准备新页面"是公用步骤。
const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })

  // ===== part5d — Writing on the form(课程 1:1)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#writing-on-the-form
  // 课程原文(代码块 8)逐字 1:1 复刻:
  //   await page.getByRole('button', { name: 'login' }).click()
  //   await page.getByLabel('username').fill('mluukkai')
  //   await page.getByLabel('password').fill('salainen')
  //   await page.getByRole('button', { name: 'login' }).click()
  //   await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  //
  // 课程截图中的 LoginForm 是 <label>username <input/></label> 这种结构,
  // getByLabel 才能定位到 input。本仓库 LoginForm.jsx 原本是裸 <div>,
  // 为了让课程原文 verbatim 能跑通,LoginForm 改为 <label> 包裹(课程原文如此)。
  //
  // 用户 mluukkai/salainen / name 'Matti Luukkainen' 按课程原文 1:1 复刻,
  // 由 test_helper.js 在 backend 启动时 seed(与现有 root/sekret 共存)。
  test('user can log in', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  // ===== part5d — Test for failed login(课程 1:1)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#test-for-failed-login
  // 课程原文(完整最终态)逐字 1:1 复刻:
  //   1. 错的密码 'wrong' 提交(用户名仍正确)
  //   2. 定位 .error 容器 → toContainText('wrong credentials')
  //      课程从 getByText('wrong credentials') 演进到 locator('.error') + toContainText,
  //      因为 getByText 无法重复利用 locator 做后续 CSS 断言
  //   3. CSS 断言:border-style=solid + color=rgb(255,0,0)
  //      (这俩来自 index.css 的 .error 规则,前端已经写好,这里 verbatim 断言)
  //   4. not.toBeVisible('Matti Luukkainen logged in') → 确认没意外登录成功
  //
  // 跑测依赖(d.7 之前需要):
  //   - 顶层 beforeEach 已 reset DB + 创建 mluukkai(密码 salainen)
  //   - 填 'wrong' 必然密码错误 → 后端 handleLogin catch 分支 → setErrorMessage('wrong credentials')
  //   - Notification 组件(<div className='error'>)渲染 → 测试断言
  //
  // 位置:顶层 describe 内、'when logged in' 之外(因为本 test 期望"未登录")
  // ===== part5d — Running tests one by one(课程 1:1,纯技术演示)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#running-tests-one-by-one
  // 课程原文 verbatim:d.9 演示 2 种"只跑单个 test"的方式(本节**不**要求持久的代码变更,
  // 课程原话:"When the test is ready, only can and should be deleted."):
  //
  //   方式 1 — test.only:把 test('xxx', ...) 改为 test.only('xxx', ...),
  //            Playwright 只跑这一个,其他全 skip。
  //   方式 2 — CLI grep:不动源码,跑 npm test -- -g "pattern"
  //            Playwright 只跑 test 标题匹配 pattern 的子集。
  //
  // 实测验证:
  //   改 test.only → 跑 → "Running 1 test using 1 worker",其他 3 个 skip ✅
  //   还原 → 跑 npm test -- -g "login fails with wrong password"
  //       → "Running 1 test using 1 worker" ✅
  //   还原 → 跑 npm test → "Running 4 tests using 1 worker" ✅
  //
  // 实战建议:开发中调试某个 test → 用 CLI -g(不污染源码);标记「想跑的 test」
  //         用 test.only(开发完必须删掉,否则 CI 会漏测)。
  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('wrong')
    await page.getByRole('button', { name: 'login' }).click()

    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

    await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
  })

  // ===== part5d — Testing note creation(课程 1:1)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#testing-note-creation
  // 课程原文(代码块)逐字 1:1 复刻:
  //   1. 嵌套 describe('when logged in') —— 把"已登录态"的 test 隔离出来
  //   2. 嵌套 beforeEach —— 在 describe 内部再登录一次(每个 test 独立 page)
  //   3. test('a new note can be created') —— 三步:点 new note → 填 textbox → 点 save
  //
  // 课程 d.6 的关键 selector(都要在 frontend 真实存在才能跑):
  //   getByRole('button', { name: 'new note' }) → App.jsx 的 Togglable buttonLabel
  //   getByRole('textbox') → NoteForm 的 <input>(默认 type=text,role=textbox)
  //   getByRole('button', { name: 'save' }) → NoteForm 的 <button type="submit">save</button>
  //
  // Playwright beforeEach 嵌套语义:每个 test 跑前,先跑外层 beforeEach(page.goto),
  // 再跑内层 beforeEach(login)。所以 nested describe 内的 test 起步已是"已登录态"。
  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new note can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })
  })
})