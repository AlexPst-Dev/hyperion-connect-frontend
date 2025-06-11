import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import AppText from "./AppText";
import Label from "./Label";
import AppButton from "./AppButton";
import GlobalStyles, { Colors } from "../styles/styles";
import { IconName } from "./Icon";

interface Props {
  companyName: string;
  companyImgUrl: string;
  title: string;
  paragraph: string;
  conditions: string;
  startDate: Date;
  endDate: Date;
  isSponsorship: boolean;
  labelTxt?: string;
  iconName?: IconName;
  onPress?: () => void;
}

export default function OfferCard({
  companyName,
  companyImgUrl,
  title,
  paragraph,
  conditions,
  startDate,
  endDate,
  isSponsorship,
  labelTxt = "Réduction",
  iconName,
  onPress,
}: Props) {
  function getImageSource(imageUrl?: string): any {
    if (!imageUrl) {
      // fallback
      return require("../assets/images/react-logo.png");
    }

    if (imageUrl.startsWith("http") || imageUrl.startsWith("https")) {
      return { uri: imageUrl };
    }

    // Mapping of konwn local images
    const localImages: Record<string, any> = {
      "users/companies/nutrisport-logo": require("../assets/images/users/companies/nutrisport-logo.png"),
    };

    return localImages[imageUrl] || require("../assets/images/react-logo.png");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.companyInfos}>
          <Image
            source={getImageSource(companyImgUrl)}
            style={styles.companyImg}
          />
          <AppText style={[GlobalStyles.h3, { color: Colors.deepBlue }]}>
            {companyName}
          </AppText>
        </View>
        <Label
          title={isSponsorship ? "Sponsor" : labelTxt}
          backgroundColor={isSponsorship ? "#D6EBFF" : "#DEFFD6"}
          textColor={isSponsorship ? Colors.deepBlue : Colors.green}
          size="large"
        />
      </View>
      <View style={styles.body}>
        <View style={styles.content}>
          <AppText style={[GlobalStyles.p, { fontWeight: "bold" }]}>
            {title}
          </AppText>
          <AppText>{paragraph}</AppText>
          <View style={styles.offerConditions}>
            <AppText style={[GlobalStyles.span]}>{conditions}</AppText>
            <AppText style={[GlobalStyles.span]}>
              Du
              {" " + startDate.toLocaleDateString("fr-FR")} au
              {" " + endDate.toLocaleDateString("fr-FR")}
            </AppText>
          </View>
        </View>
        {onPress && iconName && (
          <View style={styles.controllers}>
            <AppButton
              title={isSponsorship ? "Postuler" : ""}
              type="primary"
              iconName={iconName}
              onPress={onPress}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
    padding: 8,
    borderStyle: "dashed",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
  },
  companyInfos: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  companyImg: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  body: {
    flexDirection: "column",
    gap: 8,
  },
  content: {
    flexDirection: "column",
    gap: 16,
  },
  offerConditions: {
    flexDirection: "column",
    gap: 8,
  },
  controllers: {
    flexDirection: "row",
    alignSelf: "flex-end",
  },
});
