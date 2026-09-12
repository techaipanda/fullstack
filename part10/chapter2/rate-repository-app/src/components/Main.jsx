// chapter3-Theming
// 改动:删 sub-section 6 的 FancyText + 内联 styles,改用自定义 Text 组件
//  + theme 主题;通过语义 props (color / fontSize / fontWeight) 而非
//  style 对象表达文本变体。
// 为什么:把"颜色 / 字号 / 字重"提到 props API 而非 style,组件调用方从
//  样式细节(blueText / bigText 命名)解耦,只关心"这是次级色正文"。

import Text from './Text';

const Main = () => {
  return (
    <>
      <Text>Simple text</Text>
      <Text style={{ paddingBottom: 10 }}>Text with custom style</Text>
      <Text fontWeight="bold" fontSize="subheading">
        Bold subheading
      </Text>
      <Text color="textSecondary">Text with secondary color</Text>
    </>
  );
};

export default Main;