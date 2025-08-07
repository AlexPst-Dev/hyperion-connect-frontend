import AppButton from "@/src/components/AppButton";
import AppText from "@/src/components/AppText";
import Input from "@/src/components/Input";
import PopUp from "@/src/components/PopUp";
import GlobalStyles, { Colors } from "@/src/styles/styles";
import { authService } from "@/src/services/api/authService";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  View,
  Modal,
  Pressable,
} from "react-native";
import { useAuth } from "@/src/hooks/useAuth";
import { notify } from "@/src/components/NotificationContainer";
import { UserService } from "@/src/services/api/user-service";

export default function ParametersScreen() {
  const screenWidth = Dimensions.get("window").width;
  const [editPwdPopupVisible, setEditPwdPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deleteUserAccountPopupVisible, setDeleteUserAccountPopupVisible] =
    useState(false);

  const { token, logout } = useAuth();

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // États pour les erreurs
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    };

    let isValid = true;

    // Validation ancien mot de passe
    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "L'ancien mot de passe est requis";
      isValid = false;
    }

    // Validation nouveau mot de passe
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
      isValid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword =
        "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }

    // Validation confirmation
    if (!formData.confirmNewPassword.trim()) {
      newErrors.confirmNewPassword =
        "Veuillez confirmer votre nouveau mot de passe";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (
      formData.oldPassword === formData.newPassword &&
      formData.oldPassword.trim()
    ) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit être différent de l'ancien";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeUserPwd = async () => {
    if (!validateForm() || !token) {
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        token
      );

      // Succès
      notify({
        title: "Votre mot de passe a été modifié avec succès",
        type: "success",
      });
    } catch (error: any) {
      console.error("Erreur changement mot de passe:", error);

      notify({
        title:
          "Erreur lors du changement : L'ancien mot de passe ne correspond pas",
        type: "error",
      });
    } finally {
      setLoading(false);
      setEditPwdPopupVisible(false);
    }
  };

  const resetForm = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setErrors({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const handleClosePopup = () => {
    setEditPwdPopupVisible(false);
    resetForm();
  };

  const handleDeleteUserAccount = async () => {
    if (token) {
      try {
        await UserService.deleteCurrentUser(token);
        await logout();
      } catch (e) {
        console.log("Error while deleting user account : ", e);
        notify({
          title:
            "Une erreur est survenue durant la suppression de votre compte",
          type: "error",
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={
          Platform.OS === "web"
            ? { maxHeight: screenWidth + 180, paddingBottom: 32 }
            : {}
        }
      >
        <View style={{ flexDirection: "column", gap: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText>Changer de mot de passe ?</AppText>
            <AppButton
              type="secondary"
              title="Modifier"
              iconName="pencil"
              onPress={() => {
                setEditPwdPopupVisible(true);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText>Supprimer votre compte ?</AppText>
            <AppButton
              type="linkNormal"
              title="Supprimer"
              iconName="trash"
              borderColor={Colors.lightRed}
              iconColor={Colors.lightRed}
              textStyle={{ color: Colors.lightRed }}
              onPress={() => {
                setDeleteUserAccountPopupVisible(true);
              }}
            />
          </View>
        </View>

        {editPwdPopupVisible && (
          <Modal
            visible={editPwdPopupVisible}
            animationType="fade"
            transparent
            statusBarTranslucent
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 32,
              }}
              onPress={handleClosePopup}
            >
              <Pressable
                style={{ width: "90%" }}
                onPress={(e) => e.stopPropagation()}
              >
                <PopUp
                  title="Changer de mot de passe"
                  paragraph="Sécurisez votre compte avec un nouveau mot de passe"
                  onClose={handleClosePopup}
                  onSubmit={handleChangeUserPwd}
                  btnText={loading ? "Modification..." : "Modifier"}
                  btnType="primary"
                  iconName="check"
                  closeText="Annuler"
                  inputs={
                    <>
                      <Input
                        type="password"
                        label="Ancien mot de passe"
                        placeholder="********"
                        value={formData.oldPassword}
                        onChangeText={(text) =>
                          setFormData((prev) => ({
                            ...prev,
                            oldPassword: text,
                          }))
                        }
                      />
                      {errors.oldPassword && (
                        <AppText style={{ color: Colors.lightRed }}>
                          {errors.oldPassword}
                        </AppText>
                      )}
                      <Input
                        type="password"
                        label="Nouveau mot de passe"
                        placeholder="********"
                        value={formData.newPassword}
                        onChangeText={(text) =>
                          setFormData((prev) => ({
                            ...prev,
                            newPassword: text,
                          }))
                        }
                      />
                      {errors.newPassword && (
                        <AppText style={{ color: Colors.lightRed }}>
                          {errors.newPassword}
                        </AppText>
                      )}
                      <Input
                        type="password"
                        label="Confirmez votre nouveau mot de passe"
                        placeholder="********"
                        value={formData.confirmNewPassword}
                        onChangeText={(text) =>
                          setFormData((prev) => ({
                            ...prev,
                            confirmNewPassword: text,
                          }))
                        }
                      />
                      {errors.confirmNewPassword && (
                        <AppText style={{ color: Colors.lightRed }}>
                          {errors.confirmNewPassword}
                        </AppText>
                      )}
                    </>
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>
        )}

        {deleteUserAccountPopupVisible && (
          <Modal
            visible={deleteUserAccountPopupVisible}
            animationType="fade"
            transparent
            statusBarTranslucent
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 32,
              }}
              onPress={() => setDeleteUserAccountPopupVisible(false)}
            >
              <Pressable
                style={{ width: "90%" }}
                onPress={(e) => e.stopPropagation()}
              >
                <PopUp
                  title="Supprimer votre compte"
                  paragraph="Souhaitez vous supprimer définitivement votre compte et ses données associées ?"
                  onClose={() => setDeleteUserAccountPopupVisible(false)}
                  onSubmit={handleDeleteUserAccount}
                  closeText="Annuler"
                  btnText="Supprimer"
                  btnType="primary"
                  iconName="trash"
                />
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
