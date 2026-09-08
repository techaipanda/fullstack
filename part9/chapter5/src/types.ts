// part5 d — Deeper type usage
//
// 课程原文 (line 249-400) 教学目标:
//   - 用 "literal type" 属性 kind 把不同 course part 区分开
//   - 用 union type (|) 把多种 part 合并到 CoursePart 数组
//   - 把公共字段抽到 base interface,然后用 extends 复用
//
// 本节是**纯类型层** — 课程 line 400 结束时不写组件、不写渲染,
//  组件实现留给 Exercise 9.16 (line 480-568;本次按用户指令跳过该 Exercise,
//  直接进入下一节 "More type narrowing" line 402-475,使用这里导出的类型)。

// ─────────────────────────────────────────────────────────────────────────
// 课程原文 (line 286-318 第一版 → line 377-400 第二版):
//   第一版直接定义 3 个 interface (CoursePartBasic/Group/Background),
//   每个都重复声明 name/exerciseCount;第二版抽出 CoursePartBase 后 extends。
//   这里直接给出**最终版**(line 377-400);V1 版本作为概念讲解保留在注释里。
//
//   第一版声明形式(不写代码,只注释):
//     interface CoursePartBasic   { name; exerciseCount; description; kind: "basic" }
//     interface CoursePartGroup   { name; exerciseCount; groupProjectCount; kind: "group" }
//     interface CoursePartBackground { name; exerciseCount; description; backgroundMaterial; kind: "background" }
//     type CoursePart = CoursePartBasic | CoursePartGroup | CoursePartBackground;
//
// ⭐ 核心概念: literal type + discriminated union
//  literal type:        `kind: "basic"` 中的 "basic" 不是 string,而是 TS 的 string literal type
//                        union 时,TS 用 kind 字段作为判别字段(discriminator)
//  discriminated union: 联合类型中每个分支都有共同的 literal 字段(kind)
//                        后续 if (part.kind === "basic") 时,TS 自动收窄类型 —
//                        part.description 可直接访问;else 分支类型变成 CoursePartGroup
//  为什么这样写:        替代运行时的 prop-types;编译器**静态保证**数据形状正确
//  验证:                hover 在 part 上,IDE 根据 kind 字段显示具体子类型
//  关联:                课程原文 line 312-318 "literal type" / "union type"
//
// ⭐ 核心概念: extends (interface inheritance)
//  为什么重构第一版:     大量重复 — name/exerciseCount 每个 interface 都写一遍
//                        抽到 base 后,子 interface 只写"差异化字段"
//  interface vs type:
//                        - interface 可以 extends(name/exerciseCount 从基类继承)
//                        - type 别名虽然能用交叉(&),但 interface extends 更符合 OOP 语义
//  验证:                把 name 改成 number,看 3 个子 interface + CoursePart 都报类型错误
//  关联:                课程原文 line 375-400 "we start by identifying the attributes all course parts have in common"
// ─────────────────────────────────────────────────────────────────────────
interface CoursePartBase {
  name: string;
  exerciseCount: number;
}

interface CoursePartBasic extends CoursePartBase {
  description: string;
  kind: "basic";
}

interface CoursePartGroup extends CoursePartBase {
  groupProjectCount: number;
  kind: "group";
}

interface CoursePartBackground extends CoursePartBase {
  description: string;
  backgroundMaterial: string;
  kind: "background";
}

// 默认导出最终版 CoursePart(对应课程 line 399 的最终状态)
export type CoursePart = CoursePartBasic | CoursePartGroup | CoursePartBackground;
// 把 base + 3 个具名子类型也导出 — 后续 9.16/9.17 会用到(虽然本次跳过 9.16)
export type { CoursePartBase, CoursePartBasic, CoursePartGroup, CoursePartBackground };

// 课程 line 253-277 给出了 4 个数据样本(会被 9.16 用上);
// 这里只导出类型定义,数据样本留到对应 Exercise 再写 — 课程本节不做实现。
// 数据样本(仅注释,不写代码):
//   1. Fundamentals        / 10 / description              / kind: "basic"
//   2. Using props to pass data / 7 / groupProjectCount:3  / kind: "group"
//   3. Basics of type Narrowing / 7 / description          / kind: "basic"
//   4. Deeper type usage   / 14 / description + backgroundMaterial / kind: "background"