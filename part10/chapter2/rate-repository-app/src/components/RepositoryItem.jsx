// chapter3-RepositoryList (Exercise 3.5)
// 改动:Image avatar (48x48) + View 列排 fullName/description + language
//  tag (theme.colors.primary 背景白字) + statsRow 4 列;formatCount 把
//  >=1000 折成 "8.4k" (toFixed(1)) 满足 block 92 k-suffix 精度;默认导出。
// 为什么:Image 显式 width/height 锁住布局,topRow flex 排头像+主信息;
//  statsRow flex:row 排 4 列;tag 文字白底用 style 覆盖 Text base color
//  不动 Text.jsx;toFixed(1) 满足 course 示例 (8439→8.4k)。
//
// 课程原文定位:Exercise 3.5 'Polished reviewed repositories list' block 92
//  "Modify the RepositoryItem component" 要求加 avatar + k-suffix + 整体美化。

import { Image, StyleSheet, View } from 'react-native';

import Text from './Text';
import theme from '../theme';

const formatCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.repositoryBackground,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 16,
  },
  mainInfo: {
    flex: 1,
  },
  languageTag: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-around',
  },
});

const RepositoryItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image source={{ uri: item.ownerAvatarUrl }} style={styles.avatar} />
        <View style={styles.mainInfo}>
          <Text fontWeight="bold">{item.fullName}</Text>
          <Text color="textSecondary">{item.description}</Text>
        </View>
      </View>
      <Text style={styles.languageTag}>{item.language}</Text>
      <View style={styles.statsRow}>
        <Text>{formatCount(item.stargazersCount)}</Text>
        <Text>{formatCount(item.forksCount)}</Text>
        <Text>{item.reviewCount}</Text>
        <Text>{item.ratingAverage}</Text>
      </View>
    </View>
  );
};

export default RepositoryItem;
