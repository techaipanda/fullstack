// ⭐ Persons.jsx — part8l "Making queries" 子组件(verbatim 课程)
//
// ⭐ 课程原文(逐字保留):
//   "Separate the display of persons into its own component
//    in the file src/components/Persons.jsx"
//
// ⭐ 关键诚实声明:本文件 = 课程 Step 2 抽出来的 Presentational 组件
//   - 不发请求(不调 useQuery)
//   - 只接 { persons } prop,把数组渲染成 <h2>Persons</h2> + 一列 div
//   - 父组件 App(Container)负责数据,Persons 只负责 UI

// ⭐⭐⭐ Persons 组件 — verbatim 课程 ⭐⭐⭐
//
// 1. 函数组件 + 解构 props — `({ persons })` 直接从 props 拿 persons 字段
//    不用解构会怎样:`function Persons(props) { return <div>{props.persons.map(...)}</div> }` 也行但更啰嗦
//    用解构:直接拿到 persons 变量,代码更清晰
//
// 2. ⭐⭐⭐ React key 警告 ⭐⭐⭐
//    `key={p.id}` — React 要求 list item 有 unique key(用于 diff 算法优化)
//    用 index 作 key:列表不会 reorder 时勉强能用,但**删/插会错位**
//    用 p.id 作 key:稳定 + 唯一(后端返回的 GraphQL id),React 推荐做法
//    验证:故意删掉 key={p.id},React DevTools Console 会报"Each child in a list should have a unique key"
//
// 3. `<div>{p.name} {p.phone}</div>` — 课程最简的渲染
//    后续 part8 章节会改样式(加 CSS class / styled-components / etc.)
//
// ⭐ 课程的 `</div>  )` 末尾有怪空格(verbatim 保留)— 课程 line 588-589 有个尾随空格
const Persons = ({ persons }) => {
  return (
    <div>
      <h2>Persons</h2>
      {persons.map(p =>
        <div key={p.id}>
          {p.name} {p.phone}
        </div>
      )}
    </div>
  )
}

// ⭐ 课程 verbatim — default export
export default Persons