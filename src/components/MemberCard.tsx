import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "./AppText";
import Icon from "./Icon";
import { UserService } from "../services/api/user-service";
import { User, UserResponse } from "../models/user";
import QRCode from "react-native-qrcode-svg";
import env from "@/env";
import { notify } from "./NotificationContainer";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function MemberCard({ onClose, visible }: Props) {
  const { user, token } = useAuth();
  const [connectedUser, setConnectedUser] = useState<User>();
  const [qrToken, setQrToken] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);

  const generateQRToken = async () => {
    if (user && token) {
      try {
        setIsGeneratingQR(true);
        const response = await fetch(
          `${env.API_URL}/verifications/generate-qr-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Response is not JSON:", textResponse);
          notify({
            type: "error",
            title: "Erreur serveur - Réponse invalide",
          });
          return;
        }

        const data = await response.json();

        if (response.ok && data.success) {
          // Format du QR: URL de vérification + token
          const qrData = `${env.API_URL}/verifications/verify-page/${data.qrToken}`;
          console.log("QR Data:", qrData);
          setQrToken(qrData);
        } else {
          console.error("Failed to generate QR token:", data);
          notify({
            type: "error",
            title: data.message || "Impossible de générer le QR code",
          });
        }
      } catch (error) {
        console.error("Network error:", error);
        notify({ type: "error", title: "Erreur réseau" });
      } finally {
        setIsGeneratingQR(false);
      }
    }
  };

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

  useEffect(() => {
    if (visible && user) {
      // Reset QR token when modal opens
      setQrToken("");
      generateQRToken();
    }
  }, [visible, user, token]);

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
          {isGeneratingQR ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.deepBlue} />
              <AppText style={styles.loadingText}>
                Génération du QR code...
              </AppText>
            </View>
          ) : qrToken ? (
            <QRCode
              value={qrToken}
              size={200}
              backgroundColor="white"
              color="black"
            />
          ) : (
            <View style={styles.errorContainer}>
              <AppText style={styles.errorText}>
                Erreur lors de la génération du QR code
              </AppText>
              <Pressable style={styles.retryButton} onPress={generateQRToken}>
                <AppText style={styles.retryButtonText}>Réessayer</AppText>
              </Pressable>
            </View>
          )}
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
          <AppText style={{ marginBottom: 4 }}>
            Profil: {connectedUser.profileCategory}
          </AppText>
          <AppText>
            Statut: {connectedUser.isActive ? "Actif" : "Inactif"}
          </AppText>
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
    minHeight: 200,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.deepBlue,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: Colors.deepBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
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
