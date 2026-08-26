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
| Chapter 2 | Error handling | part8 h — Error handling(`Mutation.addPerson` 加查重 + 抛 `GraphQLError` 带 `extensions.code = 'BAD_USER_INPUT'` + `invalidArgs`)| ✅ 已完结 |
| Chapter 2 | Enum | part8 i — Enum(`enum YesNo { YES NO }` + `Query.allPersons(phone: YesNo)` 加 nullable enum 过滤参数 + resolver 按 `'YES'` / `'NO'` 字符串过滤)| ✅ 已完结 |
| Chapter 2 | Changing a phone number | part8 j — Changing a phone number(`Mutation.editNumber(name, phone): Person` + 不可变 `persons.map` 更新 + 找不到 person 返回 null)| ✅ 已完结 |
| Chapter 2 | More on queries | (待映射 part8 字母) | ⏳ 待规划(combined queries + aliases — Chapter 2 收尾小节)|
| Chapter 3 | Apollo client | **part8 k** — Apollo client(`@apollo/client` + `ApolloClient` + `HttpLink` + `InMemoryCache` + `gql\`\`` + `client.query().then(console.log)` + `ApolloProvider` 包 `<App />` + 走 `@apollo/client/react` 子路径)| ✅ 已完结 |
| Chapter 3 | Making queries | **part8 l** — Making queries(`useQuery(ALL_PERSONS)` Hook 替代 part8k 的 `client.query().then(console.log)` + `result.loading` 判 loading 态 + 抽 `src/components/Persons.jsx` 子组件 + Container/Presentational 雏形)| ✅ 已完结 |
| Chapter 3 | Making queries | (待映射 part8 l) | ⏳ 待规划 |
| Chapter 3 | Named queries and variables | **part8 m** — Named queries and variables(GraphQL query 加 `query findPersonByName(...)` operation name + `$nameToSearch: String!` variables + 在 Persons 子组件里加 `useState(null)` + `useQuery(FIND_PERSON, { variables, skip: !nameToSearch })` 实现"按需发请求" + 抽 `Person` 子组件展示详情 + H3 "Cache" 子段)| ✅ 已完结 |
| Chapter 3 | Doing mutations | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 3 | Updating the cache | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 3 | Handling mutation errors | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 3 | Updating a phone number | (待映射 part8 字母) | ⏳ 待规划 |
| Chapter 3 | Apollo Client and the applications state | (待映射 part8 字母) | ⏳ 待规划(标题是课程原文 typo `applications state`,verbatim 沿用)|
| Chapter 3 | Exercises 8. Authors view / 9. Books view / 10. Adding a book / 11. Authors birth year / 12. Authors birth year advanced | (跳过 — 与 part7 练习策略一致,不做练习题) | ⏭️ 跳过 |
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
- [`h-error-handling/`](./h-error-handling/) — GraphQL Error handling(`Mutation.addPerson` 加查重 + 抛 `GraphQLError('Name must be unique: ...', { extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name } })` — 兑现 part8g Step 9 末尾伏笔,GraphQL 校验的两层防线:Schema 层(自动)vs Resolver 层(手动,业务规则))
- [`i-enum/`](./i-enum/) — GraphQL Enum(`enum YesNo { YES NO }` + `Query.allPersons(phone: YesNo)` nullable enum 过滤参数 + `allPersons` resolver 按 `args.phone === 'YES' ? person.phone : !person.phone` 字符串比较过滤 — 兑现 part8h 伏笔:不是所有业务规则都该抛错,有时候应该软过滤)
- [`j-changing-a-phone-number/`](./j-changing-a-phone-number/) — Mutation Update(`Mutation.editNumber(name, phone): Person` + 不可变 `persons = persons.map(p => p.name === args.name ? { ...person, phone: args.phone } : p)` 更新 + 找不到 person `return null` — 兑现 part8i 伏笔:update semantics + 不可变模式 + 找不到返回 null)
- [`k-apollo-client/`](./k-apollo-client/) — **Chapter 3 第 1 子节**(架构大切换:服务端 → 客户端)— Vite + React + Apollo Client:`npm install @apollo/client graphql` + `new ApolloClient({ link: new HttpLink({ uri: 'http://localhost:4000' }), cache: new InMemoryCache() })` + `gql\`query { allPersons { name phone address { street city } id } }\`` + `client.query({ query }).then(response => console.log(response.data))` + `ApolloProvider` 走 `@apollo/client/react` 子路径包裹 `<App />`。**需要 part8j server 跑着才能验证** — 两个终端,4000(GraphQL server)+ 5173(Vite dev)
- [`l-making-queries/`](./l-making-queries/) — **Chapter 3 第 2 子节**(从命令式 → 声明式)— Vite + React + Apollo Client `useQuery`:删除 main.jsx 的 `client.query(...).then(console.log)` 段 + App.jsx 改 `useQuery(ALL_PERSONS)` + `result.loading` 判 `<div>loading...</div>` + 抽 `src/components/Persons.jsx` Presentational 子组件 + Container/Presentational 雏形。**ApolloProvider 在本章变成强依赖**(注释掉就报"Could not find Apollo Client context")。**需要 part8j server 跑着才能验证** — 同 part8k 双终端
- [`m-named-queries-and-variables/`](./m-named-queries-and-variables/) — **Chapter 3 第 3 子节**(query 命名 + 变量 + 按需发请求)— Vite + React + Apollo Client:**只改 `src/components/Persons.jsx` 一个文件**(课程明示)— GraphQL query 加 `query findPersonByName($nameToSearch: String!)` operation name + variables + Persons 内部 `useState(null)` 管 nameToSearch + `useQuery(FIND_PERSON, { variables: { nameToSearch }, skip: !nameToSearch })` 实现"按需发请求"+ 抽 `Person` 子组件展示单条详情 + 列表每行加 `<button onClick={() => setNameToSearch(p.name)}>show address</button>` 触发切换。**App.jsx / main.jsx / package.json / vite.config.js / index.html / .gitignore 全部沿用 part8l verbatim**(课程本节仅改一个文件)。**H3 "Cache" 子段**:Apollo `InMemoryCache` 按 `query name + variables` 做 cache key,同 key 第二次不发网络请求。**需要 part8j server 跑着才能验证** — 同 part8k/l 双终端

## Chapter 2 → Chapter 3 切换备忘(2026-08-26)

> **重要状态切换**:Chapter 2(Apollo Server,part8a-j 共 10 个子项目)全部完结。下面进入 **Chapter 3: React and GraphQL** — 客户端侧 Apollo Client 接入。
>
> **Chapter 2 与 Chapter 3 的根本区别**:
> - Chapter 2:**服务端**(Node.js + Apollo Server v4 standalone)— 监听端口、暴露 SDL、跑 resolver
> - Chapter 3:**客户端**(浏览器 + React + Apollo Client)— 发 query/mutation、订阅响应、缓存、错误展示
>
> **Chapter 3 关键诚实声明**:
> - 网络/环境限制:本会话无法直接拉 MOOC.fi(超时)+ fullstackopen.com(已 redirect)+ GitHub 镜像(0 hit)— 子节切分需用户协助核对
> - 仍需遵循"verbatim 课程原文"纪律,每个子项目落地前必须从 MOOC.fi 拿到原文
>
> **Chapter 3 子项目命名约定**:沿用 part8a-j 的字母,继续 part8 **k** 起排(Apollo Client 接入通常以 "Apollo Client" 子节打头)
>
> **项目结构预想**:与 part8a-j 单文件 Node.js 不同,Chapter 3 起进入 Vite + React 标准前端工程
> ```
> part8/
> ├── k-apollo-client/      # part8k — 客户端 Apollo Client 接入
> │   ├── package.json      # React + Vite + @apollo/client + graphql
> │   ├── vite.config.js    # Vite 配置(可选)
> │   ├── index.html        # Vite 入口 HTML
> │   ├── src/
> │   │   ├── main.jsx      # React 入口 + ApolloProvider 包裹
> │   │   ├── App.jsx       # 顶层组件 + useQuery
> │   │   ├── queries.js    # gql 模板字符串(query/mutation 定义)
> │   │   └── components/   # 子组件
> │   └── README.md
> ```
>
> **服务依赖**:Chapter 3 子项目要发 query/mutation 到 **Chapter 2 的 server**(part8j 当前)。需要两个终端:① 一个跑 part8j server(端口 4000);② 一个跑 Chapter 3 Vite dev(默认端口 5173)。

## 后续子段

- **不**跳过 part7 c 章剩余子节(用户已确认跳过,从 part8 开始)
- **不** commit / push
- **不** 跑任何命令
- **一次只推进一小节** — 等用户确认 part8a 后再进 part8b
- Chapter 2 → Chapter 3 切换是**架构大切换**:Node.js 单文件 → Vite + React 多文件工程。需要用户从 part8k 起明确"哪个子节先做",且需要 part8j server 在跑才能验证