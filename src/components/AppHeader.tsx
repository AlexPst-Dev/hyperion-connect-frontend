import React from "react";
import { StyleSheet, View, Text, StatusBar, Platform } from "react-native";
import HeaderNav from "./HeaderNav";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "./Icon";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  profilePictureUrl?: string;
  textContent?: string;
  pageTitle?: string;
  hasReturnButton?: boolean;
  onReturnButtonPress?: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: "100%",
    backgroundColor: Colors.deepBlue,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: Platform.select({
      web: 42,
      android: 0,
      ios: 0,
      default: 0,
    }),
  },
  textContent: {
    color: "white",
  },
  pageTitle: {
    ...GlobalStyles.h1,
    color: "white",
    marginTop: 24,
    marginBottom: 8,
  },
  returnButtonText: {
    ...GlobalStyles.p,
    color: "white",
    marginLeft: 4,
  },
  returnButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default function AppHeader({
  textContent,
  pageTitle,
  hasReturnButton,
  onReturnButtonPress,
}: Props) {
  return (
    <SafeAreaView style={{ backgroundColor: Colors.deepBlue }}>
      <StatusBar backgroundColor={Colors.deepBlue} barStyle="light-content" />
      <View style={styles.container}>
        <HeaderNav />
        {pageTitle ? <Text style={styles.pageTitle}>{pageTitle}</Text> : null}
        {textContent ? (
          <Text style={styles.textContent}>{textContent}</Text>
        ) : null}
        {hasReturnButton && (
          <View style={styles.returnButtonContainer}>
            <Icon name="leftArrow" strokeWidth={1} strokeColor="white" />
            <Text style={styles.returnButtonText} onPress={onReturnButtonPress}>
              Retour
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
