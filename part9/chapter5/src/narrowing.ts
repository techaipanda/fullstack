// part5 e — More type narrowing
//
// 课程原文 (line 402-475) 教学目标:
//   - union 类型只能访问所有 member 都有的字段(只有 name/exerciseCount)
//   - 用 literal 属性 (kind) 在 if/switch 里"收窄"类型(discriminated union narrowing)
//   - 用 assertNever 做 exhaustiveness check:新增 course part 类型时,TS 会强制提示
//
// 本节**未实现 React 组件**(用户已跳过 Exercise 9.16);这里给出 3 个独立函数:
//   assertNever    — 课程 line 446-455 verbatim
//   narrowWithIf   — 课程 line 430-438 verbatim(if clause 形式)
//   narrowWithSwitch — 课程 line 422-426 + line 459-462 verbatim(switch + assertNever default)

import type { CoursePart } from './types';

// ─────────────────────────────────────────────────────────────────────────
// assertNever — exhaustive type checking 的核心工具
// 课程原文 (line 446-455):
//   /**
//    * Helper function for exhaustive type checking
//    */
//   const assertNever = (value: never): never => {
//     throw new Error(
//       `Unhandled discriminated union member: ${JSON.stringify(value)}`
//     );
//   };
//
// ⭐ 核心概念: exhaustive type checking + never 类型
//  never 是什么: TS 的 bottom type — "任何类型都不可能是 never 的子类型"
//              反过来: never 可以赋值给任何类型(因为没有任何值存在)
//  为什么参数是 never:
//              - 在 switch 的 default 分支调用,part 已经被前面 case 收窄掉了
//              - 如果所有 case 都覆盖,default 里 part 的类型推算为 never
//              - 此时调用 assertNever(part),TS 检查参数类型 never → never ✓
//  如果忘了某个 case:
//              - default 里 part 的类型变成那个未处理的子类型(不是 never)
//              - 调用 assertNever(part) 报 TS2345 "X is not assignable to never"
//              - 等于"编译器强制提醒你:有 case 漏了"
//  验证:        在 narrowWithSwitch 里删除 'background' 的 case,看 TS 在 default 报 TS2345
//  关联:        课程原文 line 440-474 "exhaustive type checking"
// ─────────────────────────────────────────────────────────────────────────
export const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

// ─────────────────────────────────────────────────────────────────────────
// narrowWithIf — if clause 形式的 discriminated union narrowing
// 课程原文 (line 430-438):
//   courseParts.forEach(part => {
//     if (part.kind === 'background') {
//       console.log('see the following:', part.backgroundMaterial)
//     }
//     // can not refer to part.backgroundMaterial here!
//   });
//
// ⭐ 核心概念: if clause narrowing
//  课程截图 (line 408) 显示:part.exerciseCount 可以访问(所有子类型都有)
//  在 if (part.kind === 'background') 块**外**访问 part.backgroundMaterial → TS 报错
//  因为 CoursePartBasic / CoursePartGroup 没有 backgroundMaterial 字段
//  在 if 块**内**访问 → TS 知道 part 已经被收窄为 CoursePartBackground,可用
//  关联:        课程原文 line 406-417 "TypeScript will only allow an operation if it is valid for every member"
// ─────────────────────────────────────────────────────────────────────────
export const narrowWithIf = (part: CoursePart): string => {
  if (part.kind === 'background') {
    // ✅ 这里 part 已被收窄为 CoursePartBackground,可以访问 backgroundMaterial
    return `Background: ${part.backgroundMaterial}`;
  }
  // ⚠️ 这里如果写 part.backgroundMaterial,TS 报错 TS2339
  //    因为 part 在这条路径上只可能是 CoursePartBasic 或 CoursePartGroup,
  //    而这两个类型都没有 backgroundMaterial 字段
  if (part.kind === 'group') {
    return `Group project count: ${part.groupProjectCount}`;
  }
  // 收窄到 CoursePartBasic
  return `Basic: ${part.description}`;
};

// ─────────────────────────────────────────────────────────────────────────
// narrowWithSwitch — switch case + assertNever default(exhaustive 检查)
// 课程原文 (line 422-426 概念 + line 459-462 default 用法):
//   switch (part.kind) {
//     case 'basic':     return ...part.description;
//     case 'group':     return ...part.groupProjectCount;
//     case 'background': return ...part.backgroundMaterial;
//     default:          return assertNever(part);
//   }
//
// ⭐ 核心概念: switch + assertNever 提供 exhaustiveness 保证
//  对比 if 链: if/else 链也能 narrowing,但漏写一个分支 TS 不会强制提醒
//            switch + assertNever: 漏写分支时,default 里的 part 就不再是 never,
//            assertNever(part) 编译失败 — 编译器替你抓住漏处理
//  什么时候用哪个:
//    - 2-3 个分支且互斥: if 链 + 早 return 即可,简洁优先
//    - 4+ 个分支 / 类型组合将来可能扩展: switch + assertNever,编译器替你兜底
//  验证:        把 'background' 那个 case 注释掉,看 default 报 TS2345
//  关联:        课程原文 line 420-426 "switch case expressions" + line 459-474 exhaustiveness
// ─────────────────────────────────────────────────────────────────────────
export const narrowWithSwitch = (part: CoursePart): string => {
  switch (part.kind) {
    case 'basic':
      return `${part.name} (basic) — ${part.description}`;
    case 'group':
      return `${part.name} (group) — ${part.groupProjectCount} projects`;
    case 'background':
      return `${part.name} (background) — ${part.backgroundMaterial}`;
    default:
      // ⭐ 关键: 如果 CoursePart 新增第四种子类型(比如 'special')但没有对应 case,
      //    这里 part 的类型会变成 CoursePartSpecial,不是 never;
      //    assertNever(part) 报 TS2345 "CoursePartSpecial is not assignable to never"
      return assertNever(part);
  }
};

// ─────────────────────────────────────────────────────────────────────────
// 模块自检 — 让 build 真的执行这些 narrowing 函数,触发任何潜在 TS 错误
// 课程本节不演示 React 组件渲染;为了不污染 App.tsx(那里是 Welcome 三种写法),
// 这里就地构造一个最小数组并运行 narrowWithSwitch,确认类型 + 运行都正确。
//
// ⚠️ 注意: 这只是为了"过 build",不是课程原文要求;课程 line 253-277 给的 4 个数据
// 样本是给 Exercise 9.16 用的,而 9.16 已被用户跳过。这里构造的"代码形状相同"的
// 最小样本,确保 narrowWithSwitch 的 4 种 kind 都被覆盖到。
// ─────────────────────────────────────────────────────────────────────────
const sampleParts: CoursePart[] = [
  {
    name: 'Fundamentals',
    exerciseCount: 10,
    description: 'This is an awesome course part',
    kind: 'basic',
  },
  {
    name: 'Using props to pass data',
    exerciseCount: 7,
    groupProjectCount: 3,
    kind: 'group',
  },
  {
    name: 'Basics of type Narrowing',
    exerciseCount: 7,
    description: 'How to go from unknown to string',
    kind: 'basic',
  },
  {
    name: 'Deeper type usage',
    exerciseCount: 14,
    description: 'Confusing description',
    backgroundMaterial: 'https://type-level-typescript.com/template-literal-types',
    kind: 'background',
  },
];

// 跑一遍,只为了让 build 实际消费这些 narrowing 路径
// (eslint.config.js 当前没启用 no-console 规则,不需要 disable 注释)
console.log(sampleParts.map(narrowWithSwitch).join('\n'));