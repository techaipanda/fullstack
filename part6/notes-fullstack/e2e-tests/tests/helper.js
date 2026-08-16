// ===== part5d — Helper functions for tests(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#helper-functions-for-tests
// 课程原文 verbatim:把 spec 中重复的"点击+填表+提交"步骤抽成 helper function,
// 放到 tests/helper.js,让 spec 主体更聚焦在"断言"而不是"操作"。
//
// 课程 d.10 最终态包括 2 个 helper(本文件 1:1 复刻):
//
//   1. loginWith(page, username, password)
//      → 点 login 按钮 → 填 username → 填 password → 点 login 按钮
//      被 3 处调用:
//        - d.4 'user can log in' 顶层 test
//        - d.6 'when logged in' 嵌套 beforeEach
//        - d.8 'login fails with wrong password' test(密码传 'wrong')
//
//   2. createNote(page, content)
//      → 点 new note 按钮 → 填 textbox → 点 save 按钮
//      被 2 处调用:
//        - d.6 'a new note can be created' test
//        - d.11 (下一节) 'and a note exists' 嵌套 beforeEach(预创建 note 用于改 importance)
//
// 课程原文用 ESM (`export { loginWith, createNote }`),本仓库 e2e-tests/package.json
// 没指定 type=module,所以用 CommonJS (`module.exports`) 与 spec 同款 require。
// 行为 100% 一致,只是模块语法按本仓库现有约定。

const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createNote = async (page, content) => {
  await page.getByRole('button', { name: 'new note' }).click()
  await page.getByRole('textbox').fill(content)
  await page.getByRole('button', { name: 'save' }).click()

  // ===== part5d — Test development and debugging(课程 1:1,waitFor 修复)=====
  // 课程章节: https://fullstackopen.com/en/part5/end_to_end_testing#test-development-and-debugging
  // 课程原文 verbatim(代码块 stage 修复):createNote 末尾加
  //   await page.getByText(content).waitFor()
  //
  // 原因:之前 d.11 末尾说"测试有时过有时不过"。真因是连续调 3 次 createNote 时,
  // 第二次的 POST /api/notes 还没等 server 响应就发起第三次;server 响应时基于"响应时
  // 的 DB 状态"重渲染,导致中间那次被覆盖 — 第二次的 note 在页面上"消失"。
  //
  // 修复:在 createNote 末尾加 waitFor — 必须等到这条 note 真的渲染到 DOM 才算完成,
  // 再调下一次 createNote 才会基于"包含前几次"的正确状态发起请求。
  //
  // 这是一个**非常普适的 e2e 反模式**:"我点完 save 就接着干下一件事",
  // 但 save 只是触发了请求,响应还没回来,DOM 还没更新。waitFor 是 Playwright 的
  // "软同步"机制 — 比 page.waitForTimeout(500) 这种死等更稳,因为它会在条件
  // 满足时立即放行。
  await page.getByText(content).waitFor()
}

module.exports = { loginWith, createNote }