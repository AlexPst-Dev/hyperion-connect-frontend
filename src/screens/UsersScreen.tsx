import React, { JSX, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import GlobalStyles, { Colors } from "../styles/styles";
import AppText from "../components/AppText";
import Input from "../components/Input";
import ViewController from "../components/ViewController";
import { ProfileCategory, User, UserProfile } from "../models/user";
import ItemUser from "../components/ItemUser";
import AppButton from "../components/AppButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useNavigation } from "@react-navigation/native";
import Icon, { IconName } from "../components/Icon";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import { UserService } from "../services/api/user-service";
import { Category, CategoryType } from "../models/category";
import { categoryService } from "../services/api/category-service";

export default function UsersScreen() {
  const [displayUsersList, setDisplayUsersList] = useState(true);
  const handleDisplayUserList = () => {
    setDisplayUsersList(!displayUsersList);
  };

  // const usersByCategory: User[] = [
  //   {
  //     id: 2,
  //     firstName: "Alexa",
  //     lastName: "Amazone",
  //     email: "a.a@exemple.com",
  //     profileCategory: ProfileCategory.SPORTSMAN,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  //   {
  //     id: 3,
  //     firstName: "Danny",
  //     lastName: "Dan",
  //     email: "d.d@exemple.com",
  //     profileCategory: ProfileCategory.SPORTSMAN,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  //   {
  //     id: 4,
  //     firstName: "Marc",
  //     lastName: "Cram",
  //     email: "m.c@exemple.com",
  //     profileCategory: ProfileCategory.COACH,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  //   {
  //     id: 5,
  //     firstName: "Doke",
  //     lastName: "Theurc",
  //     email: "d.tc@exemple.com",
  //     profileCategory: ProfileCategory.MEDIC,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  // ];
  // const tempListOfPartner: User[] = [
  //   {
  //     id: 14,
  //     firstName: "Nutrisport",
  //     lastName: "",
  //     email: "contact.nutrisport@exemple.com",
  //     profileCategory: ProfileCategory.PARTNER,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  //   {
  //     id: 15,
  //     firstName: "Fitness Park",
  //     lastName: "",
  //     email: "contact.fp@exemple.com",
  //     profileCategory: ProfileCategory.PARTNER,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  //   {
  //     id: 16,
  //     firstName: "Tonton Outdoor",
  //     lastName: "",
  //     email: "contact.tt@exemple.com",
  //     profileCategory: ProfileCategory.SPORTSMAN,
  //     isActive: true,
  //     createdAt: "2025-05-05",
  //     updatedAt: "2025-05-05",
  //   },
  // ];

  const [allUsersByCategory, setAllUsersByCategory] = useState<User[]>([]);
  const [usersByCategory, setUsersByCategory] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  let [stepNewUserView, setStepNewUserView] = useState(0);
  let [newUserType, setNewUserType] = useState("");

  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);

  const [isNewUserAProfesional, setIsNewUserAProfesional] = useState(false);

  const [sportCategories, setSportCategories] = useState<Category[]>([]);
  const [medicCategories, setMedicCategories] = useState<Category[]>([]);

  const { token } = useAuth();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const sports = await categoryService.getCategoriesByType(
          CategoryType.SPORT,
          token ?? ""
        );
        setSportCategories(sports);
        const medics = await categoryService.getCategoriesByType(
          CategoryType.MEDICAL,
          token ?? ""
        );
        setMedicCategories(medics);
      } catch (e) {
        setSportCategories([]);
        setMedicCategories([]);
      }
    }
    fetchCategories();
  }, [token]);

  const fetchUsersByCategories = async (category: ProfileCategory) => {
    try {
      const response = await UserService.getUsersByProfileCategory(
        category,
        token ?? undefined,
        1000,
        0
      );
      const users: User[] = response.users
        .map((item) => {
          if (!item.profile) return null;

          // Sportsman or Coach: attach sport category
          if (
            (item.profile.user.profileCategory === ProfileCategory.SPORTSMAN ||
              item.profile.user.profileCategory === ProfileCategory.COACH) &&
            typeof (item.profile as any).sportCategoryId !== "undefined" &&
            (item.profile as any).sportCategoryId
          ) {
            const sportCategoryId = (item.profile as any).sportCategoryId;
            const cat = sportCategories.find((c) => c.id === sportCategoryId);
            return {
              ...item.profile.user,
              profile: {
                ...item.profile,
                sportCategory: cat,
              },
            };
          }

          // Medic: attach medical category
          if (
            item.profile.user.profileCategory === ProfileCategory.MEDIC &&
            typeof (item.profile as any).medicCategoryId !== "undefined" &&
            (item.profile as any).medicCategoryId
          ) {
            const medicCategoryId = (item.profile as any).medicCategoryId;
            const cat = medicCategories.find((c) => c.id === medicCategoryId);
            return {
              ...item.profile.user,
              profile: {
                ...item.profile,
                medicCategory: cat,
              },
            };
          }

          // Default: just return the user
          return item.profile.user;
        })
        .filter((user): user is User => !!user);
      setAllUsersByCategory(users);
      setUsersByCategory(users.slice(0, displayLimit));
      const categories = Array.from(
        new Set(users.map((u) => u.profileCategory))
      );
      setSelectedFilters(categories);
    } catch (error) {
      setAllUsersByCategory([]);
      setUsersByCategory([]);
    }
  };

  useEffect(() => {
    let filtered = allUsersByCategory;
    // Filter by selectedFilters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((user) =>
        selectedFilters.includes(user.profileCategory)
      );
    }
    // Filter by searchTerm
    if (searchTerm.length >= 3) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          (user.email && user.email.toLowerCase().includes(term))
      );
    }
    setUsersByCategory(filtered.slice(0, displayLimit));
  }, [allUsersByCategory, searchTerm, selectedFilters, displayLimit]);

  useEffect(() => {
    if (sportCategories.length > 0) {
      fetchUsersByCategories(ProfileCategory.SPORTSMAN);
    }
  }, [token, sportCategories]);

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ClientDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  const tabViews: JSX.Element[] = [
    <View key="sportsman" style={{ flexDirection: "column", gap: 24 }}>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Input
          type="text"
          label="Rechercher"
          placeholder="nom, prénom, email..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            height: 300,
          }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View
            style={{
              flexDirection: "column",
            }}
          >
            {usersByCategory.map((user, index) => (
              <Pressable
                onPress={() => {
                  navigation.navigate("ClientDetail", { client: user });
                }}
                key={user.id}
                style={{
                  marginBottom: index === usersByCategory.length - 1 ? 0 : 12,
                }}
              >
                <ItemUser user={user} isCompany={false} iconName="send" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>,
    <View key="coach" style={{ flexDirection: "column", gap: 24 }}>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Input
          type="text"
          label="Rechercher"
          placeholder="nom, prénom, email..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            height: 300,
          }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View
            style={{
              flexDirection: "column",
            }}
          >
            {usersByCategory.map((user, index) => (
              <Pressable
                onPress={() => {}}
                key={user.id}
                style={{
                  marginBottom: index === usersByCategory.length - 1 ? 0 : 12,
                }}
              >
                <ItemUser user={user} isCompany={false} iconName="send" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>,
    <View key="medic" style={{ flexDirection: "column", gap: 24 }}>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Input
          type="text"
          label="Rechercher"
          placeholder="nom, prénom, email..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            height: 300,
          }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View
            style={{
              flexDirection: "column",
            }}
          >
            {usersByCategory.map((user, index) => (
              <Pressable
                onPress={() => {}}
                key={user.id}
                style={{
                  marginBottom: index === usersByCategory.length - 1 ? 0 : 12,
                }}
              >
                <ItemUser user={user} isCompany={false} iconName="send" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>,
    <View key="partner" style={{ flexDirection: "column", gap: 24 }}>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Input
          type="text"
          label="Rechercher"
          placeholder="nom, prénom, email..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            height: 300,
          }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View
            style={{
              flexDirection: "column",
            }}
          >
            {usersByCategory.map((user, index) => (
              <Pressable
                onPress={() => {
                  navigation.navigate("ClientDetail", { client: user });
                }}
                key={user.id}
                style={{
                  marginBottom: index === usersByCategory.length - 1 ? 0 : 12,
                }}
              >
                <ItemUser user={user} isCompany={false} iconName="send" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>,
  ];

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    switch (index) {
      case 0:
        fetchUsersByCategories(ProfileCategory.SPORTSMAN);
        break;
      case 1:
        fetchUsersByCategories(ProfileCategory.COACH);
        break;
      case 2:
        fetchUsersByCategories(ProfileCategory.MEDIC);
        break;
      case 3:
        fetchUsersByCategories(ProfileCategory.PARTNER);
        break;
      default:
        break;
    }
  };

  const handleContactPopUpVisible = () => {
    setAddContactPopUpVisible(!addContactPopUpVisible);
  };
  // Step views for creating a new user with form. Admin profile only
  const stepViews: JSX.Element[] = [
    <View
      key={"Informations personnelles"}
      style={{ flexDirection: "column", gap: 16 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "48%" }}>
          <Input type="text" label="Nom" placeholder="DOE" />
        </View>
        <View style={{ width: "48%" }}>
          <Input type="text" label="Prénom" placeholder="John" />
        </View>
      </View>
      <Input type="text" label="Téléphone" placeholder="XXXXXXXXXX" />
      <Input type="email" label="Email" placeholder="exemple@mail.com" />
      <Input type="date" label="Date de naissance" placeholder="XX/XX/XXXX" />
      <Input type="text" label="Adresse" placeholder="Rue" />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "48%" }}>
          <Input type="text" label="Ville" placeholder="Vannes" />
        </View>
        <View style={{ width: "48%" }}>
          <Input type="text" label="Code postal" placeholder="56000" />
        </View>
      </View>
    </View>,
    <View
      key={"Informations administratives"}
      style={{ flexDirection: "column", gap: 16 }}
    >
      <Input
        type="selector"
        label="Rôle"
        options={[
          {
            label: "Sportif",
            value: "sportsman",
          },
          {
            label: "Soignant",
            value: "medic",
          },
          {
            label: "Coach",
            value: "coach",
          },
          {
            label: "Partenaire",
            value: "partner",
          },
        ]}
        onChangeText={(value) => setNewUserType(value)}
        onChange={() => setIsNewUserAProfesional(!isNewUserAProfesional)}
      />
      {(newUserType === "medic" || newUserType === "coach") && (
        <Input
          type="checkbox"
          label="Peut créer / importer des entrainements et des exercices"
        />
      )}
      {newUserType === "medic" && (
        <Input
          type="selector"
          label="Profression"
          options={[
            {
              label: "Kinésithérapeute",
              value: "kine",
            },
            {
              label: "Podologue",
              value: "podologue",
            },
            {
              label: "Osthéopathe",
              value: "ostheo",
            },
          ]}
        />
      )}
      {newUserType === "coach" && (
        <Input
          type="selector"
          label="Sport"
          options={[
            {
              label: "Running",
              value: "running",
            },
            {
              label: "Natation",
              value: "natation",
            },
            {
              label: "Musculation",
              value: "musculation",
            },
          ]}
        />
      )}
    </View>,
    <View
      key={"Plans d'entrainements"}
      style={{ flexDirection: "column", gap: 32 }}
    >
      <View style={{ flexDirection: "column", gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "column" }}>
            <AppText style={{ color: Colors.deepBlue, fontWeight: "bold" }}>
              Suivi par un coach sportif de running
            </AppText>
            <AppText>Du DD/MM/YYYY au DD/MM/YYYY</AppText>
          </View>
          <Icon
            name="trash"
            strokeColor={Colors.lightRed}
            fillColor="transparent"
            strokeWidth={2}
            width={24}
            height={24}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "column" }}>
            <AppText style={{ color: Colors.deepBlue, fontWeight: "bold" }}>
              Suivi par un coach sportif de running
            </AppText>
            <AppText>Du DD/MM/YYYY au DD/MM/YYYY</AppText>
          </View>
          <Icon
            name="trash"
            strokeColor={Colors.lightRed}
            fillColor="transparent"
            strokeWidth={2}
            width={24}
            height={24}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            height: 1,
            backgroundColor: "black",
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </View>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Input
          type="text"
          label="Libellé de la prestation"
          placeholder="Libellé"
        />
        <Input type="date" label="Date de début" placeholder="XX/XX/XXXX" />
        <Input type="date" label="Date de fin" placeholder="XX/XX/XXXX" />
        <View style={{ flexDirection: "column", gap: 8 }}>
          <AppText>Tarification complète par défaut</AppText>
          <Input type="checkbox" label="Passer en tarification par mois" />
        </View>
        <Input type="text" label="Tarification" placeholder="XX/mois" />
        <Pressable
          style={{
            borderRadius: 8,
            borderColor: Colors.deepBlue,
            borderWidth: 1,
            paddingVertical: 6,
            paddingHorizontal: 8,
          }}
          onPress={handleContactPopUpVisible}
        >
          <AppText>
            Sélectionner une personne à ajouter au plan d'entrainement
          </AppText>
        </Pressable>
        {addContactPopUpVisible && (
          <AddContacts
            visible={addContactPopUpVisible}
            token=""
            onClose={handleContactPopUpVisible}
          />
        )}
      </View>
    </View>,
    <View
      key={"Soignants à affecter"}
      style={{ flexDirection: "column", gap: 32 }}
    >
      <View style={{ flexDirection: "column", gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "column" }}>
            <AppText style={{ color: Colors.deepBlue, fontWeight: "bold" }}>
              Dr. Sophie Lemoine
            </AppText>
            <AppText>Médecin du sport</AppText>
          </View>
          <Icon
            name="trash"
            strokeColor={Colors.lightRed}
            fillColor="transparent"
            strokeWidth={2}
            width={24}
            height={24}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "column" }}>
            <AppText style={{ color: Colors.deepBlue, fontWeight: "bold" }}>
              Jean Dupuis
            </AppText>
            <AppText>Kinésithérapeute</AppText>
          </View>
          <Icon
            name="trash"
            strokeColor={Colors.lightRed}
            fillColor="transparent"
            strokeWidth={2}
            width={24}
            height={24}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            height: 1,
            backgroundColor: "black",
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </View>
      <View style={{ flexDirection: "column", gap: 16 }}>
        <Pressable
          style={{
            borderRadius: 8,
            borderColor: Colors.deepBlue,
            borderWidth: 1,
            paddingVertical: 6,
            paddingHorizontal: 8,
          }}
          onPress={handleContactPopUpVisible}
        >
          <AppText>
            Sélectionner une personne à ajouter à la liste des soignants
          </AppText>
        </Pressable>
        {addContactPopUpVisible && (
          <AddContacts
            visible={addContactPopUpVisible}
            token=""
            onClose={handleContactPopUpVisible}
          />
        )}
      </View>
    </View>,
    <View
      key={"Offre d'abonnement"}
      style={{ flexDirection: "column", gap: 32 }}
    >
      <AppText>Importez le contrat d'offre d'abonnement ici</AppText>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <AppButton
          type="secondary"
          title="Sélectionnez le fichier"
          iconName="download"
        />
      </View>
      <Input
        type="selector"
        label="Sélectionnez le libellé de l'offre d'abonnement correspondante"
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
    </View>,
  ];

  const { user } = useAuth();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {displayUsersList && (
          <View style={{ flexDirection: "column", gap: 24 }}>
            <ViewController
              tabs={[
                { title: "Sportifs", icon: "medal" },
                { title: "Coachs", icon: "dumbell" },
                { title: "Soignants", icon: "medic" },
                ...(user?.profileCategory === "admin"
                  ? [{ title: "Parternaires", icon: "handshake" as IconName }]
                  : []),
              ]}
              onTabChange={handleTabChange}
            />
            {tabViews[activeTabIndex]}
            {user?.profileCategory === "admin" && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <AppButton
                  type="add"
                  iconName="plus"
                  onPress={handleDisplayUserList}
                />
              </View>
            )}
          </View>
        )}
        {!displayUsersList && (
          <View style={{ flexDirection: "column", gap: 24 }}>
            <AppText>
              Suivez ces étapes pour ajouter un nouvel utilisateur :
            </AppText>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={{ fontWeight: "bold" }}>
                Etape {stepNewUserView + 1} / {stepViews.length}
              </AppText>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {stepViews.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 12,
                      borderRadius: 8,
                      backgroundColor:
                        index <= stepNewUserView ? "#2563EB" : "#D9D9D9",
                    }}
                  />
                ))}
              </View>
              <AppText style={{ fontWeight: "bold" }}>
                {stepViews[stepNewUserView].key}
              </AppText>
            </View>

            {stepViews[stepNewUserView]}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {stepNewUserView === 0 ? (
                <Pressable onPress={handleDisplayUserList}>
                  <AppText>Annuler</AppText>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setStepNewUserView((stepNewUserView -= 1));
                  }}
                >
                  <AppText>Précédent</AppText>
                </Pressable>
              )}
              {newUserType !== "coach" && newUserType !== "medic" ? (
                <AppButton
                  type="primary"
                  title={
                    stepNewUserView + 1 === stepViews.length
                      ? "Valider"
                      : "Suivant"
                  }
                  iconName={
                    stepNewUserView + 1 === stepViews.length
                      ? "check"
                      : "chevronRight"
                  }
                  onPress={() => {
                    if (stepNewUserView + 1 === stepViews.length) {
                      setDisplayUsersList(true);
                      setStepNewUserView(0);
                      setNewUserType("");
                    } else {
                      setStepNewUserView((stepNewUserView += 1));
                    }
                  }}
                />
              ) : (
                <AppButton
                  type="primary"
                  title="Valider"
                  iconName="check"
                  onPress={() => {
                    setDisplayUsersList(true);
                    setStepNewUserView(0);
                    setNewUserType("");
                  }}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
