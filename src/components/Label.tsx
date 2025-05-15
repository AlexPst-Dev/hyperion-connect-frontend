import React from "react";
import { Text, ViewStyle, TextStyle, StyleProp, View } from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";

type LabelType = "blue" | "orange" | "green";

type LabelSize = "small" | "normal" | "large";

interface Props {
  title: string;
  type: LabelType;
  size: LabelSize;
  labelStyle?: StyleProp<ViewStyle>;
  labelTextStyle?: StyleProp<TextStyle>;
}

export default function Label({
  title,
  type = "blue",
  size = "normal",
  labelStyle,
  labelTextStyle,
}: Props) {
  const getLabelStyle = (): ViewStyle => {
    return {
      ...GlobalStyles.labelBase,
      ...GlobalStyles[`label_${type}`],
    };
  };

  const getLabelTextStyle = (): TextStyle => {
    return {
      ...GlobalStyles.labelTextBase,
      ...GlobalStyles[`label_text_${size}`],
    };
  };

  const getTextLabelColor = (): string => {
    switch (type) {
      case "blue":
        return Colors.deepBlue;
      case "orange":
        return Colors.orange;
      case "green":
        return Colors.green;
      default:
        return Colors.deepBlue;
    }
  };

  return (
    <View style={[getLabelStyle(), labelStyle]}>
      <Text
        style={[
          getLabelTextStyle(),
          labelTextStyle,
          { color: getTextLabelColor() },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}
