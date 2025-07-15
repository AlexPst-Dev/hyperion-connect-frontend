import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import Icon, { IconName } from "./Icon";
import { ProfileCategory, User } from "../models/user";
import { Company } from "../models/company";
import AppText from "./AppText";
import { useAnyUserProfileImage } from "../hooks/useImageProfilePicture";
import { fileService } from "../services/api/file-service";
import { useAuth } from "../hooks/useAuth";
import { File } from "../models/file";

interface Props {
  isCompany: boolean;
  user: User;
  company?: Company;
  iconName?: IconName;
}

export default function ItemUser({
  isCompany = false,
  user,
  company,
  iconName = "send",
}: Props) {
  const { token } = useAuth();

  const [userFile, setUserFile] = useState<File | undefined>();

  // Récupérer le fichier d'abord
  useEffect(() => {
    const fetchUserFile = async () => {
      if (token && user.filePictureId && !isNaN(Number(user.filePictureId))) {
        try {
          const file = await fileService.getFileById(
            Number(user.filePictureId),
            token
          );
          setUserFile(file);
        } catch (e) {
          console.log(
            "Impossible de récupérer le fichier de la photo de profil"
          );
        }
      } else {
        setUserFile(undefined);
      }
    };

    fetchUserFile();
  }, [user.filePictureId, token]);

  // Utiliser le hook avec le fichier récupéré
  const { profilePicture, isUserPPLoading } = useAnyUserProfileImage(userFile);

  function getSports(user: User): string {
    // Check if user is a sportsman or coach and has a sportCategory with a label
    if (
      (user.profileCategory === ProfileCategory.SPORTSMAN ||
        user.profileCategory === ProfileCategory.COACH) &&
      user.profile &&
      "sportCategory" in user.profile &&
      user.profile.sportCategory &&
      user.profile.sportCategory.label
    ) {
      return user.profile.sportCategory.label;
    }
    return "";
  }
  function getMedicCategory(user: User): string {
    // Check if user is a medic and has a medicCategory with a label
    if (
      user.profileCategory === ProfileCategory.MEDIC &&
      user.profile &&
      "medicCategory" in user.profile &&
      user.profile.medicCategory &&
      user.profile.medicCategory.label
    ) {
      return user.profile.medicCategory.label;
    }
    return "";
  }

  return (
    <View style={[styles.header, shadowStyles.small]}>
      <Image
        source={{ uri: profilePicture }}
        style={[styles.profilePicture, isUserPPLoading && { opacity: 0.5 }]}
      />
      <View style={styles.separator} />
      <View style={styles.userInfos}>
        {!isCompany ? (
          <View>
            <AppText style={styles.name}>
              {user.firstName} {user.lastName}
            </AppText>
            {(user.profileCategory === ProfileCategory.SPORTSMAN ||
              user.profileCategory === ProfileCategory.COACH) && (
              <AppText>{getSports(user)}</AppText>
            )}
            {user.profileCategory === ProfileCategory.MEDIC && (
              <AppText>{getMedicCategory(user)}</AppText>
            )}
            {user.profileCategory === ProfileCategory.PARTNER && (
              <AppText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  GlobalStyles.span,
                  { color: Colors.grey, flex: 1, minWidth: 0 },
                ]}
              >
                {user.description && user.description.length > 20
                  ? user.description.slice(0, 20) + "..."
                  : user.description}
              </AppText>
            )}
          </View>
        ) : (
          <AppText style={styles.name}>{company?.name}</AppText>
        )}
      </View>
      <View style={styles.icon}>
        {isCompany && !iconName ? (
          <Icon
            name="link"
            fillColor="transparent"
            strokeColor={Colors.deepBlue}
            strokeWidth={2}
          />
        ) : (
          <Icon
            name={iconName}
            fillColor="transparent"
            strokeColor={Colors.deepBlue}
            strokeWidth={2}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  userInfos: {
    flexDirection: "column",
    marginLeft: 16,
  },
  name: {
    color: Colors.deepBlue,
  },
  profilePicture: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.grey,
  },
  separator: {
    width: 1,
    height: 48,
    backgroundColor: "black",
    marginLeft: 16,
  },
  icon: {
    marginLeft: "auto",
    marginRight: 20,
  },
});
