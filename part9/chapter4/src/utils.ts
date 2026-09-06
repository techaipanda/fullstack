import type { NewDiaryEntry } from './types.ts';
import { Weather, Visibility } from './types.ts';

// part4 b — Validating requests
// ⭐ 核心概念: type guard — 函数返回类型用 `param is Type`,让 TS 在调用方 if 分支内把 param 收窄到 Type
// 写法:        const isString = (text: unknown): text is string => ...
// 效果:        if (!isString(text)) throw ... 之后,TS 知道 text 是 string(不只是 unknown)
// 为什么参数用 unknown: req.body 是 any,但传入 any 后我们用 unknown 强制校验,避免 any 把所有类型检查绕过
// 不用 type guard:  只能用 if (typeof text === 'string') 这种临时判断,函数返回 boolean 不收窄类型,调用方还得再 typeof 一遍
// 验证: hover 在 parseComment 的 comment 参数上,throw 后的 else 分支看到 string,说明 TS 收窄成功
// 关联: parseX 系列函数都依赖 type guard
const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

// part4 b — Validating requests
// 错误策略: 任何字段校验失败立即抛 Error,让路由层 try/catch 统一处理
// 不用返回 undefined/null: 课程原文 throw — 抛错让 catch 块统一拼错误消息,避免每个 parseX 都要 if/else 分支
// 抛什么:   new Error('人类可读消息: ' + 失败值) — 客户端能在响应体看到具体原因
// 关联: routes/diaries.ts POST 的 try/catch 块 catch 后塞进响应
const parseComment = (comment: unknown): string => {
  if (!isString(comment)) {
    throw new Error('Incorrect or missing comment');
  }

  return comment;
};

// part4 b — Validating requests
// Date.parse 返回 timestamp(ms);非日期字符串返回 NaN
// Boolean(NaN) = false,Boolean(timestamp) = true
// 注意: 这种"字符串能否被 Date.parse 解析"的检查比较宽松 — Date.parse('hello') 被拒,Date.parse('2017-01-01') 通过
// ⚠️ 课程原文如此: 不检查"是否是 YYYY-MM-DD 这种严格格式",能挡住明显非法输入就够了
const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

const parseDate = (date: unknown): string => {
  if (!isString(date) || !isDate(date)) {
      throw new Error('Incorrect date: ' + date);
  }
  return date;
};

// part4 b — Validating requests
// ⭐ 核心概念: 用 enum + Object.values 在运行时拿到所有合法值,做白名单校验
// 写法:       Object.values(Weather).map(v => v.toString()).includes(param)
// 拆解:       Object.values(Weather)  → ['sunny','rainy','cloudy','stormy','windy']
//             .map(v => v.toString())  → 把每个值转字符串(enum 值本身就是字符串,但 Object.values 对 enum 返回类型可能是 string|number,所以课程做 toString 兜底)
//             .includes(param)          → 是否在白名单里
// 返回类型:   param is Weather — type guard,把 param 收窄到 Weather 类型
// 关联: parseWeather 调用 isWeather 做白名单校验
const isWeather = (param: string): param is Weather => {
  return Object.values(Weather).map(v => v.toString()).includes(param);
};

const parseWeather = (weather: unknown): Weather => {
  if (!isString(weather) || !isWeather(weather)) {
    throw new Error('Incorrect weather: ' + weather);
  }
  return weather;
};

const isVisibility = (param: string): param is Visibility => {
  return Object.values(Visibility).map(v => v.toString()).includes(param);
};

const parseVisibility = (visibility: unknown): Visibility => {
  if (!isString(visibility) || !isVisibility(visibility)) {
      throw new Error('Incorrect visibility: ' + visibility);
  }
  return visibility;
};

// part4 b — Validating requests
// ⭐ 核心概念: toNewDiaryEntry — 顶层入口,把 unknown body 收窄到 NewDiaryEntry,任何字段错误抛 Error
// 第一道门: typeof object === 'object' + truthy(挡掉 null/undefined/字符串/数字等非对象)
// 第二道门: 'comment' in object && 'date' in object && ... (挡掉字段缺失)
// 收尾:     每个字段单独 parseX(每个 parseX 内部 type guard + 抛错)
// 不用 Object.keys: 课程原文用 'field' in object(更宽松,只要字段存在即可,具体内容由 parseX 进一步校验)
// 验证: POST { "weather":"bogus" } → 抛 'Incorrect weather: bogus' → 路由层 catch 后 400 响应
// 关联: routes/diaries.ts POST handler 的 try/catch
const toNewDiaryEntry = (object: unknown): NewDiaryEntry => {
  if ( !object || typeof object !== 'object' ) {
    throw new Error('Incorrect or missing data');
  }

  if ('comment' in object && 'date' in object && 'weather' in object && 'visibility' in object)  {
    const newEntry: NewDiaryEntry = {
      weather: parseWeather(object.weather),
      visibility: parseVisibility(object.visibility),
      date: parseDate(object.date),
      comment: parseComment(object.comment)
    };

    return newEntry;
  }

  throw new Error('Incorrect data: a field missing');
};

export default toNewDiaryEntry;