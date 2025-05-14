import React from "react";
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from "react-native";
import GlobalStyles from "../styles/styles";
import Icon, { IconName } from "./Icon";

export type ButtonType =
  | "primary"
  | "secondary"
  | "linkSmall"
  | "linkNormal"
  | "add"
  | "changeState";

interface Props {
  title?: string;
  onPress?: (event: GestureResponderEvent) => void;
  type: ButtonType;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  iconName?: IconName;
  iconPosition?: "left" | "right";
}

export default function AppButton({
  title,
  onPress,
  type = "primary",
  buttonStyle,
  textStyle,
  disabled = false,
  iconName,
  iconPosition = "right",
}: Props) {
  const getButtonStyle = (): ViewStyle => {
    return {
      ...GlobalStyles.buttonBase,
      ...GlobalStyles[`button_${type}`],
    };
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...GlobalStyles.buttonText,
      ...GlobalStyles[`text_${type}`],
    };
  };

  const getIconColor = (): string => {
    if (type === "changeState") {
      return "#1E3A8A";
    } else if (type === "linkSmall" || type === "linkNormal") {
      return "#2563EB";
    } else {
      return "white";
    }
  };

  const getIconSize = (): number => {
    switch (type) {
      case "add":
        return 24;
      case "linkSmall":
        return 16;
      default:
        return 20;
    }
  };

  const setLinkButtonStyle = (): {} => {
    if (type === "linkSmall" || type === "linkNormal") {
      return {
        borderBottomWidth: 1,
        borderBottomColor: "#2563EB",
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[getButtonStyle(), buttonStyle]}
      disabled={disabled}
    >
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
          },
          setLinkButtonStyle(),
        ]}
      >
        {iconName && iconPosition === "left" && (
          <Icon
            name={iconName}
            width={getIconSize()}
            height={getIconSize()}
            strokeColor={getIconColor()}
            fillColor="transparent"
          />
        )}
        {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
        {iconName && iconPosition === "right" && (
          <Icon
            name={iconName}
            width={getIconSize()}
            height={getIconSize()}
            strokeColor={getIconColor()}
            fillColor="transparent"
            strokeWidth={2}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
