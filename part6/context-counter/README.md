# part6 — Context API (counter app)

对应 Full Stack Open Part 6 "React Query, custom hooks and context" 章节下
**Context API** 段的最终练习项目。课程原仓库:
<https://github.com/fullstack-hy2020/context-counter>

本地 verbatim 1:1 抄录(不创建 TanStack Query 那部分代码 — 那是 part6 的
另一 H2,放在 `../query-notes/`)。

## 运行

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build      # 35 modules, ~194 kB / gzip 61 kB
npm run lint       # ⚠️ 需要先修 eslint.config.js 的 flat config 包装
```

## 文件结构

```
src/
├── main.jsx                # Vite 入口,StrictMode 包 CounterContextProvider + App
├── App.jsx                 # 8 行纯渲染容器:Navbar + Panel + Footer
├── CounterContext.jsx      # createContext + useState + Provider(暴露 4 个值/函数)
├── hooks/
│   └── useCounter.js       # thin wrapper: useContext(CounterContext)
└── components/
    ├── Navbar.jsx          # inline style,显示 "counter app"
    ├── Panel.jsx           # 包 Display + Controls(verbatim 多 import 一个未用的 Navbar)
    ├── Display.jsx         # 取 counter 值
    ├── Controls.jsx        # 3 个按钮:plus / minus / zero
    └── Footer.jsx          # inline style,显示 "Full Stack Open 2026"
```

## Which state management solution to choose?

> **本节是 Context API 段最后的 H2 子段,纯叙事、无代码改动。**
> 以下是课程 verbatim 1:1 摘录,方便后续复习。

### verbatim 段 1 — 简单应用起步

> "For a simple application, _useState_ is certainly a good starting point. If the
> application communicates with a server, the communication can be handled in the
> same way as in chapters 1-5, using the application's own state. Recently,
> however, it has become more common to move the communication and associated
> state management at least partially under the control of TanStack Query (or
> some other similar library). If you are concerned about useState and the prop
> drilling it entails, using context may be a good option. There are also
> situations where it may make sense to handle some of the state with useState
> and some with contexts."

### verbatim 段 2 — Redux 与 Zustand

> "For a long time, the most popular and comprehensive state management solution
> has been Redux, which is a way to implement the so-called Flux architecture.
> Redux is, however, known for its complexity and abundance of boilerplate code,
> which has been the motivation for newer state management solutions. In this
> course material, Redux has been replaced by the Zustand library, which
> provides equivalent functionality with a considerably simpler API. Zustand has
> become a popular choice especially when you need more than what useState
> offers, but the full Redux machinery feels excessive. Some of the criticism
> directed at Redux's rigidity has become outdated thanks to the Redux Toolkit,
> and Redux is still widely used, especially in larger projects."

### verbatim 段 3 — 不必全局统一

> "Neither Zustand nor Redux has to be used throughout the entire application.
> It may make sense, for example, to manage form state outside of them, especially
> in situations where the form state does not affect the rest of the application.
> Using Zustand or Redux together with TanStack Query in the same application is
> also perfectly possible."

### verbatim 段 4 — 末段(本节收尾)

> "The question of which state management solution to use is not at all
> straightforward. It is impossible to give a single correct answer, and it is
> also likely that the chosen solution may turn out to be suboptimal as the
> application grows, requiring the approach to be changed even if the
> application has already been put into production."

## 关键区分(课程 §key distinction 段)

- **TanStack Query** 是 _server-state library_,负责管理 server ↔ client 的异步操作
- **Context / Zustand / Redux** 是 _client-state library_,可以存任何数据
  (包括异步数据,但不是为这个设计的)

## 决策对照表(本地学习用,非课程原话)

| 场景 | 建议 |
|---|---|
| 简单本地状态(单个组件) | `useState` |
| 简单本地状态(几个兄弟组件) | `useState` + props |
| 跨整棵树共享的同步值(theme / locale / counter) | `Context API` |
| 跨整棵树共享的复杂 client state(表单 wizard / 多步流程) | Zustand |
| 大型 client state,多人协作,严格规范 | Redux + Redux Toolkit |
| 任何 server 通信(GET / POST / cache / retry) | **TanStack Query** |
| 表单状态(影响仅限表单本身) | 留在 useState,别上升 |

## 后续

下一节是 **Exercises 6.20-6.22**,把 Context + useReducer 应用回 `../query-notes/`。