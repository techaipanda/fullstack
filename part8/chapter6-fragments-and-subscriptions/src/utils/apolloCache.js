// ⭐⭐⭐ apolloCache.js — Chapter 6 子节 2 新建文件(addPersonToCache helper)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件是 Chapter 6 子节 2 新建文件,verbatim 课程 line 1094-1121
//   - 课程原文(per part8e.md line 1087-1092):
//     "Let's solve the problem by ensuring that a person is added to the cache
//      only if they haven't already been added there. At the same time, we'll
//      extract the cache update operation into its own helper function in the
//      *utils/apolloCache.js* file"
//   - 课程原文(per part8e.md line 1094-1121):
//     "import { ALL_PERSONS } from '../queries'
//
//      export const addPersonToCache = (cache, personToAdd) => {
//        cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
//          const personExists = allPersons.some(
//            (person) => person.id === personToAdd.id,
//          )
//
//          if (personExists) {
//            return { allPersons }
//          }
//
//          return {
//            allPersons: allPersons.concat(personToAdd),
//          }
//        })
//      }"
//
// ⭐⭐⭐ 为什么必须提取 helper(per course block 9-10)⭐⭐⭐
//   - 课程原文(per part8e.md line 1075-1084):
//     "However, there is a small problem with the solution. When a new person is
//      added through the application's form, the added person ends up in the
//      cache twice, because both the useSubscription hook and the PersonForm
//      component add the new person to the cache. As a result, the added person
//      is rendered on the screen twice."
//   - useSubscription 的 onData 会触发 cache 更新(per personAdded payload)
//   - PersonForm 的 useMutation 的 update 也会触发 cache 更新(per addPerson response)
//   - 两条路径都更新 ALL_PERSONS → 同一 person 进 cache 两次 → 渲染两次
//
// ⭐ 解决方案(per course block 10-12):
//   - 抽 helper:addPersonToCache(cache, personToAdd)
//   - helper 里先检查 person 是否已在 cache
//   - 在则跳过;不在则 concat
//   - PersonForm 和 useSubscription 都调同一个 helper
//   - 课程原文(per part8e.md line 1075-1076):
//     "One possible solution would be to update the cache only in the useSubscription
//      hook. However, this is not recommended. As a good practice, the user should
//      see the changes they make in the application immediately."
//
// ⭐ 课程的设计哲学(per course block 11):
//   - "the user should see the changes they make in the application immediately"
//   - "The cache update performed by the subscription may happen with a delay
//      and cannot be fully relied upon"
//   - "we will stick with a solution where the cache is updated both in the
//      useSubscription hook and in the PersonForm component"
//   → 课程**故意**让两个地方都更新,但用 helper 去重避免重复

import { ALL_PERSONS } from '../queries'

// ⭐⭐⭐ addPersonToCache helper — verbatim 课程 line 1098-1120 ⭐⭐⭐
//
// ⭐ 课程原文(per part8e.md line 1099-1120):
//   "export const addPersonToCache = (cache, personToAdd) => {
//      cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
//        const personExists = allPersons.some(
//          (person) => person.id === personToAdd.id,
//        )
//
//        if (personExists) {
//          return { allPersons }
//        }
//
//        return {
//          allPersons: allPersons.concat(personToAdd),
//        }
//      })
//    }"
//
// ⭐ 函数签名(cache, personToAdd):
//   - cache:ApolloClient.cache 实例(或 useMutation 拿到的 cache,两者同类型)
//     - PersonForm 调用:useMutation 第 2 个 callback 参数是 cache
//     - App 调用:useApolloClient() → client.cache
//   - personToAdd:要加进 cache 的 Person 对象
//     - 来自 response.data.addPerson 或 subscription payload personAdded
//
// ⭐ cache.updateQuery(per part8z 沿用):
//   - 接受 { query, variables } 找到 cache 中的 query
//   - callback 接受 prevData(本例 { allPersons: [...] })返回 newData
//   - callback 不返回(隐式 undefined)→ cache 不变
//
// ⭐⭐⭐ 关键检查:personExists.some(...)⭐⭐⭐
//   - 课程原文(per part8e.md line 1132-1138):
//     "const personExists = allPersons.some(
//        (person) => person.id === personToAdd.id,
//      )"
//   - Array.some(callback) 找到第一个满足 callback 返回 true 的元素就停
//   - 返回 boolean:true 表示已有,false 表示没有
//
// ⭐ 课程原文(per part8e.md line 1141-1147)对 .some 的解释:
//   "_some_ is a method that searches a collection for an element that matches
//    the given condition. It returns a boolean indicating whether a matching
//    element was found. In our case, the method returns _True_ if the cache
//    already contains a person with that _id_, and otherwise it returns _False_."
//
// ⭐⭐⭐ personExists 分支:return { allPersons }⭐⭐⭐
//   - 课程原文(per part8e.md line 1149-1151):
//     "If the person is already in the cache, we return the cache contents as-is
//      and do not add the person again"
//   - return 同形状对象 → Apollo 识别为"内容未变",**可能**跳过 re-render(但更主要作用是
//     防止 concat 重复 person)
//
// ⭐⭐⭐ 不在分支:return { allPersons: allPersons.concat(personToAdd) }⭐⭐⭐
//   - 课程原文(per part8e.md line 1152-1154):
//     "Otherwise, we return the cache contents with the new person appended using
//      the _concat_ method"
//   - concat 是不可变操作(返回新数组,不修改原数组)
export const addPersonToCache = (cache, personToAdd) => {
  cache.updateQuery({ query: ALL_PERSONS }, ({ allPersons }) => {
    const personExists = allPersons.some(
      (person) => person.id === personToAdd.id,
    )

    if (personExists) {
      return { allPersons }
    }

    return {
      allPersons: allPersons.concat(personToAdd),
    }
  })
}