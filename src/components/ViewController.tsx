import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import AppText from "./AppText";
import Icon, { IconName } from "./Icon";
import GlobalStyles, { Colors } from "../styles/styles";

interface Tab {
  title: string;
  icon: IconName;
}

interface Props {
  tabs: Tab[];
  onTabChange?: (index: number) => void;
}

export default function ViewController({ tabs, onTabChange }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePress = (index: number) => {
    setActiveIndex(index);
    onTabChange?.(index);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={index}
            style={[
              styles.tab,
              isActive ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => handlePress(index)}
          >
            <Icon
              name={tab.icon}
              width={16}
              height={16}
              strokeColor={isActive ? "black" : "#ffffff"}
              fillColor="transparent"
              strokeWidth={2}
            />
            <AppText
              style={[
                GlobalStyles.span,
                { color: isActive ? "black" : "#ffffff" },
              ]}
            >
              {tab.title}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.deepBlue,
    borderRadius: 8,
    padding: 8,
    alignSelf: "flex-start",
    marginLeft: "auto",
  },
  tab: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#ffffff",
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
});
