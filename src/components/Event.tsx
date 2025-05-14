import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import { User } from "../context/AuthContext";
import AppButton from "./AppButton";
import AppText from "./AppText";

interface Props {
  title: string;
  type: "medical" | "hyperlink" | "hyperion" | "session" | "sportingActivity";
  personsInvolved: User | User[];
  location: string;
  date: Date;
  hour: string;
  isInPerson?: boolean;
  theme?: string;
  infoDescription?: string;
  link?: string;
  onPress?: () => void;
}

export default function Event({
  title,
  type,
  personsInvolved,
  location,
  date,
  hour,
  isInPerson,
  theme,
  infoDescription,
  link,
  onPress,
}: Props) {
  const userList = new Set(
    Array.isArray(personsInvolved)
      ? personsInvolved.map(
          (user) => user.firstName + " " + user.lastName + ", "
        )
      : [personsInvolved.firstName + " " + personsInvolved.lastName]
  );

  return (
    <Pressable onPress={onPress} style={[styles.container, shadowStyles.small]}>
      <View style={styles.content}>
        <AppText
          style={[
            GlobalStyles.p,
            {
              color: Colors.deepBlue,
              fontWeight: "bold",
              flexDirection: "row",
              flex: 0.95,
            },
          ]}
        >
          {title}
        </AppText>
        <View style={styles.separator} />
        <View style={styles.infos}>
          <View style={{ flexDirection: "row", flex: 1, minWidth: 0 }}>
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                GlobalStyles.span,
                { color: Colors.grey, flex: 1, minWidth: 0 },
              ]}
            >
              {type === "medical"
                ? "Soignant : "
                : type === "sportingActivity"
                ? "Sportif : "
                : "Intervenants : "}
              {[...userList].join("")}
            </AppText>
          </View>
          {type === "hyperlink" && theme && (
            <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
              {theme}
            </AppText>
          )}
          <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
            {location}
          </AppText>
          <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
            {date.toLocaleDateString("fr-Fr")} - {hour}
          </AppText>
          {isInPerson && (
            <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
              Présentiel
            </AppText>
          )}
        </View>
      </View>
      {infoDescription && (
        <View style={styles.controller}>
          <AppButton
            title="Voir"
            type="linkSmall"
            iconName="eye"
            onPress={onPress}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 8,
    borderRadius: 8,
    borderColor: Colors.shadow,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  content: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  controller: {
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  separator: {
    height: 56,
    width: 2,
    backgroundColor: Colors.deepBlue,
  },
  infos: {
    flexDirection: "column",
    flex: 1,
  },
});
