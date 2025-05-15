import React from "react";
import {
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
  StyleSheet,
} from "react-native";
import { Colors } from "../styles/styles";
import AppText from "./AppText";
import Icon, { IconName } from "./Icon";

type NotificationType = "information" | "error" | "success";

interface Props {
  title: string;
  type: NotificationType;
  labelStyle?: StyleProp<ViewStyle>;
  labelTextStyle?: StyleProp<TextStyle>;
}

export default function AppNotifications({
  title,
  type = "information",
}: Props) {
  const getColors = (
    type: NotificationType
  ): { textColor: string; backgroundColor: string; iconName: IconName } => {
    switch (type) {
      case "information":
        return {
          textColor: Colors.deepBlue,
          backgroundColor: "#D6EBFF",
          iconName: "information",
        };
      case "error":
        return {
          textColor: Colors.red,
          backgroundColor: "#FFE7E7",
          iconName: "close",
        };
      case "success":
        return {
          textColor: Colors.green,
          backgroundColor: "#DEFFD6",
          iconName: "check",
        };
      default:
        return {
          textColor: "black",
          backgroundColor: "#FFFFFF",
          iconName: "information",
        };
    }
  };

  const { textColor, backgroundColor, iconName } = getColors(type);

  return (
    <View
      style={[styles.container, { backgroundColor, borderColor: textColor }]}
    >
      <Icon
        fillColor="transparent"
        strokeColor={textColor}
        strokeWidth={2}
        width={24}
        height={24}
        name={iconName}
      />
      <AppText style={[styles.text, { color: textColor }]}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  text: {
    marginLeft: 8,
  },
});
