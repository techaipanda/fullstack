// ⭐ schema.js — Apollo Server schema 定义(part8f "Object within an object")
//
// ⭐ 关键诚实声明(本子项目 = part8e 末尾铺垫的伏笔):
//   part8e 末尾核心 takeaway:
//     "嵌套 type 不适用 default resolver(铺垫 part8f)—
//      plain object 上找不到 `address` 字段,Apollo 不能凭空构造,
//      需要自定义"
//   part8f 就是兑现这个伏笔 — 把 street/city 从 Person 平铺字段
//   抽成嵌套的 `address: Address!` 字段。
//
// ⭐ 课程原文核心:
//   "Let's modify the schema a bit"
//     type Address {
//       street: String!
//       city: String!
//     }
//     type Person {
//       name: String!
//       phone: String
//       address: Address!
//       id: ID!
//     }
//   "so a person now has a field with the type Address, which contains
//    the street and the city."
//   "Because the objects saved in the array do not have an address
//    field, the default resolver is not sufficient. Let's add a resolver
//    for the address field of Person type:"
//     const resolvers = {
//       Query: { ... },
//       Person: {
//         address: (root) => {
//           return {
//             street: root.street,
//             city: root.city
//           }
//         }
//       }
//     }
//   "So every time a Person object is returned, the fields name, phone
//    and id are returned using their default resolvers, but the field
//    address is formed by using a self-defined resolver. The parameter
//    root of the resolver function is the person-object, so the street
//    and the city of the address can be taken from its fields."

// ⭐ persons mock 数据(verbatim 课程代码 — 沿用 part8a-e)
// ⭐ 关键:persons 数组里**没有** `address` 字段!
//   这是课程故意为之 — 让你必须给 Person.address 写自定义 resolver
//   否则 Apollo 找不到 address(plain object 上没有这个 key)
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

// ⭐ typeDefs — GraphQL SDL schema(verbatim 课程本节代码改动)
// ⭐ 相对 part8e 的 2 处改动:
//   1. 新增 type Address { street: String!  city: String! }
//   2. Person 去掉 street/city,改 address: Address!
// ⭐ 注意 typeDefs 里 Address 必须先于 Person 定义(GraphQL 不强制但 SDL 习惯)
const typeDefs = /* GraphQL */ `
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
  }
`

// ⭐ resolvers — 课程本节 verbatim(关键改动: Person 块只剩 address)
// ⭐ 课程 line 1145-1198 原文(逐字保留 `(root)` 而非 `_root`):
//
//   const resolvers = {
//     Query: {
//       personCount: () => persons.length,
//       allPersons: () => persons,
//       findPerson: (root, args) =>
//         persons.find(p => p.name === args.name)
//     },
//     Person: {
//       address: (root) => {
//         return {
//           street: root.street,
//           city: root.city
//         }
//       }
//     }
//   }
//
// ⭐⭐⭐ 关键认知 ⭐⭐⭐
//   - name/phone/id **不写** resolver — 让 Apollo 用默认(default resolver)
//   - address **必须**写 resolver — 因为 persons 数组里没有 address 字段
//     Apollo 找不到 key,所以它不会自动从 root.street/root.city 拼成
//     { street, city } 对象 — 必须显式构造
//
// ⭐ root 参数第三种用法场景:
//   - Query 顶层(part8d):undefined
//   - Person 字段平铺(part8e):父对象 person
//   - Person 字段嵌套(part8f):同样是父对象 person — 但你要从中**挑
//     出两个字段** + **重新组合**成 Address 对象返回
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) =>
      persons.find((p) => p.name === args.name),
  },
  // ⭐ 课程本节 Person 块只剩 address(完全 verbatim,不再列 name/phone/id)
  // ⭐ name/phone/id 由 Apollo 自动用 default resolver 处理
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
  },
}

module.exports = { persons, typeDefs, resolvers }
