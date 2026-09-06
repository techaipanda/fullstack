// part4 b — Creating your own types (前置必备)
// 课程原本用 string union,后来改成 enum(Object.values 需要),现在换成 as const object 模式
// ⭐ 核心概念: as const 是 TS 的字面量断言 — 把对象/数组的所有属性变成 readonly 字面量类型
// 写法:        const Weather = { Sunny: 'sunny', ... } as const
// 效果:        TS 把 Weather 推断成 { readonly Sunny: 'sunny'; readonly Rainy: 'rainy'; ... }
//             而不是 { Sunny: string; Rainy: string; ... }
// 为什么用 as const 而不是 enum:
//   - enum 是 TS 独有语法,运行时是 { Weather_Sunny: 'sunny', ... }(编译产物)或反向映射对象
//   - as const 是普通 JS 对象 + 字面量类型,编译产物就是原对象(零运行时开销)
//   - enum 会污染运行时命名空间,as const 不会
//   - 现代 TS 社区倾向 as const,因为更接近 JS 语义
// 关联: utils.ts 的 isWeather 用 Object.values(Weather) 拿所有合法值(运行时存在,和 enum 等价)
// ⚠️ 数据兼容性: as const 对象支持 Weather.Rainy 这样的成员访问,data/entries.ts 不用改
export const Weather = {
  Sunny: 'sunny',
  Rainy: 'rainy',
  Cloudy: 'cloudy',
  Stormy: 'stormy',
  Windy: 'windy'
} as const;

// ⭐ 核心概念: typeof X[keyof typeof X] — 从对象反向推导联合类型
// 拆解:        typeof Weather              → { Sunny: 'sunny', ... } 这个字面量类型(注意:不包含 'Weather' 这个名字)
//              keyof typeof Weather         → 'Sunny' | 'Rainy' | 'Cloudy' | 'Stormy' | 'Windy' (key 的联合)
//              typeof Weather[keyof typeof Weather]
//                                           → Weather['Sunny' | 'Rainy' | ...]
//                                           → 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'windy' (值的联合)
// 为什么这样写:
//   - 不重复定义 union(改 as const 对象时 type 自动跟着变)
//   - 单一事实源:as const 对象既是"值"又是"类型"的来源
// 不用 typeof[keyof typeof]: 要么手写 type Weather = 'sunny' | 'rainy' | ...,要么用 enum
// 验证: hover 在 Weather 类型上看到 'sunny' | 'rainy' | ...(字面量 union)
export type Weather = typeof Weather[keyof typeof Weather];

export const Visibility = {
  Great: 'great',
  Good: 'good',
  Ok: 'ok',
  Poor: 'poor'
} as const;

export type Visibility = typeof Visibility[keyof typeof Visibility];

export interface DiaryEntry {
  id: number;
  date: string;
  weather: Weather;
  visibility: Visibility;
  comment: string;
}

// part4 b — Adding a new diary (前置别名,供 utils.ts 和 service 共享)
// ⭐ 核心概念: 把"新建日记需要哪些字段"提取成命名别名 NewDiaryEntry
// 之前: addDiary 签名里直接写 Omit<DiaryEntry, 'id'> — 类型重复定义 + 改字段两边同步
// 现在: 单独导出 NewDiaryEntry,service.addDiary 和 utils.toNewDiaryEntry 共享同一类型,改一处自动同步
// 验证: hover 在 addDiary 的 entry 参数上,看到 NewDiaryEntry(= DiaryEntry 减 id)
// 关联: services/diaryService.ts 的 addDiary;utils.ts 的 toNewDiaryEntry 返回值
export type NewDiaryEntry = Omit<DiaryEntry, 'id'>;

// part4 b — Utility Types
// ⭐ 核心概念: Omit<T, K> 是 TS 内置的工具类型 (utility type)
// 什么是工具类型: 接受一个类型作为参数,返回一个新类型 — 是"类型的函数"
// 什么是 Omit: 从 T 类型里"剥掉"字段 K(第二个参数是字段名字符串字面量)
// 为什么用 Omit: 客户端不需要看 comment(隐私/敏感),但服务端的 DiaryEntry 必须保留 comment
// 不用 Omit: 要么重复定义一个完全相同的接口,要么把 comment 泄露出去
// 用 Omit: 新类型自动跟着 DiaryEntry 变,加字段时不用两边同步
// 第二个参数语法: 'comment' 是字符串字面量,TS 强制它必须是 DiaryEntry 里存在的字段名(拼错会报错)
// 验证: hover 在 NonSensitiveDiaryEntry 上,IDE 只显示 4 个字段(id/date/weather/visibility),无 comment
// 关联: README chapter4 "Utility Types" 段
export type NonSensitiveDiaryEntry = Omit<DiaryEntry, 'comment'>;