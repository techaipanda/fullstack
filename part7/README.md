# part7 — React Router, hooks, Vite, etc.

对应 Full Stack Open Part 7 章节:<https://fullstackopen.com/en/part7>

课程仓库:<https://github.com/fullstack-hy2020/routed-anecdotes>(从 part1
anecdotes + React Router 改造而来)

## 章节结构(全 part7)

| H2 | 标题 | 内容主线 |
|---|---|---|
| **a** | More about React hooks | useMemo / React.memo / useCallback / custom hooks / 拓展 / 练习 |
| b | Vite internals and esbuild | Vite 构建原理 |
| c | Miscellaneous | Class components / 错误处理等收尾 |
| d | Exercises: extending the bloglist | 全 part7 综合练习 |

> 本目录(`part7/`)按 H2 节展开。`a/` 目录对应 a 节(More about React hooks),
> 依此类推。早期 H2 中含 narrative-only 子段用 README 记录,有代码子段在子目录下
> 建独立 Vite 项目 verbatim 抄录。

---

## a — More about React hooks

a 节 H3 子段(共 7 个,顺序):

1. **React Hooks** ← 本节
2. useMemo
3. React.memo
4. useCallback
5. Custom hooks
6. More about hooks
7. Exercises 7.1.-7.6.

---

### a.1 — React Hooks(narrative-only)

> **本节是 a 节的第一个 H3 子段,纯叙事介绍,无任何代码改动。**
> 以下为课程 verbatim 摘录,方便后续复习。

#### verbatim 段 1 — React 内置 18 个 hooks

> "React offers 18 different built-in hooks, of which the most popular ones are
> the useState and useEffect hooks that we have already been using extensively."

#### verbatim 段 2 — 已学过的 hooks 回顾

> "In part 5 we used the useRef and useImperativeHandle which allowed a
> component to provide access to their functions to other components. In part 6
> we used useContext to implement a global state."

#### verbatim 段 3 — hooks 成为库 API 暴露的标准方式

> "Within the last couple of years, hooks have become the standard way for
> libraries to expose their APIs. Throughout this course we have already seen
> several examples of this: Zustand provides _useStore_ for accessing global
> state, React Router exposes _useNavigate_ and _useParams_ for programmatic
> navigation and URL parameter access, and React Query offers _useQuery_ and
> _useMutation_ for server state management."

#### verbatim 段 4 — Rules of Hooks(react.dev verbatim 引用)

> "Don't call Hooks inside loops, conditions, or nested functions. Instead,
> always use Hooks at the top level of your React function."

> "You can only call Hooks while React is rendering a function component:
> Call them at the top level in the body of a function component.
> Call them at the top level in the body of a custom Hook."

课程还引用 ESLint plugin `eslint-plugin-react-hooks` 来验证 hooks 用法正确性。

#### verbatim 段 5(本节末段,预告 a.2 / a.3 / a.5)

> "Beyond the hooks we have already used, React provides several more built-in
> hooks that are worth knowing. In this section we look at two of them,
> _useMemo_ and _useCallback_ which are both concerned with performance
> optimisation. After that we move on to custom hooks, which let you package
> any combination of hooks into a reusable function of your own."

---

## 关键 takeaway(本节)

- React 18 提供 18 个 built-in hooks(详见 react.dev/reference/react/hooks)
- 已用过(按课程章节顺序):useState, useEffect, useRef, useImperativeHandle,
  useContext, useStore(Zustand), useNavigate + useParams(React Router),
  useQuery + useMutation(React Query)
- Rules of Hooks 复习:
  1. **不要**在 loops / conditions / nested functions 里调 hooks
  2. **只能在** React 渲染函数组件 / custom hook 的**顶层**调
  3. 用 `eslint-plugin-react-hooks` 自动验证
- 接下来(a.2 起)课程会讲 `useMemo` 和 `useCallback`(性能优化),然后是
  custom hooks(自定义 hook 封装复用)

---

## 已有的 part6 关联项目

为 part7 a.5 "Custom hooks" 做准备:

- `../part6/query-notes/src/hooks/useNotes.js` — 已存在的 custom hook 范例
- `../part6/context-counter/src/hooks/useCounter.js` — 已存在的 custom hook 范例
- `../part6/context-counter/README.md` — Context API 笔记

---

## 后续子段

- **a.2 useMemo** — memoization 性能优化(下一个子段)
- **a.3 React.memo** — 组件级 memoization
- **a.4 useCallback** — 函数引用稳定化
- **a.5 Custom hooks** — 抽可复用 hook(本地已有 useNotes / useCounter 范例)
- **a.6 More about hooks** — 拓展细节
- **a.7 Exercises 7.1.-7.6.** — routed-anecdotes 仓库上的 6 道练习
