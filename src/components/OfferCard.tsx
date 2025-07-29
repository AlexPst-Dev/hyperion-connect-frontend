import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import AppText from "./AppText";
import Label from "./Label";
import AppButton from "./AppButton";
import GlobalStyles, { Colors } from "../styles/styles";
import { IconName } from "./Icon";
import { useCompanyImage } from "../hooks/useImageProfilePicture";
import { Company } from "../models/company";

interface Props {
  company: Company;
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
  company,
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
  const { companyImage, isCppLoading } = useCompanyImage(
    company.id,
    company.fileImageCompany
  );

  return (
    <View style={styles.container}>
      <Label
        title={isSponsorship ? "Sponsoring" : labelTxt}
        backgroundColor={isSponsorship ? "#D6EBFF" : "#DEFFD6"}
        textColor={isSponsorship ? Colors.deepBlue : Colors.green}
        size="large"
        labelStyle={{ alignSelf: "flex-end" }}
      />
      <View style={styles.header}>
        <View style={styles.companyInfos}>
          <Image source={{ uri: companyImage }} style={styles.companyImg} />
          <AppText style={[GlobalStyles.h3, { color: Colors.deepBlue }]}>
            {company.name}
          </AppText>
        </View>
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
    gap: 4,
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
