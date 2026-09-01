// ⭐⭐⭐ models/person.js — part8s "Mongoose and Apollo" 新拆出的 mongoose Schema ⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 课程 line 11-37**(Chapter 4 第二小节)
//   - 课程原文(per course line 9):"Define the person schema in the file
//     _models/person.js_ as follows"
//   - 这是 part8s 引入数据库的核心文件,把 part8r 里 in-memory `persons` 数组
//     替成 mongoose Model
//   - 文件路径:**models/person.js**(per course verbatim,不是 models/Person.js)
//
// ⭐⭐⭐ 关键设计:为什么先拆 models/ 目录?⭐⭐⭐
//
// 1. ⭐ 课程原文(per course line 9):"Define the person schema in the file
//    _models/person.js_ as follows"
//   → mongoose Schema 必须独立成文件,不能塞进 resolvers.js
//   → 因为后面要 require('./models/person') 拿到 Person model 给 resolver 用
//   → 文件名 Person.js 还是 person.js?课程原文是小写 person.js(per part3/4 沿用)
//
// 2. ⭐ 单一职责延续(part8r 的 SRP 继续生效)
//   - part8r:schema.js 管 SDL,resolvers.js 管逻辑,server.js 管启动,index.js 管编排
//   - part8s:在 part8r 基础上加 models/person.js 管数据结构,db.js 管连接
//   - 模块边界越来越细,但分工原则不变
//
// 3. ⭐ 为什么 resolvers 不能直接 new mongoose.Schema()?
//   - resolvers.js 现在 require('./models/person'),拿到 Person model
//   - Person model 是 mongoose.model('Person', schema) 出来的实例,有 .find/.save 等
//   - resolvers 不直接操作 schema,因为 schema 是定义,model 才是 API

// ⭐ mongoose — MongoDB ODM(Object Document Mapper,per part3 沿用)
const mongoose = require('mongoose')

// ⭐⭐⭐ schema 定义 — verbatim 课程 line 14-34 ⭐⭐⭐
//
// ⭐ 关键设计:5 字段(name/phone/street/city) + required/minlength 验证
//   - name:required + minlength 5
//   - phone:**没有** required,允许不填(per course line 20-23)
//     → 跟 part8r 的 Venla Ruuska 数据一致:phone 字段缺失
//     → person find({ phone: { $exists: false } }) 这种 query 才能匹配到
//   - street:required + minlength 5
//   - city:required + minlength 3
//
// ⭐ 课程原文(per course line 39):"We also included a few validations.
//   required: true, which makes sure that a value exists, is actually
//   redundant: we already ensure that the fields exist with GraphQL.
//   However, it is good to also keep validation in the database."
//   → required 在 GraphQL 层已经验证过,这里加是双保险(defense in depth)
//   → 即使有人绕过 GraphQL 直连 DB,DB 也拒绝非法数据
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5
  },
  phone: {
    type: String,
    minlength: 5
  },
  street: {
    type: String,
    required: true,
    minlength: 5
  },
  city: {
    type: String,
    required: true,
    minlength: 3
  },
})

// ⭐⭐⭐ 导出 mongoose model — verbatim 课程 line 36 ⭐⭐⭐
//
// ⭐ mongoose.model('Person', schema) 是工厂:
//   - 第一个参数 'Person':model name(字符串),mongoose 会自动找复数 'people' 做 collection
//     → 实际 MongoDB 里 collection 名是 'people'(mongoose 默认 pluralization)
//     → 但课程里 query 用的是 Person.collection.countDocuments() 等,model instance 方法
//   - 第二个参数 schema:刚才定义的 schema 实例
//   - 返回值:Person — 这是一个 mongoose Model 实例,有 .find/.findOne/.save 等
//
// ⭐ 验证:node -e "const Person = require('./models/person'); console.log(Person.modelName)"
//   应该打印 'Person',证明拿到的是 mongoose Model
module.exports = mongoose.model('Person', schema)