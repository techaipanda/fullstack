# part7 c — Error boundary(verbatim 课程子项目)

> **本子项目作用**:把课程 "Error boundary" 子节里 **2 个 verbatim 代码块**(CB1 ErrorBoundary class + Usage Pattern App.jsx)做成**最小可跑的 React 19 + Vite 项目**,**外加**两个 ⭐ stub 组件(Notes + Persons)用于手动触发错误验证。
>
> **运行方式比 c 章 Class Components 简单很多** —— 单终端 `npm run dev`,**不需要** json-server 或 axios(纯 UI 演示)。

---

## 课程原文要点(verbatim 摘录)

> "Even though Class Components are largely obsolete, there is one situation where you still cannot avoid them: error boundaries. An error boundary is a component that catches JavaScript errors anywhere in its child component tree and displays a fallback UI instead of crashing the whole application. As of 2026, React has not yet introduced a hook-based alternative for this, so error boundaries must still be implemented as Class components."

> "You can wrap any part of your component tree with an error boundary to contain failures to that subtree."

> "If _Notes_ throws an error, only that section shows the fallback. _Persons_ continues to work normally."

> "Because this is the one remaining use case for Class components, many projects use the react-error-boundary library, which wraps the class-based machinery behind a convenient Functional component API so you never have to write a Class component yourself."

---

## ⭐ 核心概念(本子项目演示的 5 个,均在 `src/ErrorBoundary.jsx` ⭐ 注释里)

### ⭐ ErrorBoundary 必须是 Class Component(React 至今没出 hook 替代)
课程原文明确说"React has not yet introduced a hook-based alternative for this"。`getDerivedStateFromError` 和 `componentDidCatch` 是 Class Component 独有 API,Functional component 无法实现。

### ⭐ static getDerivedStateFromError(error) — 静态生命周期,返回新 state
- **静态**:无 `this` 访问、不能 setState
- **返回新 state**:`{ hasError: true, error }`,React merge 进组件 state
- 触发 fallback UI 渲染
- 验证:F12 React DevTools,出错瞬间 state 立即变为 `{ hasError: true, error: <Error对象> }`

### ⭐ componentDidCatch(error, info) — 实例生命周期,用于副作用(日志/Sentry 上报)
- **不是**用于切 UI(getDerivedStateFromError 已经做了)
- 用于**副作用**:console.error / 上报 Sentry / 落盘
- `info.componentStack` 告诉你是哪个组件抛的(树状栈)
- 验证:F12 Console 看 `ErrorBoundary caught an error <Error> { componentStack: '...' }`

### ⭐ render 双分支(hasError / props.children)
- `hasError=true` → 返回 fallback UI
- `hasError=false` → 返回 `this.props.children`(穿透,无包装 DOM)
- **包裹粒度决定爆炸半径**:粒度越细,单点失败的影响面越小

### ⭐ "try again" 按钮恢复 — setState({ hasError: false, error: null })
重置 state 让 render 重新走 children 分支,**子组件会被重新挂载**(state 重置)。

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端** —— 纯 React + Vite,无后端。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part7\c\error-boundary
npm install
```

**期望**:`node_modules/` 出现,4 个包:`react` / `react-dom` / `vite` / `@vitejs/plugin-react`。

### Step 2 — 启动 Vite dev server

```bash
npm run dev
```

**期望**:
- 终端打印 `VITE v7.x.x ready in xxx ms` + `➜ Local: http://localhost:5173/`
- 浏览器访问 `http://localhost:5173`,看到两个 section:**Notes section** + **Persons section**

### Step 3 — 验证概念 5:触发 Notes 抛错,看 fallback

1. 点 "throw an error in Notes" 按钮
2. **期望**:
   - Notes 区域立刻变成 `<h2>Something went wrong.</h2>` + "Notes 模拟崩溃 —— 测试 ErrorBoundary" 错误信息 + "try again" 按钮
   - **Persons 区域不受影响**,仍然显示原来的内容
3. F12 → Console 看到 `ErrorBoundary caught an error Error: Notes 模拟崩溃 ... { componentStack: ... }`
4. F12 → React DevTools → 展开包裹 Notes 的 ErrorBoundary,看到 `state: { hasError: true, error: Error }`

### Step 4 — 验证概念 5b:try again 恢复

1. 在 Notes 的 fallback 状态点 "try again"
2. **期望**:Notes 区域恢复显示 "Notes section" 标题和按钮
3. (理解:Notes 整个组件被重新挂载,所以之前任何 state 都丢了 —— 这是 React ErrorBoundary 的标准行为)

### Step 5 — 验证概念 5c:Persons 隔离

1. 点 "throw an error in Persons" 按钮
2. **期望**:Persons 区域变 fallback,**Notes 仍然正常**(各自的 ErrorBoundary 独立)
3. 多次来回点两个按钮,验证两个 ErrorBoundary 互不影响

### Step 6 — build / preview(可选)

```bash
npm run build
npm run preview
```

**期望**:`dist/` 出现,`http://localhost:4173` 仍然能跑(已编译的版本)。

**结束**:Ctrl+C。

---

## ⭐ 课程本节演进路径(本子项目保留了什么)

| 课程段落 | 本子项目保留方式 |
|---|---|
| ErrorBoundary class component(CB1 verbatim)| `src/ErrorBoundary.jsx` verbatim 写入 + ⭐ 5 概念注释 |
| Usage Pattern(functional App 包裹 Notes + Persons)| `src/App.jsx` verbatim 写入 |
| Notes / Persons 示意组件 | `src/Notes.jsx` + `src/Persons.jsx` 是 ⭐ stub(课程没定义)|
| react-error-boundary 备选库 | **不写入**(课程仅提及,没强制要求)|

---

## ⭐ 课程本节没讲到但本子项目要做的"基础设施"

| 项 | 课程是否提到 | 本子项目怎么处理 |
|---|---|---|
| Vite + React 配置 | ❌ 未提到 | 加最小 vite.config.js + package.json |
| main.jsx | ❌ 未提到 | Vite 模板标准 |
| Notes / Persons stub | ❌ 未提到 | ⭐ stub(带 throw 按钮)|
| 包版本 | ❌ 未提到 | react 19.2 / vite 7.x(本仓库版本)|

---

## ⭐ 关键 takeaway(5 条)

1. **ErrorBoundary 是 2026 年唯一合法的 Class Component 使用场景** —— React 没出 hook 替代,只能用 class
2. **`getDerivedStateFromError`** 切 UI(纯函数,返回新 state)→ **`componentDidCatch`** 做副作用(日志/Sentry)
3. **包裹粒度 = 爆炸半径**:粒度越细,单点失败影响越小。`<ErrorBoundary>` 包整个 App = 整个 App 一个 fallback,包两个组件 = 两个独立 fallback
4. **"try again" 模式**:`setState({ hasError: false, error: null })` 重置 state,**子组件被重新挂载**
5. **生产项目通常用 `react-error-boundary`** —— 课程 verbatim 写法是"自己写 class"。真实项目里这个库是默认选择(避免项目里出现唯一一个 class component)

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| Notes.jsx | 课程没定义(只是 import 名示意) | ⭐ stub 带 throw 按钮 | 不加 stub 项目无法 import 跑通 |
| Persons.jsx | 同上 | ⭐ stub 带 throw 按钮 | 同上 |
| main.jsx | 课程没写 | Vite 模板标准 | 没有它项目跑不起来 |
| vite.config.js | 课程没写 | 加最小 vite.config.js | Vite 必需 |
| package.json scripts | 课程没写 | 加 `dev` / `build` / `preview` | 标准 Vite 启动方式 |
| 包版本 | 课程原页未指定 | react 19.2 / vite 7.x | CLAUDE.md 约束 |
| 触发错误的方式 | 课程没演示怎么触发 | stub 里的 throw 按钮 | 让你手动验证 boundary 真的接住了 |
| react-error-boundary 库 | 课程原文提到但**未使用** | **不引入** | 课程 verbatim 没引入 |

---

## 后续子段

- c 章**Error boundary 已完结**(本子项目 2/7 子节完成)
- c 章下一节是 **Frontend and backend in the same repository** —— 等用户确认再推进
- 本节**不**推进 part7 d / e 等其他章节
- 本节**不** commit / push
- 本节**不** 跑任何命令

---

**重要纪律**:这一节我**不替你跑任何命令**,所有 `npm install` / `npm run dev` / `npm run build` / `npm run preview` 都是**你自己手动跑**。如果跑完发现某个期望对不上,告诉我具体 Step + 实际输出,我再排查。