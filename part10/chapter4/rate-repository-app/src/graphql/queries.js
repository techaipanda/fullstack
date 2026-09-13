// chapter4-Exercise 10.11-fetching repositories with Apollo Client
// 改动:把本节「Organizing GraphQL related code」留的 ${/* ... */} 占位
//  替换为 RepositoryItem 当前实际渲染的 8 个字段(对照 part8 GraphQL
//  Repository 类型与 schema introspection 探测结果对齐);查询名沿用
//  GET_REPOSITORIES 课程示例,export 形式不变。
// 为什么:课程提示「query for fetching the repositories with the
//  fields you are currently displaying in the application」——多选会
//  增加 payload / 失去按需选择语义,少选会 <Text item.xxx> 渲染 undefined
//  报错。8 个字段刚好对应 RepositoryItem.jsx 第 81-94 行的所有引用。

import { gql } from '@apollo/client';

export const GET_REPOSITORIES = gql`
  query {
    repositories {
      edges {
        node {
          id
          fullName
          description
          language
          stargazersCount
          forksCount
          reviewCount
          ratingAverage
          ownerAvatarUrl
        }
      }
    }
  }
`;

// other queries...
