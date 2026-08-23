// ⭐ schema.js — Apollo Server schema 定义(本子项目 part8d 跟 part8a 几乎一样)
//
// ⭐ 关键诚实声明(本子项目 = 解释性小节):
//   本节"Parameters of a resolver" 的 verbatim 课程**没有新增代码块**。
//   课程只是把 part8a 的 findPerson resolver 单独拎出来讲解:
//     - 第二个参数 args = GraphQL query 里的参数
//     - 第一个参数 root = "父对象"(本节 root 用不到,part8e "Default resolver" 才会用)
//     - 所有 resolver 都有 4 个参数:(root, args, context, info)
//     - JS 允许省略用不到的参数
//
// ⭐ 本子项目 schema.js 与 part8a 的唯一差异:
//   在 resolvers 对象上方加了一段 ⭐ 中文注释,讲透 4 参数签名
//   — 这是本节"实质内容",因为课程只有 prose 解释 + 2 个小代码块,
//     没有任何 schema-level 改动

// ⭐ persons mock 数据(verbatim 课程代码 — 沿用 part8a)
const persons = [
  {
    name: 'Arto Hellas',
    phone: '040-123543',
    street: 'Tapiolankatu 5 A',
    city: 'Helsinki',
    id: '3d594650-3436-11e9-bc57-8b80ba54c431',
  },
  {
    name: 'Mary Popup',
    phone: '040-432342',
    street: 'Mannerheimintie 100',
    city: 'Helsinki',
    id: '3d594670-3436-11e9-bc57-8b80ba54c431',
  },
]

// ⭐ typeDefs — GraphQL SDL schema(verbatim 课程代码 — 沿用 part8a)
const typeDefs = /* GraphQL */ `
  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }
`

// ⭐ resolvers — Query 字段实现(verbatim 课程代码 — 沿用 part8a)
//
// ⭐⭐⭐ 本节(part8d)讲解的"Parameters of a resolver" 核心 ⭐⭐⭐
//
// 课程原文:
//   "The query fetching a single person ... has a resolver which differs
//    from the previous ones because it is given two parameters:
//        (root, args) => persons.find(p => p.name === args.name)
//    The second parameter, args, contains the parameters of the query.
//    The resolver then returns from the array persons the person whose
//    name is the same as the value of args.name.
//    The resolver does not need the first parameter root.
//    In fact, all resolver functions are given four parameters.
//    With JavaScript, the parameters don't have to be defined if they
//    are not needed. We will be using the first and the third parameter
//    of a resolver later in this part."
//
// ⭐ 课程明示:"all resolver functions are given FOUR parameters"
//   完整签名(GraphQL spec):
//     (root, args, context, info) => { ... }
//
//   参数          在本节用没用   含义
//   ----------    -----------    ---
//   root          ❌ 没用        父对象(本节 Query 顶层没"父对象"概念,personCount/allPersons/findPerson 返回值才有"父对象"概念)
//   args          ✅ 用了         GraphQL query 的参数对象,key = 参数名,value = 参数值
//                                    例:findPerson(name: "Arto") → args = { name: "Arto" }
//   context       ❌ 没用        跨 resolver 共享的数据(当前登录用户、DB 连接等),通常由 server 启动时注入
//                                    课程后续章节会用到(Part 5 Login / Part 6 Fragments 之前)
//   info          ❌ 没用        GraphQL 执行元信息(查询 AST、字段名、路径等)— 高级调试用,日常用不到
//
// ⭐ JS 允许省略参数:
//   personCount: () => persons.length                 — 完全没参数
//   allPersons: () => persons                          — 完全没参数
//   findPerson: (root, args) => persons.find(...)   — 用到第 1、2 个
//
// ⭐ 注意:personCount/allPersons 也可以写成 (root, args, context, info) => — JS 不会报错,
//   但没必要。声明用到的参数即可。
//
// ⭐ 下节预告:part8e "The default resolver" 会演示 root 参数的实际用途 —
//   Person 类型的字段(resolvers.Person.name / phone / street / city / id)
//   会用 root 拿到 person 对象,然后取字段值返回。
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
}

module.exports = { persons, typeDefs, resolvers }