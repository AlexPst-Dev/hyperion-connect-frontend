import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "./AppText";
import Icon from "./Icon";

interface Props {
  title: string;
  text: string;
  onPress: () => void;
}

export default function News({ title, text, onPress }: Props) {
  return (
    <View style={styles.newsContainer}>
      <Pressable style={styles.closeBtn} onPress={onPress}>
        <Icon
          name="close"
          fillColor="transparent"
          strokeColor={Colors.orange}
          strokeWidth={2}
          width={16}
          height={16}
        />
      </Pressable>
      <View style={styles.header}>
        <Icon
          fillColor="transparent"
          strokeColor={Colors.orange}
          strokeWidth={2}
          width={16}
          height={16}
          name="information"
        />
        <AppText style={[GlobalStyles.p, { fontWeight: "bold" }]}>
          {title}
        </AppText>
      </View>
      <View>
        <AppText style={GlobalStyles.p}>{text}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  newsContainer: {
    position: "relative",
    flexDirection: "column",
    gap: 0,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: Colors.orange,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: -8,
    right: -4,
    backgroundColor: "white",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.shadow,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
});
