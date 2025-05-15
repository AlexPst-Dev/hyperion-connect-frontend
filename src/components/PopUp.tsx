import React from "react";
import {
  StyleSheet,
  Pressable,
  View,
  StyleProp,
  TextStyle,
} from "react-native";
import GlobalStyles from "../styles/styles";
import Icon, { IconName } from "./Icon";
import AppText from "./AppText";
import AppButton, { ButtonType } from "./AppButton";

interface Props {
  onClose: () => void;
  title: string;
  closeText?: string;
  paragraph?: string;
  inputs?: React.ReactElement | React.ReactElement[];
  specificBody?: React.ReactElement;
  onSubmit?: () => void;
  btnText?: string;
  btnType?: ButtonType;
  btnTextStyle?: StyleProp<TextStyle>;
  iconName?: IconName;
  iconPosition?: "left" | "right";
}

export default function PopUp({
  onClose,
  onSubmit,
  title,
  paragraph,
  inputs,
  specificBody,
  btnText,
  btnType,
  btnTextStyle,
  iconName,
  iconPosition,
  closeText,
}: Props) {
  return (
    <Pressable style={styles.menuContainer} onPress={() => {}}>
      <View style={styles.menuTitle}>
        <AppText style={[GlobalStyles.h2, { marginBottom: 0 }]}>
          {title}
        </AppText>
        <Icon
          name="close"
          width={24}
          height={24}
          fillColor="transparent"
          strokeColor="black"
          strokeWidth={2}
          onPress={onClose}
        />
      </View>
      {paragraph && (
        <View style={{ marginBottom: 24 }}>
          <AppText>{paragraph}</AppText>
        </View>
      )}
      {inputs && <View style={{ marginBottom: 24 }}>{inputs}</View>}
      {specificBody && <View>{specificBody}</View>}
      <View style={styles.menuControllers}>
        <Pressable onPress={onClose}>
          <AppText>{closeText}</AppText>
        </Pressable>
        {onSubmit && btnText && btnType && (
          <AppButton
            title={btnText}
            onPress={onSubmit}
            textStyle={btnTextStyle}
            iconName={iconName}
            iconPosition={iconPosition}
            type={btnType}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: "column",
  },
  menuTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  menuControllers: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
