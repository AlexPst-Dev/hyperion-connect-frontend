import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import GlobalStyles, { Colors, shadowStyles } from "../styles/styles";
import { User } from "../models/user";
import AppText from "./AppText";
import { useAuth } from "../hooks/useAuth";
import { File } from "../models/file";
import { useAnyUserProfileImage } from "../hooks/useImageProfilePicture";
import { fileService } from "../services/api/file-service";

interface Props {
  user: User;
  objectives: React.ReactElement | React.ReactElement[];
}

export default function ItemClient({ user, objectives }: Props) {
  const { token } = useAuth();

  const [userFile, setUserFile] = useState<File | undefined>();

  const fetchFileOfUser = async () => {
    if (token && user.filePictureId && !isNaN(Number(user.filePictureId))) {
      const filePictureOfUser = await fileService.getFileById(
        Number(user.filePictureId),
        token
      );
      setUserFile(filePictureOfUser);
    }
  };

  useEffect(() => {
    fetchFileOfUser();
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
          <AppText>{user.profileCategory}</AppText>
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
