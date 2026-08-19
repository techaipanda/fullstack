# part7 a.2 — useMemo

**GateGuard 4-item**:无 importer · 纯 markdown 学习笔记 · 用户指令 "继续推进 useMemo"

对应 Full Stack Open part7 a.2 子段(锚点 `#usememo`):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#usememo>

## 段 1 — 引入:每次 re-render 整段函数体都重跑

> "Every time a React component re-renders, the entire function body runs again."

## 段 2 — 引入例子:按搜索词过滤的大列表

> "Consider a component that renders a large list of items filtered by a search term:"

### 代码块 1 — 无 useMemo 的 `FilteredList`(verbatim)

```javascript
import { useState } from 'react'

const expensiveCalculation = () => {
  let sum = 0
  for (let i = 0; i < 100000; i++) sum += i
  return sum
}

const ITEMS = Array.from({ length: 10000 }, (_, i) => `item ${i + 1}`)

const FilteredList = () => {
  const [filter, setFilter] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  console.log('filtering...')
  const filtered = ITEMS.filter(item => {
    expensiveCalculation()
    return item.includes(filter)
  })

  return (
    <div style={{ background: darkMode ? '#333' : '#fff' }}>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="filter items"
      />
      <button onClick={() => setDarkMode(!darkMode)}>toggle dark mode</button>
      <ul>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export default FilteredList
```

## 段 3 — 问题:点 dark mode 按钮也会重过滤

> "The problem of the component is that clicking the dark mode button would re-filter
> the entire list even though `filter` didn't change."

(实际看到 console 反复打印 `filtering...`,即使输入框没动、只切 dark mode,
每次切都重跑 `ITEMS.filter` + `expensiveCalculation`。)

## 段 4 — 解决方案:用 `useMemo`

> "We can fix this with useMemo:"

### 代码块 2 — 用 `useMemo` 的 `FilteredList`(verbatim,课程原文末尾 `//...` 是省略号)

```javascript
import { useState, useMemo } from 'react'
const FilteredList = () => {
  const [filter, setFilter] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const filtered = useMemo(() => {
    console.log('filtering...')
    return ITEMS.filter(item => {
      expensiveCalculation()
      return item.includes(filter)
    })
  }, [filter])
  return (
    <div style={{ background: darkMode ? '#333' : '#fff' }}>
      //...
    </div>
  )
}
```

> 实际 `src/FilteredList.jsx` 把 `//...` 还原成完整 JSX(见 README 末尾"verbatim 偏离说明")。

## 段 5 — 用 useMemo 的效果

> "With useMemo, the expensive filtering only runs when filter changes."

(切 dark mode 不再触发 `filtering...` 日志;改输入框才触发。)

## 段 6 — dependency array 跟 `useEffect` 一样

> "The dependency array works exactly like the one in useEffect:
> React compares each value to the previous render."

## 段 7 — 进阶:用 useMemo memoize 对象/数组 props

> "useMemo can also be used to memoize objects and arrays passed as props, preventing
> unnecessary re-renders of child components that use reference equality."

### 代码块 3 — `App` 用 `useMemo` memoize options 对象(verbatim)

```javascript
const App = () => {
  const [filter, setFilter] = useState('')

  // Without useMemo, 'options' is a new object on every render even if filter hasn't changed
  const options = useMemo(() => ({ caseSensitive: false, filter }), [filter])
  return <SearchResults options={options} />
}
```

> 没有 useMemo 时,即使 `filter` 没变,`options` 也是新对象(引用不同),
> `SearchResults` 会因为 prop reference 变了而 re-render。

## 段 8 — useMemo 是性能优化,不是默认

> "useMemo is a performance optimisation, you should not reach for it by default.
> Premature memoisation adds complexity without benefit when the computation is fast.
> Measure first, and only add useMemo when you have confirmed that a particular
> calculation is a bottleneck."

---

## 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | `useMemo(() => fn, deps)` 只在 `deps` 变化时重跑 `fn`,否则返回上次缓存 |
| 2 | `deps` 数组语义跟 `useEffect` 一样 — React 比较新旧值 |
| 3 | useMemo 可用来 memoize **对象/数组** props,稳定引用以避免子组件 re-render |
| 4 | **不要默认用** — 是性能优化,先 measure 确认瓶颈再加 |
| 5 | 计算很快时,加 useMemo 反而引入复杂度,没收益 |

## 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/FilteredList.jsx` | 把代码块 2 末尾 `//...` 还原成完整 JSX(div/input/button/ul) | 省略号在可运行代码里无法编译;JSX 与代码块 1 完全一致 |
| `src/App.jsx` | 顶部补 `import { useState, useMemo } from 'react'; import FilteredList from './FilteredList.jsx'; import SearchResults from './SearchResults.jsx';` | 课程代码块 3 没给 imports,补上后可运行 |
| `src/App.jsx` | 在 `useMemo` 之外加了 h1 + input + 包裹 SearchResults/FilteredList 的 JSX | 课程代码块 3 只展示 `useMemo` 那行;补成完整组件才能在浏览器看到效果 |
| `src/SearchResults.jsx` | 完整实现占位组件(展示 caseSensitive + filter) | 课程只提到 `<SearchResults options={options} />`,没给实现;占位以让浏览器有输出 |

## 项目结构

```text
part7/a/memo-demo/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── FilteredList.jsx
    ├── SearchResults.jsx
    ├── index.css
    └── main.jsx
```

## 运行

```bash
cd part7/a/memo-demo
npm install
npm run dev
```

打开浏览器 console,操作:
1. 在输入框打字 → 看到 `filtering...` 日志
2. 点 "toggle dark mode" → **不再**看到 `filtering...`(useMemo 缓存)
3. 切回输入框 → 再次看到 `filtering...`(filter 变化)

## a.3 — React.memo

对应 Full Stack Open part7 a.3 子段(锚点 `#reactmemo`):

> <https://fullstackopen.com/en/part7/more_about_react_hooks#reactmemo>

### 段 1 — 引入:React.memo 缓存整个组件的渲染输出

> "While useMemo caches the result of a calculation inside a component, React.memo
> takes a different angle: it caches the rendered output of an entire component.
> React.memo is not a hook but a higher-order component, and we cover it here
> because it complements useMemo well. When a component is wrapped in React.memo,
> React skips re-rendering it if its props have not changed since the last render."

### 段 2 — 浅比较

> "Without React.memo, MyComponent re-renders every time its parent renders, even
> if value is the same. With it, React compares the old and new props using
> shallow equality, and only re-renders when something has actually changed."

### 段 3 — React.memo 只对 props 浅比较

> "Note that React.memo only checks props. If the component uses a context value
> or its own state, it will still re-render when those change."

### 段 4 — 跟 useMemo 天然配对

> "React.memo pairs naturally with useMemo that prevents expensive calculations
> from re-running, while React.memo prevents the component itself from re-rendering."

### 段 5 — 失效场景:新函数/对象引用每次都变

> "If a memoised component receives a new function or object reference on every
> render, the memoisation is defeated, which is where useCallback comes in."

### 课程 verbatim 代码块 — MyComponent

```javascript
const MyComponent = React.memo(({ value }) => {
  console.log('rendered')
  return <div>{value}</div>
})
```

> 实际 `src/MyComponent.jsx` 用 React 17+ `import { memo }` 替代 `React.memo`,
> 拆成 `MyComponentBase` + `memo()` 包裹两步,方便加中文注释。

### 关键 takeaway

| 编号 | takeaway |
|---|---|
| 1 | `React.memo` **不是 hook**,是 Higher-Order Component(HOC) |
| 2 | `React.memo` 默认对 props 做 **shallow equality**(对象/数组比引用) |
| 3 | 字符串/数字等 primitive 自动值比较 |
| 4 | 跟 `useMemo` 天然配对:useMemo 稳定 props 引用,memo 跳过组件 render |
| 5 | **失效场景**:函数/对象 props 每次都新建 → memo 永远 fail → 用 a.4 `useCallback` 解决 |
| 6 | React.memo 只对 props 浅比较 — context / 自身 state 变化仍然会 re-render |

### 本地源码 vs 课程 verbatim 偏离说明

| 文件 | 偏离 | 原因 |
|---|---|---|
| `src/MyComponent.jsx` | `import { memo } from 'react'` 替代 `React.memo` | React 17+ 推荐 named import |
| `src/MyComponent.jsx` | 拆成 `MyComponentBase` + `memo()` 包裹两步 | 方便在 Base 上加注释 |
| `src/SearchResults.jsx` | 用 `memo()` 包裹整个组件(课程未提及) | 演示"配对 useMemo + React.memo" |
| `src/App.jsx` | 加 `other` 独立 state + 按钮 "bump unrelated state" | 验证:无关 state 变化时,React.memo 包裹的子组件不重渲染 |
| `src/App.jsx` | 加 `myValue = useMemo(() => ..., [filter])` | 演示 primitive props + useMemo 配对 |

### 验证步骤(README 末尾"运行"段后插)

打开浏览器 console,操作:
1. 在输入框打字 → 看到 `SearchResults rendered` + `MyComponent rendered` + `filtering...`
2. 点 "bump unrelated state" 按钮 → **看不到** `SearchResults rendered`、`MyComponent rendered`
   (因为 props 引用都没变,React.memo 跳过它们)
3. 但 `filtering...` 不触发(因为跟 useMemo 缓存)
4. 再次输入框打字 → 看到 `SearchResults rendered` + `MyComponent rendered`(options 引用变了)

---

## 后续子段

- **a.4 useCallback** — 跟 useMemo 配对,稳定函数引用,让 React.memo 不再失效
- a.5 Custom hooks(本地已有 `useNotes` / `useCounter` 范例)
- a.6 More about hooks
- a.7 Exercises 7.1.-7.6.
