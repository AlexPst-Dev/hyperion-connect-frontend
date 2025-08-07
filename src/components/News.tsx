import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "./AppText";
import Icon from "./Icon";
import { useAuth } from "../hooks/useAuth";
import { ProfileCategory } from "../models/user";

interface Props {
  onPress: () => void;
  onClose: () => void;
  title: string;
  text: string;
}

export default function News({ onPress, onClose, title, text }: Props) {
  const { user } = useAuth();

  return (
    <Pressable style={styles.newsContainer} onPress={onPress}>
      {user?.profileCategory !== ProfileCategory.ADMIN && (
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Icon
            name="close"
            fillColor="transparent"
            strokeColor={Colors.orange}
            strokeWidth={2}
            width={16}
            height={16}
          />
        </Pressable>
      )}
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
    </Pressable>
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
