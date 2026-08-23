# part7 c — Frontend and backend in the same repository(verbatim 课程子项目)

> **本子项目作用**:把课程 "Frontend and Backend in the Same Repository" 子节里 **5 个 verbatim 代码块**(Repository Layout + server/index.js + client/vite.config.js + root package.json + npm install --prefix 例子)做成**最小可跑的 monorepo**,**外加**一个 ⭐ 课程没给 verbatim 的 `client/src/App.jsx`(只列了文件名,本子项目补一个最小可跑版本)。
>
> **运行方式**:跟之前 c 章子项目不同 —— **单终端**就够了(根 `npm run dev` 用 concurrently 同时拉起 server + client)。

---

## 课程原文要点(verbatim 摘录)

> "Sometimes the entire application is put into a single repository. A common and clean way to do this with a modern stack is to keep the Vite frontend in a _client_ directory and the Express backend in a _server_ directory, each with their own _package.json_. The root of the repository gets a third _package.json_ that acts as a convenience wrapper with scripts to run both together."

> "The _dev_ script uses [concurrently](https://github.com/open-cli-tools/concurrently), a small utility that runs multiple commands at the same time and merges their output into a single terminal stream. Without it you would have to open two separate terminals, one for the backend and one for the frontend."

> "The _\--prefix_ flag tells npm which subdirectory to treat as the working directory for that command, so _npm run dev --prefix server_ is equivalent to _cd server && npm run dev_."

> "Running _npm run dev_ from the root therefore starts both the Vite dev server and Express in parallel with a single command."

> "Running _npm run build_ compiles the frontend into the _client/dist_ directory. After that, _npm start_ sets _NODE\_ENV=production_ and starts Express, which picks up the static files from _client/dist_ and serves both the API and the frontend from a single port. This is the setup you would use when deploying to a server."

> "Because each part of the project has its own _package.json_, you need to be explicit about which one you are targeting when installing new packages. The same _\--prefix_ flag works for _npm install_ as well."

---

## ⭐ 核心概念(本子项目演示的 5 个,均在代码 ⭐ 注释里)

### ⭐ Monorepo 三层结构
- **root** `package.json`:只放 scripts(concurrently 包装器)+ 顶层 dev deps(concurrently)
- **client/** `package.json`:Vite + React + axios
- **server/** `package.json`:Express only

### ⭐ concurrently + `--prefix`
`concurrently "npm run dev --prefix server" "npm run dev --prefix client"` = **单终端并行跑两个子项目**,输出合并到同一终端。`--prefix` 让 npm 把指定子目录当作 cwd。

### ⭐ dev 模式:两个端口 + Vite proxy
- Vite 在 5173,Express 在 3001
- 前端 `axios.get('/api/ping')` → Vite proxy 转发到 3001(同 origin 给浏览器)
- 课程原文:"a frontend fetch to /api/ping is automatically forwarded to the Express server during development"

### ⭐ production 模式:NODE_ENV=production 触发静态文件兜底
- `npm run build` 把 client 编到 `client/dist/`
- `npm start` → Express 同时响应:
  - `/api/*` → API
  - `/assets/*.js|css|...` → client/dist 静态资源
  - `/*splat` → client/dist/index.html(SPA 路由兜底)
- 关键:**同一端口(3001)同进程**服务 API + 前端,**不需要 CORS** 因为 same-origin

### ⭐ SPA 路由兜底:catch-all 返 index.html
`app.get('/*splat', ...)` 让任何"前端路由"(如 `/users/123`)都拿到 `index.html`,然后 React Router 接管。**没这条路由会 404**。

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。本子项目**只需要一个终端** —— 根 `npm run dev` 用 concurrently 同时拉起。

### Step 1 — 安装三层依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part7\c\fullstack-monorepo\app
npm install
npm install --prefix server
npm install --prefix client
```

**期望**:
- 根 `node_modules/`(只有 concurrently)
- `server/node_modules/`(只有 express)
- `client/node_modules/`(react / react-dom / axios / vite / @vitejs/plugin-react)

### Step 2 — dev 模式:单终端拉起 server + client

```bash
npm run dev
```

**期望**:
- 终端出现两段输出(被 concurrently 合并):
  - `[server]` `server running on port 3001`
  - `[client]` `VITE v7.x.x ready in xxx ms ➜ Local: http://localhost:5173/`
- 浏览器访问 `http://localhost:5173`,看到 "loading..." 几百毫秒后切到 "Server says: **pong** at 2026-08-22T..."

### Step 3 — 验证 dev proxy

1. F12 → Network 面板 → 刷新页面
2. 找 `ping` 请求,**期望**:
   - Status 200
   - Request URL: `http://localhost:5173/api/ping`(看起来同源)
   - Remote Address: `localhost:3001` 的端口(**proxy 转发的证据**)
   - Response: `{message: "pong", time: "..."}`

### Step 4 — 验证 NODE_ENV=production 切静态文件

```bash
# 在新终端,先 Ctrl+C 停掉 dev server
npm run build
npm start
```

**期望**:
- `client/dist/` 出现(里面有 `index.html` + `assets/*.js|css`)
- 终端:`server running on port 3001`
- **只**访问 `http://localhost:3001`(不是 5173),看到同样的 React App
- F12 Network 看 `/api/ping` 请求:Remote Address 是 `localhost:3001` 同端口(无 proxy,因为 production 模式不跑 Vite)

### Step 5 — 验证 SPA 路由兜底(可选)

直接在 `http://localhost:3001/任意路径` 访问(比如 `http://localhost:3001/users/123`),**期望**:看到 React App(不是 404)。`/*splat` 把任何非 API/非静态资源请求都重定向到 index.html。

### Step 6 — 验证 `--prefix` 装包

```bash
# 给 client 加 lodash
npm install lodash --prefix client

# 给 server 加 cors
npm install cors --prefix server
```

**期望**:
- `client/package.json` + `client/package-lock.json` 都更新
- `server/package.json` + `server/package-lock.json` 都更新
- 根 `package.json` 不变

**结束**:Ctrl+C(prod server)。dev 模式停两个并发的子进程可能要 Ctrl+C 两次。

---

## ⭐ 课程本节关键术语对照表

| 术语 | 课程原文 | 含义 | 在本子项目哪里 |
|---|---|---|---|
| concurrently | "runs multiple commands at the same time and merges their output" | 单终端并行跑多个 npm script | 根 `package.json` 的 dev 脚本 |
| `--prefix` | "tells npm which subdirectory to treat as the working directory" | 让 npm 把指定目录当作 cwd | 根 `package.json` 所有 scripts 都在用 |
| `/*splat` | Express 5 新路径语法(替代 Express 4 的 `'*'`)| 兜底路由,捕获所有未匹配的 GET | `server/index.js` 生产模式 |
| `NODE_ENV=production` | "Express picks up the static files from client/dist" | 触发 server 同时响应 API + 静态文件 | `npm start` 脚本里 `NODE_ENV=production` 前缀 |

---

## ⭐ 关键 takeaway(5 条)

1. **monorepo ≠ 大单体** —— 三层独立 package.json,各自负责自己范围
2. **`--prefix` 是 npm 的多包管理基础** —— 不仅 `npm run`,`npm install` 也用它
3. **concurrently 省一个终端** —— 真实项目里不一定用它,`tmux` / `pm2` / IDE run config 都是替代方案
4. **production 用同进程同端口** —— 部署时只需要 expose 1 个端口(典型 Fly.io / Railway / Render 友好)
5. **SPA 兜底路由必加** —— 没 `/*splat` catch-all,React Router 的客户端路由直接刷新就 404

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| `client/src/App.jsx` | 课程只列文件名,没给内容 | ⭐ 补一个最小 demo 调用 `/api/ping` | 没它跑不通 + 演示不出 proxy 概念 |
| `client/index.html` | 课程没写 | Vite 模板标准 | 没有它 Vite 找不到入口 |
| `client/src/main.jsx` | 课程没写 | Vite 模板标准 | 没有它 React 不挂载 |
| server `package.json` | 课程没写(只有 index.js)| 写 `dev` / `start` 脚本 + `express` 依赖 | 没有它 `npm run dev --prefix server` 跑不动 |
| client `package.json` | 课程没写(只有 vite.config.js)| 写 Vite + React + axios + scripts | 同上 |
| 根 `.gitignore` | 课程没写 | 加 `node_modules/` + `client/dist/` + 环境变量 | 课程没演示 git,实际项目需要 |
| Express 版本 | 课程没指定 | `^5.0.1`(为了 `/*splat` 语法)| Express 4 不支持 `/*splat`,只支持 `'*'` |
| package 版本 | 课程未指定 | react 19.2 / vite 7.x / axios 1.7 / concurrently 8 / express 5 | CLAUDE.md 约束 + 课程语法需求 |
| `cross-env` 包 | 课程 verbatim 用 bash 语法 `NODE_ENV=production npm start` | 改用 `cross-env NODE_ENV=production npm start` + 装 `cross-env@^7.0.3` devDep | **Windows cmd.exe 不认 bash 语法** —— 直接跑会报 `'NODE_ENV' is not recognized`;cross-env 是跨平台标准做法,概念不变(都是"设 env var + 跑命令")|

---

## ⚠️ Windows 注意事项(只对你这台机器有效)

本子项目在 macOS / Linux 上可以**严格按课程 verbatim** 跑(包括 `NODE_ENV=production npm start`),但本机是 Windows,cmd.exe 不支持 bash 风格的 `VAR=value command` 语法。已经做了**最小修复**:

- 根 `package.json` 的 `start` 脚本从 `NODE_ENV=production npm start --prefix server` 改成 `cross-env NODE_ENV=production npm start --prefix server`
- 根 devDependencies 加了 `cross-env@^7.0.3`

**概念 100% 不变**:cross-env 只是让 "在调用子进程前设置 env var" 这件事在 Windows / macOS / Linux 都工作。如果你以后切到 macOS / Linux,这行依然工作(只是 cross-env 变成 noop 透传)。

---

## 后续子段

- c 章**Frontend and backend in the same repository 已完结**(3/7 子节)
- c 章下一节是 **Organization of code in React application** —— 等用户确认再推进
- 本节**不**推进 part7 d / e 等其他章节
- 本节**不** commit / push
- 本节**不** 跑任何命令

---

**重要纪律**:这一节我**不替你跑任何命令**,所有 `npm install` / `npm install --prefix <x>` / `npm run dev` / `npm run build` / `npm start` 都是**你自己手动跑**。如果跑完发现某个期望对不上,告诉我具体 Step + 实际输出,我再排查。

**关键新模式**:本子项目是 part7 c 第一个**同时有后端**的子项目 —— 之前 Class Components 用 json-server mock,这里用真实 Express。要看 Express console 日志请留意 root `npm run dev` 终端的 `[server]` 前缀。