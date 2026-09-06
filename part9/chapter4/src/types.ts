export type Weather = 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'windy';

export type Visibility = 'great' | 'good' | 'ok' | 'poor';

export interface DiaryEntry {
  id: number;
  date: string;
  weather: Weather;
  visibility: Visibility;
  comment: string;
}

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