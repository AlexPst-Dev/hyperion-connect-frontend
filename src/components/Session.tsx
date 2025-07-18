import React from "react";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import Icon from "./Icon";
import AppText from "./AppText";
import Label from "./Label";
import AppButton from "./AppButton";

interface Props {
  title: string;
  durationTime?: number;
  nbExercises?: number;
  imageUrl?: string;
  isExercice?: boolean;
  isImportedFile?: boolean;
  labels?: React.ReactElement | React.ReactElement[];
  onPress?: () => void;
  isDone?: boolean;
  isToDo?: boolean;
  hasChangeStateBtn?: boolean;
  onChangeStateBtnPress?: () => void;
  coachFirstName?: string;
  coachLastName?: string;
  location?: string;
  date?: Date;
  hour?: string;
  hideIcon?: boolean;
}

export default function Session({
  title,
  durationTime,
  nbExercises,
  imageUrl,
  isExercice = false,
  isImportedFile = false,
  labels,
  onPress,
  isDone = false,
  isToDo = false,
  hasChangeStateBtn,
  onChangeStateBtnPress,
  coachFirstName,
  coachLastName,
  location,
  date,
  hour,
  hideIcon = false,
}: Props) {
  function getImageSource(imageUrl: string): any {
    if (imageUrl.startsWith("http") || imageUrl.startsWith("https")) {
      return { uri: imageUrl };
    }

    // Mapping of konwn local images
    const localImages: Record<string, any> = {
      "sessions/img-running": require("../assets/images/sessions/img-running.png"),
    };

    return (
      localImages[imageUrl] || require("../assets/images/default-session.png")
    );
  }

  function isYoutubeUrl(url: string) {
    return url.includes("youtube.com") || url.includes("youtu.be");
  }

  return (
    <Pressable onPress={onPress} style={[styles.container, shadowStyles.small]}>
      <View style={styles.content}>
        <View
          style={[
            styles.img,
            isImportedFile || !imageUrl || isYoutubeUrl(imageUrl)
              ? {
                  borderWidth: 1,
                  borderColor: "rgb(172, 172, 172)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }
              : "",
          ]}
        >
          {imageUrl && !isYoutubeUrl(imageUrl) && (
            <Image
              source={getImageSource(imageUrl)}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          )}
          {isImportedFile && (
            <Icon
              name="download"
              width={32}
              height={32}
              strokeColor="black"
              fillColor="transparent"
            />
          )}
          {(!imageUrl && !isImportedFile) ||
            (imageUrl && isYoutubeUrl(imageUrl) && (
              <Icon
                name="eye"
                width={32}
                height={32}
                strokeColor="black"
                fillColor="transparent"
              />
            ))}
        </View>
        <View style={styles.separator} />
        <View style={styles.infos}>
          <AppText style={[GlobalStyles.p, { fontWeight: "bold" }]}>
            {title}
          </AppText>
          {(nbExercises || durationTime) && (
            <View style={styles.sessionDetails}>
              {nbExercises && (
                <View style={styles.sessionAttribute}>
                  <Icon
                    name="dumbell"
                    fillColor="transparent"
                    strokeColor={Colors.grey}
                    strokeWidth={1}
                    width={12}
                    height={12}
                  />
                  <AppText
                    style={[
                      GlobalStyles.span,
                      { color: Colors.grey, marginLeft: 2 },
                    ]}
                  >
                    {nbExercises} exercices
                  </AppText>
                </View>
              )}
              {durationTime && (
                <View style={styles.sessionAttribute}>
                  <Icon
                    name="timer"
                    fillColor="transparent"
                    strokeColor={Colors.grey}
                    strokeWidth={1}
                    width={12}
                    height={12}
                  />
                  <AppText
                    style={[
                      GlobalStyles.span,
                      { color: Colors.grey, marginLeft: 2 },
                    ]}
                  >
                    {durationTime}min
                  </AppText>
                </View>
              )}
            </View>
          )}
          {coachFirstName && coachLastName && location && date && (
            <View style={styles.coachDetails}>
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                Coach : {coachFirstName} {coachLastName}
              </AppText>
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                Lieu : {location}
              </AppText>
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                {date.toLocaleDateString("fr-Fr")} {hour}
              </AppText>
              <AppText style={[GlobalStyles.span, { color: Colors.grey }]}>
                {location && location !== "" ? "Présentiel" : "À distance"}
              </AppText>
            </View>
          )}
          <View style={styles.categoryLabels}>{labels && <>{labels}</>}</View>
        </View>
        <View style={styles.rightPart}>
          {isDone && (
            <Label
              title="Fait"
              textColor={Colors.green}
              backgroundColor="#DEFFD6"
              size="small"
            />
          )}
          {isToDo && (
            <Label
              title="À faire"
              textColor="#F97316"
              backgroundColor="#FFF9F4"
              size="small"
            />
          )}
          {isExercice && !isDone && !isToDo && !hideIcon && (
            <Icon
              name="eye"
              strokeColor="black"
              fillColor="transparent"
              strokeWidth={2}
              width={24}
              height={24}
            />
          )}
          {!isExercice && !isDone && !isToDo && !hideIcon && (
            <Icon
              name="chevronRight"
              strokeColor="black"
              fillColor="transparent"
              strokeWidth={2}
              width={24}
              height={24}
            />
          )}
        </View>
      </View>
      {hasChangeStateBtn && isToDo && (
        <View style={styles.controller}>
          <AppButton
            title="Marquer comme fait"
            type="changeState"
            iconName="check"
            textStyle={[GlobalStyles.span]}
            onPress={onChangeStateBtnPress}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 16,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
  },
  content: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    width: "100%",
  },
  img: {
    width: 92,
    height: 64,
    borderRadius: 8,
    backgroundColor: "white",
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: "black",
  },
  infos: {
    flexDirection: "column",
    flex: 1,
    gap: 8,
  },
  sessionDetails: {
    flexDirection: "row",
    gap: 8,
  },
  sessionAttribute: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryLabels: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rightPart: {
    flexDirection: "column",
    justifyContent: "center",
  },
  coachDetails: {
    flexDirection: "column",
  },
  controller: {
    flexDirection: "row",
    alignSelf: "flex-end",
  },
});
