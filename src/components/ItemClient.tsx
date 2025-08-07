import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import {
  CoachProfile,
  MedicProfile,
  ProfileCategory,
  SportsmanProfile,
  User,
} from "../models/user";
import AppText from "./AppText";
import { useAuth } from "../hooks/useAuth";
import { File } from "../models/file";
import { useAnyUserProfileImage } from "../hooks/useImageProfilePicture";
import { fileService } from "../services/api/file-service";
import { categoryService } from "../services/api/category-service";
import { UserService } from "../services/api/user-service";

interface Props {
  user: User;
  objectives: React.ReactElement | React.ReactElement[];
}

export default function ItemClient({ user, objectives }: Props) {
  const { token } = useAuth();

  const [userFile, setUserFile] = useState<File | undefined>();
  const [categoryLabel, setCategoryLabel] = useState<string>("");

  const fetchFileOfUser = async () => {
    if (token && user.filePictureId && !isNaN(Number(user.filePictureId))) {
      const filePictureOfUser = await fileService.getFileById(
        Number(user.filePictureId),
        token
      );
      setUserFile(filePictureOfUser);
    }
  };

  const getCategoryLabel = async () => {
    // Sportsman: une seule catégorie
    if (user.profileCategory === ProfileCategory.SPORTSMAN && token) {
      const completeUser = await UserService.getUserById(user.id, token);
      const sportCategoryId = (completeUser.profile as SportsmanProfile)
        .sportCategoryId;
      if (!sportCategoryId || !token) return "";
      const cat = await categoryService.getCategoryById(sportCategoryId, token);
      setCategoryLabel(cat ? cat.label : "");
    }

    // Coach: plusieurs catégories
    if (user.profileCategory === ProfileCategory.COACH && user.id && token) {
      const completeUser = await UserService.getUserById(user.id, token);
      const catCoach =
        (completeUser.profile as CoachProfile).sportCategories || [];
      setCategoryLabel(
        catCoach.length > 0 ? catCoach.map((c) => c.label).join(", ") : ""
      );
    }

    // Medic: plusieurs catégories
    if (user.profileCategory === ProfileCategory.MEDIC && user.id && token) {
      const completeUser = await UserService.getUserById(user.id, token);
      const catMedic =
        (completeUser.profile as MedicProfile).sportCategories || [];
      setCategoryLabel(
        catMedic.length > 0 ? catMedic.map((c) => c.label).join(", ") : ""
      );
    }

    return "";
  };

  useEffect(() => {
    fetchFileOfUser();
    getCategoryLabel();
  }, [token]);

  const { profilePicture, isUserPPLoading } = useAnyUserProfileImage(userFile);

  return (
    <View style={[styles.container, shadowStyles.small]}>
      <View style={styles.user}>
        <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
        <View style={styles.separator} />
        <View style={styles.userInfos}>
          <AppText style={{ fontWeight: "bold", color: Colors.deepBlue }}>
            {user.firstName} {user.lastName}
          </AppText>
          <AppText>{categoryLabel}</AppText>
        </View>
      </View>
      {objectives}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: Colors.shadow,
    width: "100%",
    flexDirection: "column",
    gap: 8,
  },
  user: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  userInfos: {
    flexDirection: "column",
    gap: 4,
  },
  name: {
    ...GlobalStyles.p,
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
  },
});
