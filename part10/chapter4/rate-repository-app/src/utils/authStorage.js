// chapter4-Exercise 10.14
// 改动:新建 src/utils/authStorage.js,verbatim 复制 MOOC 实时版
//  Exercise 10.14 模板(类含 constructor/getAccessToken/setAccessToken
//  /removeAccessToken 四个成员,后三个方法体留空)。
// 为什么:access token 跨 app 重启需要持久化(关掉再打开 App 还在),
//  但 AsyncStorage 暴露的是裸 key-value (string-only);用一个 class 包
//  装,可以 (1) 用 namespace 前缀('auth') 防 key 冲突,(2) 业务侧调
//  语义化方法 (getAccessToken/setAccessToken) 而不是底层 key 字符串。
//  本节 10.14 verbatim 只给模板,三个方法的实现留给 Exercise 10.15
//  ('storing the access token step2') 在 useSignIn 里真正调用
//  setAccessToken 时补齐 — verbatim 1:1 复制 MOOC,本节不偷跑实现。
//
// 当前 Enhancing Apollo Client's requests 节 verbatim 调用了
//  authStorage.getAccessToken(),但方法体是空的,返回 undefined;
//  SetContextLink 里 `accessToken ? 'Bearer ...' : ''` 走 falsy 分支,
//  authorization header 是空字符串,未登录状态。后端不依赖 access
//  token 的 query (例如 repositories) 不受影响。

import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthStorage {
  constructor(namespace = 'auth') {
    this.namespace = namespace;
  }

  getAccessToken() {
    // Get the access token for the storage
  }

  setAccessToken(accessToken) {
    // Add the access token to the storage
  }

  removeAccessToken() {
    // Remove the access token from the storage
  }
}

export default AuthStorage;