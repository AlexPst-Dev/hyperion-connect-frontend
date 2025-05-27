import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Platform,
  Pressable,
} from "react-native";
import HeaderNav from "./HeaderNav";
import GlobalStyles, { Colors } from "../styles/styles";
import Icon from "./Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import News from "./News";
import AppText from "./AppText";

interface Props {
  profilePictureUrl?: string;
  textContent?: string;
  pageTitle?: string;
  hasReturnButton?: boolean;
  onReturnButtonPress?: () => void;
  hasNewsComponent: boolean;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
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
    minHeight: 209,
  },
  whiteText: {
    color: "white",
  },
  pageTitle: {
    ...GlobalStyles.h1,
    color: "white",
    marginTop: 24,
    marginBottom: 8,
  },
  returnButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default function AppHeader({
  textContent,
  pageTitle,
  hasReturnButton,
  onReturnButtonPress,
  hasNewsComponent,
}: Props) {
  const [newsVisible, setNewsVisible] = useState(true);

  return (
    <SafeAreaView style={{ backgroundColor: Colors.deepBlue }}>
      <StatusBar backgroundColor={Colors.deepBlue} barStyle="light-content" />
      <View style={styles.container}>
        <HeaderNav />
        <View
          style={{
            marginVertical: "auto",
          }}
        >
          {pageTitle ? <Text style={styles.pageTitle}>{pageTitle}</Text> : null}
          {textContent ? (
            <AppText style={styles.whiteText}>{textContent}</AppText>
          ) : null}
        </View>
        {hasReturnButton && (
          <View style={styles.returnButtonContainer}>
            <Icon name="leftArrow" strokeWidth={1} strokeColor="white" />
            <AppText style={styles.whiteText} onPress={onReturnButtonPress}>
              Retour
            </AppText>
          </View>
        )}
        {hasNewsComponent && newsVisible && (
          <Pressable
            style={{
              position: "absolute",
              bottom: -24,
              left: 16,
              width: "92%",
            }}
          >
            <News
              title="Message de l'équipe Hyperion :"
              text="N'hésitez pas à donner un avis sur le Google Play Store ou l'Apple Store"
              onPress={() => {
                setNewsVisible(!newsVisible);
              }}
            />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
