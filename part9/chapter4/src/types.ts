// part4 b — Creating your own types (前置必备,string union → enum)
// 课程在更早的小节把 Weather/Visibility 从 string union 改成了 enum
// ⭐ 核心概念: enum 在运行时是真实 JS 对象 — 这是它和 type union 最本质的区别
// 为什么 union 不行:  type Weather = 'sunny' | 'rainy' | ... 是纯类型层概念,运行时 JS 里不存在,无法枚举
// 为什么 enum 行:      enum Weather { Sunny = 'sunny', ... } 编译后是 var Weather = { Sunny: 'sunny', ... }
//                    Object.values(Weather) 运行时拿到 ['sunny','rainy','cloudy','stormy','windy']
// 关联: utils.ts 的 isWeather 用 Object.values(Weather) 做白名单校验 — enum 是前置依赖
// ⚠️ 数据兼容性: enum 成员值仍是字符串字面量,data/entries.ts 里 weather: 'rainy' 等赋值自动收窄到 enum 成员,不用改
export enum Weather {
  Sunny = 'sunny',
  Rainy = 'rainy',
  Cloudy = 'cloudy',
  Stormy = 'stormy',
  Windy = 'windy'
}

export enum Visibility {
  Great = 'great',
  Good = 'good',
  Ok = 'ok',
  Poor = 'poor'
}

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