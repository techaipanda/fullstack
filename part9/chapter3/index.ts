import express from 'express';
import { calculator, Operation } from './calculator';
const app = express();

app.use(express.json());

app.get('/ping', (_req, res) => {
  res.send('pong');
});

// part9b — Type assertion:用 `as` 关键字把 `any` 强制断言成具体类型
app.post('/calculate', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value1, value2, op } = req.body;

  // 课程占位:类型断言在编译期信任开发者,运行期不再校验
  // 实际项目此处应该有 zod / 手写 if-else 之类的运行时校验
  // 关联 part9b.md 段 1102 "Using a type assertion... is always a bit risky"
  // validate the data here

  // ⭐ 核心概念:类型断言 (type assertion) `as` 关键字
  // 是什么:告诉 TS 编译器"我比类型推断更了解这个值,把它当 X 处理"
  // 不用 as:op 仍是 any,calculator 第三参望 Operation('multiply'|'add'|'divide')
  //         → 编译器报 TS2345 "any not assignable to Operation"
  //         → eslint 报 no-unsafe-argument(传 any 进非 any 参数)
  // 用 as:   op 被收窄为 Operation,编译器+eslint 都满意,不再需要
  //         no-unsafe-argument 的 disable 注释
  // 代价:    ⚠️ 编译期相信你,运行期 op='subtract' 会绕过编译期校验,
  //         calculator 进入 default 分支抛 Error
  // 验证:    curl -X POST localhost:3003/calculate -H 'Content-Type: application/json'
  //            -d '{"value1":2,"value2":3,"op":"subtract"}'
  //          → 500 "Operation is not multiply, add or divide!"
  // 关联:    part9b.md 1057-1104;TS Handbook §2 Everyday Types > Type Assertions
  const result = calculator(
    Number(value1), Number(value2), op as Operation
  );

  return res.send({ result });
});

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
