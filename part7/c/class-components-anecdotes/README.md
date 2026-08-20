# part7 c — Class Components(verbatim 课程子项目)

> **本子项目作用**:把课程 "Class Components" 子节里 5 个连续演进的代码块(CB1 空壳 → CB2 state 初始化 → CB3 componentDidMount → CB4 完整版本 → CB5 functional 对照)合并成**最终态 CB4** 的可跑项目。
>
> 课程里**只示范最终态 CB4 的代码**;CB1-CB3 是演进路径,在本子项目里以 ⭐ 中文注释形式留痕,而不是占多个文件版本。
>
> **运行需要两个并行进程**(json-server + Vite dev)。这是课程原文的演示方式,不是反模式。

---

## 课程原文要点(verbatim 摘录)

> "During the course, we have only used React components having been defined as JavaScript functions. This was not possible without the hook functionality that came with version 16.8 of React. Before, when defining a component that uses state, one had to define it using JavaScript's Class syntax."

> "It is beneficial to at least be familiar with Class Components to some extent since the world contains a lot of old React code, which will probably never be completely rewritten using the updated syntax."

> "In contrast to when using the useState hook, Class Components only contain one state. So if the state is made up of multiple 'parts', they should be stored as properties of the state."

> "The correct place to trigger the fetching of data from a server is inside the lifecycle method componentDidMount, which is executed once right after the first time a component renders."

> "The method [setState] only touches the keys that have been defined in the object passed to the method as an argument."

> "In 2026, Class Components are largely a historical artifact. All modern React development uses Functional components with hooks, and there is no rational reason to reach for a Class component when writing new code. The React documentation itself treats Class components as a legacy API."

---

## ⭐ 核心概念(本子项目演示的 6 个,均在 `src/App.jsx` ⭐ 注释里)

### ⭐ Class Component 三要素
`class App extends React.Component` + `constructor(props) { super(props); this.state = {...} }` + `render() { return JSX }`。这是 Hooks 出现前(React < 16.8)的唯一写法。

### ⭐ this.state 是单个对象(对比 useState 多变量)
课程原文明确写"Class Components only contain one state"——所有 state 字段塞进同一个对象,渲染时 `this.state.x` 读。

### ⭐ this.setState({ key: value }) 浅合并
只更新传入对象里**列出来的** key,其他 key 保持不变。直接赋值 `this.state.x = y` 不触发 render(反模式)。

### ⭐ componentDidMount ≈ useEffect(...,[])
生命周期方法。在首次 render **之后**立刻跑一次(然后再也不会跑)。React 16.8 之前等同于 `useEffect(()=>{...}, [])` 的作用。

### ⭐ 箭头函数类字段自动绑定 this
`componentDidMount = () => { ... }` 这种写法让 `this` 自动绑定到当前实例,避免在 `onClick={this.handleClick}` 这种场景下因 `this` 为 `undefined` 而崩。

### ⭐ Math.floor(Math.random() * length) 随机索引
课程 verbatim 这里用 `floor`(CB4),functional 对照版用 `round`(CB5)——行为接近但浮点边界略不同。**保留课程原文,不替换**。

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目需要**两个并行终端**(json-server + Vite dev),请同时打开两个 PowerShell。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part7\c\class-components-anecdotes
npm install
```

**期望**:
- `node_modules/` 出现
- 安装 6 个包:`react` / `react-dom` / `axios` / `vite` / `@vitejs/plugin-react` / `json-server`

### Step 2 — 启动 json-server(终端 1)

```bash
npm run server
```

**期望**:
- 终端打印 `Resources` + `http://localhost:3001/anecdotes`
- 新打开一个 PowerShell 跑 `curl http://localhost:3001/anecdotes`,能看到 6 条 anecdotes JSON

### Step 3 — 启动 Vite dev server(终端 2)

```bash
npm run dev
```

**期望**:
- 终端打印 `VITE v7.x.x ready in xxx ms` + `➜ Local: http://localhost:5173/`
- 浏览器访问 `http://localhost:5173`

### Step 4 — 浏览器验证 6 个概念

| 现象 | 验证概念 |
|---|---|
| 页面先显示 "no anecdotes..." 几十毫秒,然后切到一条 anecdote | ⭐ #4 componentDidMount 触发 setState |
| 反复点 "next" 按钮,文本随机切换 | ⭐ #3 setState({ current }) 浅合并,只换 current |
| 浏览器 DevTools → Console,看到 setState 后 state 是 6 条 + current 不变 | ⭐ #2 this.state 是单个对象 + ⭐ #3 浅合并 |
| 浏览器 DevTools → React DevTools(或 React 19 自带 Components 面板),展开 App,看到 "Class" 标记 | ⭐ #1 是 Class Component |
| 故意把 `componentDidMount = () => {...}` 改成 `componentDidMount() {...}` 然后 `handleClick` 里 `this` 为 undefined,刷新看报错 | ⭐ #5 箭头函数自动绑 this(再改回去) |
| F12 → Network → 找 `/anecdotes` 请求,看到 Remote Address 是 `localhost:3001`(不是 5173),且状态码 200 | 验证 json-server 真的在跑 |

### Step 5 — build / preview(可选)

```bash
npm run build
npm run preview
```

**期望**:`dist/` 出现,`http://localhost:4173` 仍然能跑(已编译的版本)。本子项目没演示 sourcemap(那在 b 章)。

**结束**:两个终端都按 Ctrl+C(json-server 和 Vite dev 各一次)。

---

## ⭐ 课程本节演进路径(本子项目没单独保留每一步)

| Code Block | 课程内容 | 本子项目保留方式 |
|---|---|---|
| CB1 | 空壳 Class Component(只有 constructor + render)| 在 App.jsx ⭐ 注释里描述 |
| CB2 | 加入 state(anecdotes + current)+ 占位渲染 | 在 App.jsx ⭐ 注释 + 实际代码中 |
| CB3 | 加入 componentDidMount + axios.get | 在 App.jsx ⭐ 注释 + 实际代码中 |
| **CB4(最终态)** | **完整版(handleClick + setState({ current }))** | **`src/App.jsx` verbatim 写入** |
| CB5 | Functional 对照版(useState + useEffect) | **不写入**(本子节就是讲 class,functional 才是主流)|

---

## ⭐ 课程本节没讲到但本子项目要做的"基础设施"

| 项 | 课程是否提到 | 本子项目怎么处理 |
|---|---|---|
| json-server | ✅ 提到 | `npm run server` 脚本 |
| db.json 内容 | 🔗 链接到外部 GitHub | **verbatim 从 fullstack-hy/misc 仓库 master 分支抓取** |
| Vite 配置 | ❌ 未提到 | 最小化(只 `@vitejs/plugin-react`)|
| main.jsx | ❌ 未提到 | Vite 模板标准 |
| CORS / proxy | ❌ 未提到 | **不绕** —— 课程原文直接 axios.get 跨端口,浏览器会撞 CORS。这是课程**故意**展示的"老式"做法,**用 Chrome 关闭 web security 标志或在 json-server 端配 CORS 解决**(或加 `proxy` 配置,见 b 章)|

> ⚠️ **关于 CORS**:如果 Step 4 浏览器 DevTools Console 报 "Access to XMLHttpRequest at 'http://localhost:3001/anecdotes' from origin 'http://localhost:5173' has been blocked by CORS policy"——**这是课程 verbatim 行为的预期现象**,不是 bug。本子项目不演示解决,留给 part7 后续章节(很可能是 b 章 server.proxy 的实战用法)。

---

## ⭐ 关键 takeaway(5 条)

1. **Class Component 是 2026 年的历史遗留 API**——React 官方文档自己把它归为 legacy。课程明确说"there is no rational reason to reach for a Class component when writing new code"
2. **学它是为了读老代码**——很多 2017-2020 年的 React 项目还在用 class
3. **state 模型不同**:`this.state`(单个对象)+ `setState({...})`(浅合并),vs `useState`(每变量一份)+ `setX` (替换)
4. **生命周期对位**:`componentDidMount` ≈ `useEffect(()=>{...}, [])`;`componentDidUpdate` ≈ `useEffect(()=>{...}, [deps])`;`componentWillUnmount` ≈ `useEffect(()=>{ return cleanup }, [])`
5. **箭头函数类字段**(`method = () => {}`)是 class component 时代**最实用的语法糖**——避免到处 `bind(this)` / `const that = this`

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| 范围 | 课程只给 5 个 inline code block 演进 | 本子项目固定在最终态 CB4 | 单文件可直接跑通 |
| main.jsx | 课程没写 | 加 Vite 模板标准 main.jsx | 没有它项目跑不起来 |
| package.json scripts | 课程没写 | 加 `dev` / `build` / `preview` / `server` | 标准 Vite + json-server 启动方式 |
| `vite.config.js` | 课程没写 | 加最小 vite.config.js(plugins: [react()])| Vite 必需 |
| db.json 内容 | 课程链 GitHub URL | verbatim 抓取到本地 | 本子项目要可跑,不能依赖网络 |
| 包版本 | 课程原页未指定 | react 19.2 / vite 7.x / axios 1.7 / json-server 0.17 | CLAUDE.md 约束 + 现代 React 19 兼容 |

---

## 后续子段

- c 章**Class Components 已完结**(本子项目 1/1 子节完成)
- c 章下一节是 **Error boundary**(预计涉及 `componentDidCatch` 静态生命周期 + ErrorBoundary 高阶组件)—— 等用户确认再推进
- 本节**不**推进 part7 d / e 等其他章节
- 本节**不** commit / push
- 本节**不** 跑任何命令

---

**重要纪律**:这一节我**不替你跑任何命令**,所有 `npm install` / `npm run server` / `npm run dev` / `npm run build` / `npm run preview` 都是**你自己手动跑**。如果跑完发现某个期望对不上,告诉我具体 Step + 实际输出,我再排查。

**重要**:本子项目需要**两个并行终端**(json-server + Vite dev),因为课程 verbatim 的 App.jsx 没有 proxy 配置 —— 这是课程故意展示的"老式"做法,不是 bug。