// chapter3-Theming
// 改动:用 RN 原生 Text 作 NativeText 别名,包一层自定义 Text;
//  StyleSheet.create 引用 theme 数值生成 5 个命名样式,通过 props
//  (color/fontSize/fontWeight) 短路选择;`{...props}` 透传 native 事件。
// 为什么:RN 不支持 global styles,自定义 Text 把"基础样式 + 主题配色 +
//  props 变体"集中到一个声明点;rest spread 让 Text 同时保有 RN 全部
//  原生 prop API (onPress / numberOfLines 等) 与主题语义。

import { Text as NativeText, StyleSheet } from 'react-native';

import theme from '../theme';

const styles = StyleSheet.create({
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.main,
    fontWeight: theme.fontWeights.normal,
  },
  colorTextSecondary: {
    color: theme.colors.textSecondary,
  },
  colorPrimary: {
    color: theme.colors.primary,
  },
  fontSizeSubheading: {
    fontSize: theme.fontSizes.subheading,
  },
  fontWeightBold: {
    fontWeight: theme.fontWeights.bold,
  },
});

const Text = ({ color, fontSize, fontWeight, style, ...props }) => {
  const textStyle = [
    styles.text,
    color === 'textSecondary' && styles.colorTextSecondary,
    color === 'primary' && styles.colorPrimary,
    fontSize === 'subheading' && styles.fontSizeSubheading,
    fontWeight === 'bold' && styles.fontWeightBold,
    style,
  ];

  return <NativeText style={textStyle} {...props} />;
};

export default Text;