import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, Image } from "react-native";
import { useAuth } from "../hooks/useAuth";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "./AppText";
import Icon from "./Icon";
import { getImageSource } from "../utils/imgSrcHandler";
import { UserService } from "../services/api/user-service";
import { User, UserResponse } from "../models/user";

interface Props {
  onClose: () => void;
}

export default function MemberCard({ onClose }: Props) {
  const { user } = useAuth();
  const [connectedUser, setConnectedUser] = useState<User>();

  useEffect(() => {
    if (user) {
      let isMounted = true;
      UserService.getUserById(user.id).then((connectedUser: UserResponse) => {
        if (isMounted) setConnectedUser(connectedUser.user);
      });
      return () => {
        isMounted = false;
      };
    }
  }, [user]);

  if (!connectedUser)
    return <AppText>Informations client indisponibles</AppText>;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.container} onPress={() => {}}>
        <View style={styles.header}>
          <AppText style={{ ...GlobalStyles.h2 }}>
            MEMBRE HYPERION CONNECT
          </AppText>
          <Icon
            name="close"
            fillColor="white"
            strokeColor="black"
            strokeWidth={2}
            onPress={onClose}
          />
        </View>
        <View style={styles.qrCodeContainer}>
          <Image
            source={getImageSource(
              connectedUser.filePicture ? connectedUser?.filePicture.url : ""
            )}
            style={styles.qrCodeImg}
          />
        </View>
        <View style={styles.infos}>
          <AppText
            style={{
              color: Colors.deepBlue,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            {connectedUser?.firstName} {connectedUser?.lastName}
          </AppText>
          <AppText style={{ marginBottom: 4 }}>
            Membre depuis le{" "}
            {connectedUser?.createdAt
              ? new Date(connectedUser.createdAt).toLocaleDateString("fr-FR")
              : ""}
          </AppText>
          <AppText style={{ marginBottom: 4 }}>Sport</AppText>
          <AppText>Abonnement</AppText>
        </View>
        <View style={styles.footer}>
          <AppText onPress={onClose}>OK</AppText>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    height: Dimensions.get("window").height,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "flex-start",
  },
  qrCodeContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  qrCodeImg: {
    width: 256,
    height: 256,
  },
  infos: {
    marginTop: 24,
    marginBottom: 24,
    flexDirection: "column",
  },
  footer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
  },
});
