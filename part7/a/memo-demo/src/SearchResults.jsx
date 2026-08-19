// ============================================================================
// part7 a.2 useMemo — 占位 SearchResults 组件
// 作用:演示父组件重渲染时,子组件是否会被迫 re-render(由 props 引用决定)
// 关联:对应 README.md 段 7,以及课程 verbatim 代码块 3
//
// a.3 段会:用 React.memo() 包裹这个组件,让 props 引用一致时跳过 re-render
// ============================================================================

const SearchResults = ({ options }) => {
  // 这个 console.log 是有意为之 — 用来观察组件什么时候 re-render
  // - 父组件 App 渲染 → React 会对所有子组件进入 render 阶段
  // - 如果 props 引用变了 → SearchResults 真的会重渲染(看到日志)
  // - 如果 props 引用没变,但没 React.memo → 仍然会重渲染(因为 React 没做浅比较)
  console.log('SearchResults rendered')

  return (
    <div>
      <p>caseSensitive: {String(options.caseSensitive)}</p>
      <p>filter: {options.filter || '(empty)'}</p>
    </div>
  )
}

export default SearchResults
