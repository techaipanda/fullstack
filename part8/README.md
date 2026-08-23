# part8 — GraphQL(新 MOOC.fi 课程)

> **课程 URL 更新**:课程 Full Stack Open 第 8 部分已迁移到新地址:
> https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-graphql
>
> 老的 https://fullstackopen.com/en/part8 链接仍可访问但不再更新,**新内容以 MOOC.fi 为准**。

## 课程章节(新 MOOC.fi 划分)

| 课程章节 | 标题 | 对应子项目 | 状态 |
|---|---|---|---|
| Chapter 1 | Getting Started | (跳过 — 纯理论) | — |
| Chapter 2 | Apollo Server | part8 a — Apollo Server(v4 standalone)| ✅ 已完结 |
| Chapter 2 | Apollo Studio Explorer | part8 b — Apollo Studio Explorer(观察性小节,无新增代码)| ✅ 已完结 |
| Chapter 2 | Schema syntax highlighting in VS Code | part8 c — Schema syntax highlighting(`/* GraphQL */` + VS Code 扩展)| ✅ 已完结 |
| Chapter 2 | Parameters of a resolver | part8 d — Parameters of a resolver(解释性小节,讲透 `(root, args, context, info)` 4 参数签名)| ✅ 已完结 |
| Chapter 2 | The default resolver | part8 e — The default resolver(兑现 part8d 伏笔:`Person: { name: (root) => root.name, ... }` 5 字段显式 default resolver + partial override)| ✅ 已完结 |
| Chapter 2 | Object within an object | part8 f — Object within an object(嵌套 GraphQL type + `Person.address: Address!` + `Person.address` 自定义 resolver 重新组装 Address)| ✅ 已完结 |
| Chapter 2 | Mutations | part8 g — Mutations(`type Mutation { addPerson }` + `Mutation.addPerson` resolver + `uuid()` 生成 id + `persons.concat(person)` 重赋值)| ✅ 已完结 |
| Chapter 3 | React and GraphQL | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 4 | Database and user administration | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 5 | Login and updating the cache | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 6 | Fragments and subscriptions | (待映射 part8 字母) | ⏳ 待规划 |

## 子项目列表

- [`a-apollo-server/`](./a-apollo-server/) — Apollo Server v4 standalone(verbatim Chapter 2 "Apollo Server" 段)
- [`b-apollo-studio-explorer/`](./b-apollo-studio-explorer/) — Apollo Studio Explorer walkthrough(verbatim Chapter 2 "Apollo Studio Explorer" 段;观察性小节,代码复用 part8a)
- [`c-schema-syntax-highlighting/`](./c-schema-syntax-highlighting/) — VS Code GraphQL 语法高亮(`/* GraphQL */` + `GraphQL.vscode-graphql` 扩展;代码复用 part8a)
- [`d-parameters-of-resolver/`](./d-parameters-of-resolver/) — Resolver 4 参数签名讲解(`(root, args, context, info)` + `args` 形状 + `root` 顶层未用;纯解释性小节,代码复用 part8a)
- [`e-the-default-resolver/`](./e-the-default-resolver/) — Apollo default resolver 机制(`Person: { name: (root) => root.name, phone: (root) => root.phone, ... }` 5 字段全显式 + partial override 示例 — 把 street/city 硬编码为 Manhattan / New York)
- [`f-object-within-an-object/`](./f-object-within-an-object/) — 嵌套 GraphQL type(`type Address { street, city }` + `Person.address: Address!` + 自定义 `Person.address: (root) => ({ street: root.street, city: root.city })` resolver)
- [`g-mutations/`](./g-mutations/) — GraphQL Mutation(`type Mutation { addPerson(name, phone, street, city): Person }` + `Mutation.addPerson: (root, args) => { persons = persons.concat({...args, id: uuid()}); return person }` + `const persons` 改 `let` + `uuid` v1 npm 包)

## 后续子段

- **不**跳过 part7 c 章剩余子节(用户已确认跳过,从 part8 开始)
- **不** commit / push
- **不** 跑任何命令
- **一次只推进一小节** — 等用户确认 part8a 后再进 part8b