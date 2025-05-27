// src/screens/SessionDetailScreen.tsx
import React, { JSX, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import GlobalStyles, { Colors } from "../styles/styles";
import UserCard from "../components/UserCard";
import AppText from "../components/AppText";
import ViewController from "../components/ViewController";
import { User } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import AppButton from "../components/AppButton";
import Objective from "../components/Objective";
import Session from "../components/Session";
import Label from "../components/Label";
import BillingGroup from "../components/BillingGroup";
import BillingLine from "../components/BillingLine";
import ItemUser from "../components/ItemUser";
import OfferCard from "../components/OfferCard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PopUp from "../components/PopUp";
import Input from "../components/Input";
import ProgressGraph from "../components/ProgressGraph";

type ClientDetailRouteProp = RouteProp<RootStackParamList, "ClientDetail">;

export default function ClientDetailScreen() {
  const route = useRoute<ClientDetailRouteProp>();
  const { client } = route.params;

  type ClientDetailPageRenderer = (user: User) => JSX.Element;

  const { user } = useAuth();

  if (!user) return null;

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "OffersHistory"
  >;
  const navigation = useNavigation<NavigationProp>();

  const [
    editSubscriptionEditPopUpVisible,
    setEditSubscriptionEditPopUpVisible,
  ] = useState(false);

  const clientInformationsContent: JSX.Element = (
    <>
      <View style={{ flexDirection: "column", gap: 24 }}>
        <UserCard
          detailled
          canBeContacted
          firstName={client.firstName}
          lastName={client.lastName}
          susbcriptionLabel={
            client.profileCategory === "sportsman" ? "Gold" : ""
          }
          email={client.email}
          phone="0606060606"
          sport={client.profileCategory === "sportsman" ? "Running" : ""}
          age="24"
          profilePictureUrl="users/profilePicture/img-profile-1"
        />
        <AppText>Réseaux sociaux</AppText>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ width: 64, height: 64, borderRadius: 16 }}>
            <Image
              source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
              style={{ height: "100%" }}
            />
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 16 }}>
            <Image
              source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
              style={{ height: "100%" }}
            />
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 16 }}>
            <Image
              source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
              style={{ height: "100%" }}
            />
          </View>
        </View>
        <AppText>
          Passionné de trail et de nature, je participe régulièrement à des
          courses en montagne. J'aime partager mes expériences et conseiller les
          autres coureurs sur les meilleures techniques et équipements pour le
          trail.
        </AppText>
        {/* Tests sportifs & bilans */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>TESTS SPORTIFS & BILANS</AppText>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <AppText>Premier_Test_Physique-2025.pdf</AppText>
              <Icon
                name="download"
                width={24}
                height={24}
                fillColor="transparent"
                strokeColor="black"
                strokeWidth={2}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <AppText>Bilan_Février_2025.pdf</AppText>
              <Icon
                name="download"
                width={24}
                height={24}
                fillColor="transparent"
                strokeColor="black"
                strokeWidth={2}
              />
            </View>
          </View>
          {user.profileCategory === "admin" ||
            (user.profileCategory === "coach" && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton type="add" iconName="plus" />
              </View>
            ))}
        </View>
        {/* Comptes rendus médicaux */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>COMPTES RENDUS MEDICAUX</AppText>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <AppText>Résultats_Analyse_Sanguine_2025.pdf</AppText>
              <Icon
                name="download"
                width={24}
                height={24}
                fillColor="transparent"
                strokeColor="black"
                strokeWidth={2}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <AppText>Compte_Rendu_IRM_Genou_2025.pdf</AppText>
              <Icon
                name="download"
                width={24}
                height={24}
                fillColor="transparent"
                strokeColor="black"
                strokeWidth={2}
              />
            </View>
          </View>
          {user.profileCategory === "admin" ||
            (user.profileCategory === "medic" && (
              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <AppButton type="add" iconName="plus" />
              </View>
            ))}
        </View>
        {/* Notes */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>NOTES</AppText>
          <View>
            <AppText style={{ fontWeight: "bold" }}>
              [Consultant] NOM Prénom - le DD/MM/YYYY à HH:MM
            </AppText>
            <AppText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id
              volutpat sem. Vestibulum finibus lacus ante, at facilisis felis
              lobortis varius. Morbi gravida dui placerat, tincidunt ligula vel,
              auctor dolor. Nulla lorem nisl, tempus nec leo sit amet, sodales
              volutpat sem. In eget justo urna. Sed nec auctor odio.
            </AppText>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton type="add" iconName="plus" />
          </View>
        </View>
        {/* Prestation & échéance */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h2}>PRESTATION & ECHEANCES</AppText>
          <Objective
            duration={10}
            onGoingNumber={7}
            label="Suivi par un coach sportif de running pour un marathon"
          />
          {user.profileCategory === "admin" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppButton
                type="linkNormal"
                title="Voir la facturation"
                iconName="eye"
              />
              <AppButton type="add" iconName="plus" />
            </View>
          )}
          <AppText style={GlobalStyles.h3}>PLAN DE PERFORMANCES</AppText>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Session
              title="Séance de fractionné"
              nbExercises={5}
              durationTime={68}
              labels={[
                <Label key={1} type="blue" size="small" title="Label" />,
                <Label key={2} type="blue" size="small" title="Label" />,
              ]}
            />
            <Session
              title="Séance de fractionné"
              nbExercises={5}
              durationTime={68}
              labels={[
                <Label key={3} type="blue" size="small" title="Label" />,
                <Label key={4} type="blue" size="small" title="Label" />,
              ]}
            />
            <Session
              title="Séance de fractionné"
              nbExercises={5}
              durationTime={68}
              labels={[
                <Label key={5} type="blue" size="small" title="Label" />,
                <Label key={6} type="blue" size="small" title="Label" />,
              ]}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <AppButton
                type="primary"
                title="Envoyer un plan"
                iconName="send"
              />
            </View>
          </View>
          {user.profileCategory === "coach" && (
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>AVANCEMENT</AppText>
              <Session
                title="Séance de fracitionné"
                isToDo
                onChangeStateBtnPress={() => {}}
                hasChangeStateBtn
                nbExercises={5}
                durationTime={68}
                labels={[
                  <Label key={1} type="blue" size="small" title="Label" />,
                  <Label key={2} type="blue" size="small" title="Label" />,
                ]}
              />
            </View>
          )}
        </View>
        {/* Formulaire de suivi */}
        <View style={{ flexDirection: "column", gap: 16 }}>
          <AppText style={GlobalStyles.h3}>FORMULAIRE DE SUIVI</AppText>
          <View>
            <AppText style={{ fontWeight: "bold" }}>
              Mis à jour le DD/MM/YYYY
            </AppText>
            <AppText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id
              volutpat sem.
            </AppText>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <AppButton type="primary" title="Télécharger" iconName="download" />
          </View>
        </View>
        <View>
          <ProgressGraph
            title="Historique des performances"
            data={[
              { month: "Jan", value: 55 },
              { month: "Fév", value: 62 },
              { month: "Mar", value: 60 },
              { month: "Avr", value: 68 },
              { month: "Mai", value: 55 },
              { month: "Jun", value: 62 },
              { month: "Jul", value: 70 },
              { month: "Aou", value: 65 },
              { month: "Sep", value: 72 },
              { month: "Oct", value: 70 },
              { month: "Nov", value: 86 },
              { month: "Dec", value: 92 },
            ]}
          />
        </View>
        {/* User profile management */}
        {user.profileCategory === "admin" && (
          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AppButton type="primary" title="Archiver" iconName="archive" />
              <AppButton
                type="secondary"
                title="Abonnement"
                iconName="subscription"
                onPress={() => {
                  setEditSubscriptionEditPopUpVisible(
                    !editSubscriptionEditPopUpVisible
                  );
                }}
              />
            </View>
          </View>
        )}
      </View>
    </>
  );

  const ClientDetailPageByProfile: Record<string, ClientDetailPageRenderer> = {
    coach: (user) => <>{clientInformationsContent}</>,
    medic: (user) => <>{clientInformationsContent}</>,
    admin: (user) => {
      const [editNewOfferPopUpVisible, setEditNewOfferPopUpVisible] =
        useState(false);
      const [newOfferType, setNewOfferType] = useState("commerciale");
      const handleTypeNewOffer = () => {
        if (newOfferType === "commerciale") {
          setNewOfferType("sponsoring");
        } else if (newOfferType === "sponsoring") {
          setNewOfferType("commerciale");
        }
      };
      const handleEditNewOfferPopUp = () => {
        setEditNewOfferPopUpVisible(!editNewOfferPopUpVisible);
      };

      switch (client.profileCategory) {
        case "sportsman":
          const [activeTabIndex, setActiveTabIndex] = useState(0);
          const tabViews: JSX.Element[] = [
            <View key="informations">{clientInformationsContent}</View>,
            <View key="billing" style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>FACTURATION</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <AppText style={{ fontWeight: "bold" }}>
                  Plan de facturation choisi
                </AppText>
                <View>
                  <AppText>Lorem ipsum dolor sit amet</AppText>
                  <AppText>Consectetur adipiscing elit</AppText>
                  <AppText>Sed do eiusmod tempor incididunt</AppText>
                </View>
              </View>
              <BillingGroup
                label="Suivi par un coach sportif de running"
                proFirstName="Alex"
                proLastName="MARTIN"
                sportsmanFirstName="John"
                sportsmanLastName="Doe"
                billingStartDate={new Date("2025-01-01")}
                billingEndDate={new Date("2025-10-01")}
                globalAmount={10000}
                billingLines={[
                  <BillingLine
                    amount={500}
                    state="pending"
                    startDate={new Date("2025-06-01")}
                    endDate={new Date("2025-07-01")}
                    key={1}
                  />,
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-05-01")}
                    endDate={new Date("2025-06-01")}
                    key={2}
                  />,
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-04-01")}
                    endDate={new Date("2025-05-01")}
                    key={3}
                  />,
                ]}
              />
              <BillingGroup
                label="Suivi par un coach sportif de running"
                proFirstName="Alex"
                proLastName="MARTIN"
                sportsmanFirstName="John"
                sportsmanLastName="Doe"
                billingStartDate={new Date("2025-01-01")}
                billingEndDate={new Date("2025-10-01")}
                globalAmount={10000}
                billingLines={[
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-06-01")}
                    endDate={new Date("2025-07-01")}
                    key={4}
                  />,
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-05-01")}
                    endDate={new Date("2025-06-01")}
                    key={5}
                  />,
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-04-01")}
                    endDate={new Date("2025-05-01")}
                    key={6}
                  />,
                ]}
              />
              <BillingGroup
                label="Suivi par un coach sportif de running"
                proFirstName="Alex"
                proLastName="MARTIN"
                sportsmanFirstName="John"
                sportsmanLastName="Doe"
                billingStartDate={new Date("2025-01-01")}
                billingEndDate={new Date("2025-10-01")}
                globalAmount={10000}
                billingLines={[
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-06-01")}
                    endDate={new Date("2025-07-01")}
                    key={7}
                  />,
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-05-01")}
                    endDate={new Date("2025-06-01")}
                    key={8}
                  />,
                  <BillingLine
                    amount={500}
                    state="received"
                    startDate={new Date("2025-04-01")}
                    endDate={new Date("2025-05-01")}
                    key={9}
                  />,
                ]}
              />
            </View>,
            <View key="medics" style={{ flexDirection: "column", gap: 24 }}>
              <AppText style={GlobalStyles.h2}>SOIGNANTS</AppText>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <ItemUser
                  firstName="firstName"
                  lastName="Lastname"
                  job="Kinésithérapeute"
                  isCompany={false}
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <AppButton
                    type="linkSmall"
                    title="Supprimer"
                    iconName="trash"
                    textStyle={{ color: Colors.lightRed }}
                    borderColor={Colors.lightRed}
                    iconColor={Colors.lightRed}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <ItemUser
                  firstName="firstName"
                  lastName="Lastname"
                  job="Osthéopathe"
                  isCompany={false}
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <AppButton
                    type="linkSmall"
                    title="Supprimer"
                    iconName="trash"
                    textStyle={{ color: Colors.lightRed }}
                    borderColor={Colors.lightRed}
                    iconColor={Colors.lightRed}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "column", gap: 16 }}>
                <ItemUser
                  firstName="firstName"
                  lastName="Lastname"
                  job="Médecin généraliste"
                  isCompany={false}
                />
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <AppButton
                    type="linkSmall"
                    title="Supprimer"
                    iconName="trash"
                    textStyle={{ color: Colors.lightRed }}
                    borderColor={Colors.lightRed}
                    iconColor={Colors.lightRed}
                  />
                </View>
              </View>
            </View>,
          ];

          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <ViewController
                  tabs={[
                    { title: "Informations", icon: "information" },
                    { title: "Facturation", icon: "billing" },
                    { title: "Soignants", icon: "medic" },
                  ]}
                  onTabChange={setActiveTabIndex}
                />
                {tabViews[activeTabIndex]}
              </View>
              <Modal
                visible={editSubscriptionEditPopUpVisible}
                transparent
                onRequestClose={() => {
                  setEditSubscriptionEditPopUpVisible(false);
                }}
              >
                <Pressable
                  onPress={() => {
                    setEditSubscriptionEditPopUpVisible(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    padding: 24,
                  }}
                >
                  <PopUp
                    title="Editer l'abonnement"
                    paragraph="Importez le contrat d'offre d'abonnement ici"
                    specificBody={
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                        }}
                      >
                        <AppButton
                          type="secondary"
                          title="Sélectionner le fichier"
                          iconName="download"
                        />
                      </View>
                    }
                    inputs={
                      <>
                        <Input
                          type="selector"
                          label="Choix du diagnostic"
                          options={[
                            {
                              label: "Gold",
                              value: "gold",
                            },
                            {
                              label: "Silver",
                              value: "silver",
                            },
                          ]}
                        />
                      </>
                    }
                    onClose={() =>
                      setEditSubscriptionEditPopUpVisible(
                        !editSubscriptionEditPopUpVisible
                      )
                    }
                    closeText="Annuler"
                    onSubmit={() =>
                      setEditSubscriptionEditPopUpVisible(
                        !editSubscriptionEditPopUpVisible
                      )
                    }
                    btnType="primary"
                    btnText="Modifier"
                    iconName="check"
                  />
                </Pressable>
              </Modal>
            </>
          );
        case "medic":
          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <UserCard
                  detailled
                  canBeContacted
                  firstName={client.firstName}
                  lastName={client.lastName}
                  email={client.email}
                  phone="0606060606"
                  age="24"
                  profilePictureUrl="users/profilePicture/img-profile-1"
                />
                <AppText>Réseaux sociaux</AppText>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                </View>
                <AppText>
                  Passionné de trail et de nature, je participe régulièrement à
                  des courses en montagne. J'aime partager mes expériences et
                  conseiller les autres coureurs sur les meilleures techniques
                  et équipements pour le trail.
                </AppText>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>SES PATIENTS</AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    <ItemUser
                      firstName="firstName"
                      lastName="LastName"
                      sport="Running"
                      job="Dentiste"
                      isCompany={false}
                    />
                    <ItemUser
                      firstName="firstName"
                      lastName="LastName"
                      sport="Danse"
                      job="Charpentier"
                      isCompany={false}
                    />
                  </View>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <AppButton type="add" iconName="plus" />
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AppButton
                      type="primary"
                      title="Archiver"
                      iconName="archive"
                    />
                  </View>
                </View>
              </View>
            </>
          );
        case "coach":
          return (
            <>
              <View style={{ flexDirection: "column", gap: 24 }}>
                <UserCard
                  detailled
                  canBeContacted
                  firstName={client.firstName}
                  lastName={client.lastName}
                  email={client.email}
                  phone="0606060606"
                  age="24"
                  profilePictureUrl="users/profilePicture/img-profile-1"
                />
                <AppText>Réseaux sociaux</AppText>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                  <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                    <Image
                      source={{
                        uri: "https://reactnative.dev/img/tiny_logo.png",
                      }}
                      style={{ height: "100%" }}
                    />
                  </View>
                </View>
                <AppText>
                  Passionné de trail et de nature, je participe régulièrement à
                  des courses en montagne. J'aime partager mes expériences et
                  conseiller les autres coureurs sur les meilleures techniques
                  et équipements pour le trail.
                </AppText>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>SES CLIENTS</AppText>
                  <View style={{ flexDirection: "column", gap: 8 }}>
                    <ItemUser
                      firstName="firstName"
                      lastName="LastName"
                      sport="Running"
                      job="Dentiste"
                      isCompany={false}
                    />
                    <ItemUser
                      firstName="firstName"
                      lastName="LastName"
                      sport="Danse"
                      job="Charpentier"
                      isCompany={false}
                    />
                  </View>
                  <View
                    style={{ flexDirection: "row", justifyContent: "center" }}
                  >
                    <AppButton type="add" iconName="plus" />
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AppButton
                      type="primary"
                      title="Archiver"
                      iconName="archive"
                    />
                  </View>
                </View>
              </View>
            </>
          );
        case "partner":
          return (
            <>
              <View style={{ flexDirection: "column", gap: 32 }}>
                <View style={{ flexDirection: "column", gap: 24 }}>
                  <UserCard
                    companyName={client.firstName}
                    companyAdress="10 rue François Mitterand 56000 Vannes"
                    profilePictureUrl="users/companies/nutrisport-logo"
                    companyLink="https://nutrisport.com"
                  />
                  <AppText>Adhésion valide jusqu'au XX/XX/XXXX</AppText>
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <AppButton
                      type="primary"
                      title="Modifier"
                      iconName="pencil"
                    />
                  </View>
                  <AppText style={GlobalStyles.h3}>REPRESENTANT</AppText>
                  <UserCard
                    detailled
                    canBeContacted
                    firstName="firstName"
                    lastName="LastName"
                    email={client.email}
                    phone="0606060606"
                    age="24"
                    profilePictureUrl="users/profilePicture/img-profile-1"
                  />
                  <AppText>Réseaux sociaux entreprise</AppText>
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                    <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                    <View style={{ width: 64, height: 64, borderRadius: 16 }}>
                      <Image
                        source={{
                          uri: "https://reactnative.dev/img/tiny_logo.png",
                        }}
                        style={{ height: "100%" }}
                      />
                    </View>
                  </View>
                  <AppText>
                    Nutrisport a pour but d'offrir des produits nutritionnels de
                    qualité aux sportifs et promouvoir la marque via des
                    événements et des sponsorings.
                  </AppText>
                </View>
                <View style={{ flexDirection: "column", gap: 24 }}>
                  <AppText style={GlobalStyles.h2}>OFFRES</AppText>
                  <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                  >
                    <AppButton
                      type="linkNormal"
                      title="Historique"
                      iconName="eye"
                      onPress={() => {
                        navigation.navigate("OffersHistory");
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    <OfferCard
                      companyName={client.firstName}
                      companyImgUrl="users/companies/nutrisport-logo"
                      title="Abonnement Acces +"
                      paragraph="-20% pour les 3 premiers mois sur l'abonnement Acces + et frais d'adhésion offert. "
                      conditions="Bon à usage unique."
                      startDate={new Date("2025-03-30")}
                      endDate={new Date("2025-04-30")}
                      isSponsorship={false}
                      labelTxt="-20%"
                      onPress={() => {}}
                      iconName="link"
                    />
                    <OfferCard
                      companyName={client.firstName}
                      companyImgUrl="users/companies/nutrisport-logo"
                      title="Marathon de Vannes"
                      paragraph="Offre de sponsoring pour le marathon de Vannes. T-shirt running et dossard offert."
                      conditions="Plan d'entrainement running sur Hyperion Connect requis."
                      startDate={new Date("2025-03-30")}
                      endDate={new Date("2025-04-30")}
                      isSponsorship
                      onPress={() => {}}
                      iconName="send"
                    />
                    <View
                      style={{ flexDirection: "row", justifyContent: "center" }}
                    >
                      <AppButton
                        type="add"
                        iconName="plus"
                        onPress={handleEditNewOfferPopUp}
                      />
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <AppText style={GlobalStyles.h2}>GESTION DU PROFIL</AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <AppButton
                      type="primary"
                      title="Archiver"
                      iconName="archive"
                    />
                  </View>
                </View>
              </View>
              <Modal
                visible={editNewOfferPopUpVisible}
                transparent
                onRequestClose={handleEditNewOfferPopUp}
              >
                <Pressable
                  onPress={handleEditNewOfferPopUp}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    padding: 24,
                  }}
                >
                  <PopUp
                    title="Editer une offre partenaire"
                    paragraph="De quelle type d'offre s'agit t'il ? "
                    onClose={handleEditNewOfferPopUp}
                    closeText="Annuler"
                    onSubmit={handleEditNewOfferPopUp}
                    btnText="Valider"
                    btnType="primary"
                    iconName="check"
                    specificBody={
                      <View style={{ flexDirection: "column", gap: 16 }}>
                        <View style={{ flexDirection: "column", gap: 8 }}>
                          <Input
                            type="selector"
                            label="Catégorie d'offre"
                            options={[
                              {
                                label: "Offre commerciale",
                                value: "commerciale",
                              },
                              {
                                label: "Offre de sponsoring",
                                value: "sponsoring",
                              },
                            ]}
                            onChangeText={() => handleTypeNewOffer()}
                          />
                          {newOfferType === "commerciale" && (
                            <Input
                              type="text"
                              label="Taux de réduction"
                              placeholder="10%"
                            />
                          )}
                          {newOfferType === "sponsoring" && (
                            <Input
                              type="selector"
                              label="Pour quelle catégorie de sport ?"
                              placeholder="Running"
                              options={[
                                {
                                  label: "Running",
                                  value: "running",
                                },
                                {
                                  label: "Natation",
                                  value: "natation",
                                },
                              ]}
                            />
                          )}
                        </View>
                        <View style={{ flexDirection: "column", gap: 8 }}>
                          <AppText>Détails de l'offre</AppText>
                          {newOfferType === "commerciale" && (
                            <>
                              <Input
                                type="text"
                                label="Libellé"
                                placeholder="Nom du magasin, ..."
                              />
                              <Input
                                type="text"
                                label="Descritpion"
                                placeholder="Comment fonctionne l'offre..."
                              />
                              <Input
                                type="text"
                                label="Conditions"
                                placeholder="Jusqu'à quand ? Conditions d'utilistations..."
                              />
                              <Input
                                type="text"
                                label="Lien de l'offre"
                                placeholder="https://www..."
                              />
                              <View style={{ flexDirection: "row", gap: 16 }}>
                                <View style={{ width: "48%" }}>
                                  <Input
                                    type="date"
                                    label="Date de début"
                                    placeholder="XX/XX/XXX"
                                  />
                                </View>
                                <View style={{ width: "48%" }}>
                                  <Input
                                    type="date"
                                    label="Date de fin"
                                    placeholder="XX/XX/XXX"
                                  />
                                </View>
                              </View>
                            </>
                          )}
                          {newOfferType === "sponsoring" && (
                            <>
                              <Input
                                type="text"
                                label="Libellé"
                                placeholder="Nom du contrat"
                              />
                              <Input
                                type="text"
                                label="Descritpion"
                                placeholder="Résumé de l'offre"
                              />
                              <Input
                                type="text"
                                label="Contrat"
                                placeholder="Choisir un fichier"
                              />
                              <View style={{ flexDirection: "row", gap: 16 }}>
                                <View style={{ width: "48%" }}>
                                  <Input
                                    type="date"
                                    label="Date de début"
                                    placeholder="XX/XX/XXX"
                                  />
                                </View>
                                <View style={{ width: "48%" }}>
                                  <Input
                                    type="date"
                                    label="Date de fin"
                                    placeholder="XX/XX/XXX"
                                  />
                                </View>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    }
                  />
                </Pressable>
              </Modal>
            </>
          );
        default:
          return <>{clientInformationsContent}</>;
      }
    },
  };

  const RenderProfileComponents =
    ClientDetailPageByProfile[user.profileCategory];

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
        {RenderProfileComponents ? RenderProfileComponents(user) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
