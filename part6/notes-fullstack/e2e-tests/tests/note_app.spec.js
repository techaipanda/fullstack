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
const { loginWith, createNote } = require('./helper')

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
    await loginWith(page, 'mluukkai', 'salainen')

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
  // ===== part5d — Test development and debugging(课程 1:1,纯技术演示 + 修复)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#test-development-and-debugging
// 课程原文 verbatim:d.12 教 3 类 Playwright 调试/诊断工具:
//
//   A. Inspector(交互式单步调试)
//      npm test -- "-g" "one of those can be made nonimportant" --debug
//      → Playwright Inspector 窗口弹出,Step Over / Resume / Pause 按钮
//      → 在 test 中插入 await page.pause() 作为"代码内断点",
//        Inspector 直接跳到那一行,不必从头单步走完。
//
//   B. waitFor 修复(课程 stage 修复,本仓库已 1:1 落地在 helper.js)
//      课程原文 verbatim:
//        const createNote = async (page, content) => {
//          await page.getByRole('button', { name: 'new note' }).click()
//          await page.getByRole('textbox').fill(content)
//          await page.getByRole('button', { name: 'save' }).click()
//          await page.getByText(content).waitFor()  // ← 新增
//        }
//      解决了 d.11 末尾的"测试有时过有时不过"。
//
//   C. 其他工具(课程列举,本节按"一次只推进一小节"未持久化):
//      - npm run test -- --ui           (UI mode, 浏览器里看每一步)
//      - npm run test -- --trace on     (生成可视化 trace, npx playwright show-report)
//      - npx playwright codegen http://localhost:5173/  (录制生成 test)
//      - VS Code Playwright 插件(代码内断点 + UI 集成)
//
// 本节在 spec 里**未**插入 await page.pause() — 因为那是"调试时手动加"的,
// 留作事故定位时再临时加,提交前必须删(同 d.9 的 test.only 纪律)。

// ===== part5d — Helper functions for tests(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#helper-functions-for-tests
// 课程原文 verbatim:把 spec 里"点击+填表+提交"这类重复步骤抽成 helper function,
// 放到 tests/helper.js(本仓库已 1:1 复刻 — ESM 改 CommonJS 适配现有 package.json)。
// spec 主体从"操作 UI"变成"调用 helper + 断言",显著降低重复。
//
// 抽出的 2 个 helper(详情见 tests/helper.js):
//   loginWith(page, username, password)  → 3 处调用:
//     - d.4 'user can log in'(密码 'salainen')
//     - d.6 'when logged in' 嵌套 beforeEach(密码 'salainen')
//     - d.8 'login fails with wrong password'(密码 'wrong')
//   createNote(page, content) → 2 处调用:
//     - d.6 'a new note can be created'
//     - (下一节 d.11) 'and a note exists' 嵌套 beforeEach
//
// 本节**未**做的事:
//   - 课程 d.10 末尾演示的"用 baseURL 替换 hardcoded URL"是进阶内容,
//     课程标了"can now be transformed",本节按"一次只推进一小节"原则不并入。
//     当前 spec 里 hardcoded 'http://localhost:5173' / 'http://localhost:3001/api/...'
//     暂保留原状(留给后续小节或单独清理)。

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
    await loginWith(page, 'mluukkai', 'wrong')

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
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new note can be created', async ({ page }) => {
      await createNote(page, 'a note created by playwright')
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })

    // ===== part5d — Note importance change revisited(课程 1:1)=====
    // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#note-importance-change-revisited
    // 课程原文(代码块 stage 5 最终态)逐字 1:1 复刻:
    //   1. 在 'when logged in' 内再嵌 describe('and several notes exists')(复数,不是单数 'a note exists')
    //   2. 嵌套 beforeEach 创建 3 个 note('first note' / 'second note' / 'third note'),
    //      复用了 d.10 抽出的 createNote helper
    //   3. test 改"second note"的 importance:点 'make not important' → 断言 'make important' 出现
    //   4. 关键 selector 模式(课程 stage 3-4 演进最终态):
    //        const otherNoteText = page.getByText('second note')   // 拿到 span
    //        const otherNoteElement = otherNoteText.locator('..')   // 用 XPath '..' 找 span 的父元素 = <li>
    //      原因:课程 stage 3 把 Note.jsx 的 note.content 包到 <span>,所以
    //      page.getByText('second note') 只匹配 span 本身,而 button 在 span 之外,
    //      必须 .locator('..') 升级到父元素 <li> 才能在 li 内 getByRole('button', ...)
    //
    // 本仓库 frontend Note.jsx 已按课程 stage 3 改: {note.content} → <span>{note.content}</span>,
    // 所以这里直接用 stage 5 的 .. locator 写法 verbatim 即可。
    //
    // 课程 d.11 末尾明示:"the test starts working unreliably... It's time to learn how to debug tests."
    // 也就是说 d.11 完成态会自然引入"测试不稳",d.12 专门处理。本节按 verbatim 复刻,
    // 测试稳定性问题留给 d.12。
    describe('and several notes exists', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'first note')
        await createNote(page, 'second note')
        await createNote(page, 'third note')
      })

      test('one of those can be made nonimportant', async ({ page }) => {
        const otherNoteText = page.getByText('second note')
        const otherNoteElement = otherNoteText.locator('..')

        await otherNoteElement.getByRole('button', { name: 'make not important' }).click()
        await expect(otherNoteElement.getByText('make important')).toBeVisible()
      })
    })
  })
})