// ⭐⭐⭐ models/user.js — part8u "User and log in" 新拆出的 mongoose Schema ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 block 59**(Chapter 4 第四小节
//   "User and log in" 段)
//   - 课程原文(per course block 58):"Let's create the user schema in the file
//     _models/user.js_:"
//   - 文件路径:**models/user.js**(per course verbatim)
//
// ⭐⭐⭐ 关键 User schema 设计 ⭐⭐⭐
//
// 1. ⭐ username 字段(per course block 59 verbatim)
//   - type: String
//   - required: true
//   - minlength: 3
//   → 跟 Person 的 name 字段(required + minlength 5)类比,但**阈值不同**(3 vs 5)
//   → 这是课程刻意区分:username 短一点合法(比如 "mluukkai" 7 字符刚好过 5,
//     "art" 3 字符也合法)
//
// 2. ⭐ friends 字段(per course block 59 verbatim)—— **ObjectId 数组**
//   - type: mongoose.Schema.Types.ObjectId
//   - ref: 'Person'
//   → 用 ObjectId 而不是直接 embed Person 文档,避免数据冗余
//   → ref: 'Person' 让 mongoose 知道这是个引用,可以 .populate('friends') 拿到
//     真正的 Person 对象数组
//   → 本节**不**兑现 addFriend/addAsFriend,只是把 friends 字段**预留**在 schema 里
//     → 实际 friends 增删在 course "Friends list" 子节(per part8s README 提到的
//       下一小节)
//
// 3. ⭐ 没有 password 字段!这很重要
//   - 课程原文 block 57:"let's assume that all users have the same password
//     which is hardcoded to the system"
//   - 所有用户共用 password = 'secret'(硬编码在 login resolver 里)
//   - **不**用 bcrypt、不存 passwordHash,简化聚焦 GraphQL
//   - 课程明示"because our focus is on GraphQL, we will leave out all that
//     extra hassle this time"
//
// 4. ⭐ module.exports = mongoose.model('User', schema)
//   - 'User' → mongoose 找复数 'users' 做 collection 名
//   - 返回值:User model,跟 Person 同等级

// ⭐ mongoose — MongoDB ODM(Object Document Mapper,per part3 沿用)
const mongoose = require('mongoose')

// ⭐⭐⭐ schema 定义 — verbatim 课程 block 59 ⭐⭐⭐
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    }
  ],
})

// ⭐⭐⭐ 导出 mongoose model — verbatim 课程 block 59 ⭐⭐⭐
//
// ⭐ mongoose.model('User', schema) 工厂:
//   - 第一个参数 'User':model name(字符串),mongoose 会自动找复数 'users' 做 collection
//   - 第二个参数 schema:刚才定义的 schema 实例
//   - 返回值:User model,有 .find/.findOne/.findById/.save 等
//
// ⭐ 跟 models/person.js 完全一致的导出风格(per part8s 沿用)
// ⭐ 验证:node -e "const User = require('./models/user'); console.log(User.modelName)"
//   应该打印 'User',证明拿到的是 mongoose Model
module.exports = mongoose.model('User', schema)