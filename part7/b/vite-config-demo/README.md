# part7 b — Vite configuration(verbatim 课程子项目)

> **本子项目作用**:把课程 "Vite configuration" 子节里 10+ 个独立配置选项中**最 Vite-only 的 3 个**,做成一个最小可跑的 Vite 项目:
> 1. **`server.proxy`** —— dev 期跨端口请求转发(免 CORS)
> 2. **`.env` + `VITE_` 前缀** —— 浏览器可见的环境变量 + `import.meta.env`
> 3. **`build.sourcemap`** —— 生产构建产物的源码可追溯性
>
> 课程是**参考目录式**叙述,没有指定目标项目 — 这次选最核心的3个做成可跑子项目,其余7+ 个配置留在 README 里以课程原貌摘录 + ⭐ 注释。

---

## 课程原文要点(verbatim 摘录)

> "For most React projects, Vite works without any configuration at all. However, when you do need to customize behavior, you edit vite.config.js (or vite.config.ts)."

> "The @vitejs/plugin-react plugin enables JSX transformation, fast refresh (hot module replacement that preserves component state), and other React-specific features."

> "When developing locally, your React app typically runs on one port (e.g., 3000) while your backend runs on another (e.g., 3001). The browser's same-origin policy would normally block requests between them. Vite's proxy setting solves this without requiring CORS configuration on the backend."

> "Vite has built-in support for environment variables using .env files. This is the modern replacement for manually injecting constants into the bundle."

> "Important: all environment variables exposed to the browser must be prefixed with VITE_. Variables without this prefix remain server-side only and are not included in the bundle. This is a deliberate security measure to prevent accidentally leaking secrets."

> "Vite automatically selects the correct .env file based on the mode: npm run dev uses .env and .env.development, npm run build uses .env and .env.production."

> "Vite handles code transpilation automatically. During development, esbuild transpiles your TypeScript and JSX on demand. During production builds, Rollup handles the bundling while esbuild handles transpilation."

> "The default transpilation target in Vite is modern browsers that support native ES modules (Chrome 87+, Firefox 78+, Safari 14+, Edge 88+). If you need to support older browsers, you can configure the target explicitly and add the @vitejs/plugin-legacy plugin."

> "When running npm run build, Vite minifies the output. Vite uses esbuild for JavaScript minification and a built-in CSS minifier for stylesheets."

> "Note that production source maps increase build time and expose your source code to anyone who looks at the network tab. In many cases it is better to upload source maps to an error monitoring service (such as Sentry) and keep them off the public server."

---

## ⭐ 核心概念(本子项目演示的3个,所有 ⭐ 注释都在 vite.config.js / .env / App.jsx 里)

### ⭐ server.proxy —— 课程原文配置 verbatim 在 `vite.config.js`

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

- **不用**:前端 `fetch('http://localhost:3001/api/notes')` → 浏览器报 CORS 错
- **用**:前端 `fetch('/api/notes')` → 浏览器以为是同源 → Vite dev server 转发到 `localhost:3001/api/notes`
- 课程原文重点:**不需要后端配 CORS**

### ⭐ .env + VITE_ 前缀 —— 课程 verbatim 在 `.env` + `.env.production`

```
# .env
VITE_BACKEND_URL=http://localhost:3001/api/notes

# .env.production
VITE_BACKEND_URL=https://myapp.fly.dev/api/notes
```

- **不用 VITE_ 前缀**:`import.meta.env.BACKEND_URL` = `undefined`(Vite 故意不注入非 VITE_ 变量,防止 SECRET 泄露)
- **用 VITE_ 前缀**:`import.meta.env.VITE_BACKEND_URL` = 字符串值
- 课程原文重点:**这是有意的安全措施**

### ⭐ build.sourcemap —— 课程原文配置 verbatim 在 `vite.config.js`

```js
build: {
  sourcemap: true,
},
```

- 不用:生产 `dist/assets/*.js` 单行压缩,报错栈指向 dist 行号,几乎不可调试
- 用:同时生成 `.map` 文件,浏览器报错栈指向 `src/App.jsx`
- ⚠️ 课程警告:**生产环境要么不上线 .map,要么把 .map 上传到 Sentry 后从 public 端删除**(暴露源码)

---

## ⭐ 手动验证清单(请你自己跑,我不动手)

> **纪律**:Claude 不替你跑任何命令。

### Step 1 — 安装依赖

```bash
cd D:\workspace\fullstack_workspace\fullstack\part7\b\vite-config-demo
npm install
```

**期望**:`node_modules/` 出现,`package-lock.json` 出现。安装的依赖:react / react-dom / vite / @vitejs/plugin-react。

### Step 2 — 跑 dev server,验证 .env 注入

```bash
npm run dev
```

**期望**:
- 终端:`VITE v7.x.x  ready in xxx ms` + `➜  Local:   http://localhost:5173/`
- 浏览器访问 `http://localhost:5173`,看到:
  > "0 notes on server http://localhost:3001/api/notes"
- **验证概念 2**:`http://localhost:3001/api/notes` 字面量来自 `.env` 的 `VITE_BACKEND_URL`
- **手动改 .env**:`VITE_BACKEND_URL=__changed__` → 浏览器**不用刷新**,Vite 自动 HMR 更新页面文本
- **手动改 .env 但去掉 VITE_ 前缀**:`BACKEND_URL=__hidden__` → 浏览器上仍然显示 `http://localhost:3001/api/notes`(因为没有 VITE_ 前缀不被注入)

### Step 3 — 验证 proxy 字段(可选)

Proxy 在没有真实后端时验证不到。你需要:
- 跑一个 mock 后端在 3001 端口(任意 json 响应)
- 浏览器 devtools Network 面板看 `/api/notes` 这条请求的 Remote Address 会显示 Vite proxy 转发的目标
- 如果没真实后端,跳过这步也 OK — vite.config.js 里的配置是 1:1 课程 verbatim,跑起来不会报错

### Step 4 — build 验证 sourcemap + .env.production

```bash
npm run build
```

**期望**:
- `dist/` 出现
- `dist/assets/*.js.map` 出现(**验证概念 3**)
- 打开 `dist/assets/*.js`,单行压缩;但浏览器报错时栈指向 `src/App.jsx`
- 产物里搜 `http://localhost:3001` 搜不到,但搜 `https://myapp.fly.dev` 能找到(**验证概念 2 的生产模式** —— Vite 选了 `.env.production`)

### Step 5 — 手动制造报错验证 sourcemap

修改 `src/App.jsx` 加一行 `throw new Error('test')`,重新 `npm run build` + `npm run preview`,浏览器 console:
- 报错栈第一行指向 `src/App.jsx`,不是 `dist/assets/index-xxxx.js`

**结束 dev/preview server**:Ctrl+C。

---

## ⭐ 课程本节还讲到的其他配置(本子项目没演示,留作后续参考)

| 配置 | 课程内容 | 没演示原因 |
|---|---|---|
| `server.port / open` | 配置 dev server 端口 + 自动开浏览器 | 太 trivial |
| `@vitejs/plugin-legacy` | 老浏览器 polyfill + 单独 bundle | 装一个新插件会复杂化本子项目,留给你后续 part7 章节 |
| CSS Modules(`.module.css`)| 自动 scoped CSS | 需要额外 CSS 文件 |
| Sass | `npm i --save-dev sass` 即用 | 同上 |
| `build.target` | 配置浏览器兼容目标 | 默认值对现代项目够用 |
| `defineConfig` 类型提示 | TS 项目里给 vite.config.ts 加类型 | 本子项目用 .js |

---

## ⭐ 关键 takeaway(5 条)

1. **Vite 大部分项目零配置**,只在需要时才动 `vite.config.js`
2. **`server.proxy` 是 dev 期最常见的"省 CORS 配置"手段**
3. **`.env` 的 VITE_ 前缀是有意安全设计** —— 别试图绕过(改源码 + 关 build 都是反模式)
4. **`build.sourcemap` 默认关**(生产会暴露源码),需要调试时手动开,或者把 .map 上传到 Sentry
5. **Vite dev 用 esbuild 做转译,Vite build 用 Rollup 做打包 + esbuild 做转译** —— 上一章学的 esbuild 概念在 Vite 里 100% 复用

---

## 偏离课程原文的地方(明示)

| 维度 | 课程原文 | 本子项目 | 偏离原因 |
|---|---|---|---|
| 范围 | 课程列 10+ 配置参考 | 本子项目只演示 3 个最核心 | "新建子项目"决定要可跑,10+ 配置会让 vite.config.js 变成百科 |
| App.jsx useNotes | 课程假设来自 part7/c | 文件底部内联极简 stub `useNotes = () => []` | 不引入网络层 + 让 JSX 不报错;stub 标注 ⭐,明示破例 |
| 包版本 | 课程原页未指定 | react 19.2 / vite 7.x(本仓库现有版本) | CLAUDE.md 约束:react 19 + vite 7 |
| `index.html` title | 课程未指定 | "vite-config-demo" | 默认项目名 |

---

## 后续子段

- b 章**已完结**。下一章节通常转到 part7 c(React Router 相关)— 等用户确认再推进。

---

**重要纪律**:这一节我**不替你跑任何命令**,所有 `npm install` / `npm run dev` / `npm run build` / `npm run preview` 都是**你自己手动跑**。如果跑完发现某个期望对不上,告诉我具体 Step + 实际输出,我再排查。