import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Pressable,
  Linking,
  Modal,
} from "react-native";
import AppText from "../components/AppText";
import GlobalStyles, { Colors } from "../styles/styles";
import UserCard from "../components/UserCard";
import AppButton from "../components/AppButton";
import { Company } from "../models/company";
import { CompanyService } from "../services/api/company-service";
import { useAuth } from "../hooks/useAuth";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import Icon from "../components/Icon";
import { notify } from "../components/NotificationContainer";

export default function Companycreen() {
  const { user, token } = useAuth();

  const [connectedCompany, setConnectedCompany] = useState<Company>();

  const [editCompanyPopupVisible, setEditCompanyPopupVisible] = useState(false);
  const [editSocialsLinks, setEditSocialsLinks] = useState(false);

  useEffect(() => {
    async function fetchCompanyConnected() {
      if (!token || !user) return;
      try {
        const allCompanies = await CompanyService.getAllCompanies(token);
        const companyConnected = allCompanies.filter(
          (c) => c.responsibleId === user.id
        )[0];
        setConnectedCompany(companyConnected);
      } catch (e) {
        console.log(
          "Error while fetching companies and the connected company : ",
          e
        );
      }
    }
    fetchCompanyConnected();
  }, [user, token]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    postalCode: "",
    street: "",
    filePictureUrl: "",
    linkWebsite: "",
    linkFacebook: "",
    linkInstagram: "",
    linkLinkedin: "",
    linkTiktok: "",
    linkYoutube: "",
  });

  // Pre-fill form when opening the modal
  useEffect(() => {
    if (editCompanyPopupVisible && connectedCompany) {
      setForm({
        name: connectedCompany.name || "",
        description: connectedCompany.description || "",
        city: connectedCompany.city || "",
        postalCode: connectedCompany.postalCode || "",
        street: connectedCompany.street || "",
        filePictureUrl: connectedCompany.fileImageCompany
          ? connectedCompany.fileImageCompany.url
          : "",
        linkWebsite: connectedCompany.linkWebsite || "",
        linkFacebook: connectedCompany.linkFacebook || "",
        linkInstagram: connectedCompany.linkInstagram || "",
        linkLinkedin: connectedCompany.linkLinkedin || "",
        linkTiktok: connectedCompany.linkTiktok || "",
        linkYoutube: connectedCompany.linkYoutube || "",
      });
    }
  }, [editCompanyPopupVisible, connectedCompany]);
  useEffect(() => {
    if (editSocialsLinks && connectedCompany) {
      setForm((prev) => ({
        ...prev,
        linkFacebook: connectedCompany.linkFacebook || "",
        linkInstagram: connectedCompany.linkInstagram || "",
        linkLinkedin: connectedCompany.linkLinkedin || "",
        linkTiktok: connectedCompany.linkTiktok || "",
        linkYoutube: connectedCompany.linkYoutube || "",
      }));
    }
  }, [editSocialsLinks, connectedCompany]);

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!connectedCompany || !token) return;
    try {
      await CompanyService.updateCompany(connectedCompany.id, form, token);
      // Optionally refetch company info
      const updatedCompany = await CompanyService.getCompanyById(
        connectedCompany.id,
        token
      );
      setConnectedCompany(updatedCompany);
      setEditCompanyPopupVisible(false);
      setEditSocialsLinks(false);
      notify({
        title: "Informations modifiées avec succès",
        type: "success",
      });
    } catch (e) {
      // Handle error (show a message, etc.)
      console.log("Error updating company:", e);
      notify({
        title: "Les informations n'ont pas pu être modifiées",
        type: "error",
      });
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
      >
        {connectedCompany ? (
          <View style={{ flexDirection: "column", gap: 24 }}>
            <UserCard
              companyName={connectedCompany.name}
              companyAdress={`${connectedCompany.street}, ${connectedCompany.city} ${connectedCompany.postalCode}`}
              profilePictureUrl={
                connectedCompany.fileImageCompany
                  ? connectedCompany.fileImageCompany.url
                  : ""
              }
              companyLink={connectedCompany.linkWebsite}
            />
            <AppText>Réseaux sociaux</AppText>
            {connectedCompany.linkFacebook ||
            connectedCompany.linkInstagram ||
            connectedCompany.linkLinkedin ||
            connectedCompany.linkTiktok ||
            connectedCompany.linkYoutube ? (
              <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                {connectedCompany.linkFacebook && (
                  <Pressable
                    style={{ width: 64, height: 64, borderRadius: 16 }}
                    onPress={() =>
                      connectedCompany.linkFacebook
                        ? Linking.openURL(connectedCompany.linkFacebook)
                        : {}
                    }
                  >
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </Pressable>
                )}
                {connectedCompany.linkInstagram && (
                  <Pressable
                    style={{ width: 64, height: 64, borderRadius: 16 }}
                    onPress={() =>
                      connectedCompany.linkInstagram
                        ? Linking.openURL(connectedCompany.linkInstagram)
                        : {}
                    }
                  >
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </Pressable>
                )}
                {connectedCompany.linkLinkedin && (
                  <Pressable
                    style={{ width: 64, height: 64, borderRadius: 16 }}
                    onPress={() =>
                      connectedCompany.linkLinkedin
                        ? Linking.openURL(connectedCompany.linkLinkedin)
                        : {}
                    }
                  >
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </Pressable>
                )}
                {connectedCompany.linkTiktok && (
                  <Pressable
                    style={{ width: 64, height: 64, borderRadius: 16 }}
                    onPress={() =>
                      connectedCompany.linkTiktok
                        ? Linking.openURL(connectedCompany.linkTiktok)
                        : {}
                    }
                  >
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </Pressable>
                )}
                {connectedCompany.linkYoutube && (
                  <Pressable
                    style={{ width: 64, height: 64, borderRadius: 16 }}
                    onPress={() =>
                      connectedCompany.linkYoutube
                        ? Linking.openURL(connectedCompany.linkYoutube)
                        : {}
                    }
                  >
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </Pressable>
                )}
                <Pressable
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: Colors.deepBlue,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setEditSocialsLinks(true)}
                >
                  <Icon
                    name="pencil"
                    strokeColor={Colors.deepBlue}
                    fillColor="transparent"
                  />
                </Pressable>
              </View>
            ) : (
              <>
                <AppText>
                  Aucun réseaux social enregistré pour le moment.
                </AppText>
                <Pressable
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: Colors.deepBlue,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setEditSocialsLinks(true)}
                >
                  <Icon
                    name="pencil"
                    strokeColor={Colors.deepBlue}
                    fillColor="transparent"
                  />
                </Pressable>
              </>
            )}
            <AppText>{connectedCompany.description}</AppText>
            <AppText>
              Adhésion valide jusqu'au{" "}
              {new Date(
                connectedCompany.dateEndMembership ?? ""
              ).toLocaleDateString("fr-FR")}
            </AppText>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                type="primary"
                title="Modifier"
                iconName="pencil"
                onPress={() => {
                  setEditCompanyPopupVisible(true);
                }}
              />
            </View>
          </View>
        ) : (
          <View>
            <AppText>
              Aucune entreprise est associé à ce compte partenaire.
            </AppText>
          </View>
        )}
        {editCompanyPopupVisible && (
          <Modal
            visible={editCompanyPopupVisible}
            onRequestClose={() => setEditCompanyPopupVisible(false)}
            transparent
          >
            <Pressable
              onPress={() => setEditCompanyPopupVisible(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                onClose={() => setEditCompanyPopupVisible(false)}
                title={"Modifier les informations de l'entreprise"}
                onSubmit={handleSubmit}
                btnText="Modifier"
                btnType="primary"
                iconName="pencil"
                closeText="Annuler"
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Nom"
                      placeholder="Nom de l'entreprise"
                      value={form.name}
                      onChangeText={(v) => handleChange("name", v)}
                    />
                    <Input
                      type="textarea"
                      label="Description"
                      placeholder="Description"
                      value={form.description}
                      onChangeText={(v) => handleChange("description", v)}
                    />
                    <Input
                      type="text"
                      label="Adresse"
                      placeholder="Adresse"
                      value={form.street}
                      onChangeText={(v) => handleChange("street", v)}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Input
                          type="text"
                          label="Ville"
                          placeholder="Ville"
                          value={form.city}
                          onChangeText={(v) => handleChange("city", v)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input
                          type="text"
                          label="Code postal"
                          placeholder="Code postal"
                          value={form.postalCode}
                          onChangeText={(v) => handleChange("postalCode", v)}
                        />
                      </View>
                    </View>
                    <Input
                      type="text"
                      label="Site web"
                      placeholder="https://"
                      value={form.linkWebsite}
                      onChangeText={(v) => handleChange("linkWebsite", v)}
                    />
                    <Input
                      type="text"
                      label="Image de l'entreprise"
                      placeholder="https://"
                      value={form.filePictureUrl}
                      onChangeText={(v) => handleChange("filePictureUrl", v)}
                    />
                  </>
                }
              />
            </Pressable>
          </Modal>
        )}
        {editSocialsLinks && (
          <Modal
            visible={editSocialsLinks}
            onRequestClose={() => setEditSocialsLinks(false)}
            transparent
          >
            <Pressable
              onPress={() => setEditSocialsLinks(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <PopUp
                onClose={() => setEditSocialsLinks(false)}
                title={"Modifier les réseaux sociaux de l'entreprise"}
                onSubmit={handleSubmit}
                btnText="Modifier"
                btnType="primary"
                iconName="pencil"
                closeText="Annuler"
                inputs={
                  <>
                    <Input
                      type="text"
                      label="Facebook"
                      placeholder="https://facebook.com/..."
                      value={form.linkFacebook}
                      onChangeText={(v) => handleChange("linkFacebook", v)}
                    />
                    <Input
                      type="text"
                      label="Instagram"
                      placeholder="https://instagram.com/..."
                      value={form.linkInstagram}
                      onChangeText={(v) => handleChange("linkInstagram", v)}
                    />
                    <Input
                      type="text"
                      label="LinkedIn"
                      placeholder="https://linkedin.com/..."
                      value={form.linkLinkedin}
                      onChangeText={(v) => handleChange("linkLinkedin", v)}
                    />
                    <Input
                      type="text"
                      label="TikTok"
                      placeholder="https://tiktok.com/..."
                      value={form.linkTiktok}
                      onChangeText={(v) => handleChange("linkTiktok", v)}
                    />
                    <Input
                      type="text"
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      value={form.linkYoutube}
                      onChangeText={(v) => handleChange("linkYoutube", v)}
                    />
                  </>
                }
              />
            </Pressable>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
