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
import { getMonthStartDates, ProfileCategory, User } from "../models/user";
import ItemUser from "../components/ItemUser";
import AppButton from "../components/AppButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useNavigation } from "@react-navigation/native";
import { IconName } from "../components/Icon";
import AddContacts from "../components/popups/AddContacts";
import { useAuth } from "../hooks/useAuth";
import { UserService } from "../services/api/user-service";
import { Category, CategoryType } from "../models/category";
import { categoryService } from "../services/api/category-service";
import { Company } from "../models/company";
import { CompanyService } from "../services/api/company-service";
import { ObjectivesApiService } from "../services/api/objective-service";
import { billingService } from "../services/api/billing-service";
import { clientService } from "../services/api/client-service";
import { notify } from "../components/NotificationContainer";

// Interface pour le formulaire
interface UserFormData {
  // Base data
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street?: string;
  city: string;
  postalCode: string;
  birthDate: string;

  // Profil data
  sportCategoryId?: number;
  sportCategoryIds?: number[];
  medicCategoryIds?: number[];
  canImportSessions?: boolean;
  availableDays?: string;
  availableTime?: string;
  listMedicsIds?: string;
  isInHyperlinkNetwork?: boolean;

  // Sporstman data
  objectiveLabel?: string;
  objectiveStartDate?: string;
  objectiveEndDate?: string;
  objectiveIsMonthly?: boolean;
  billingMonthlyAmount?: string;
  billingTotalAmount?: string;
  subscriptionLabel?: string;

  // Partner data
  companyId?: number;
  companyName?: string;
  companyDateEndMembership?: string;
}

export default function UsersScreen() {
  const [displayUsersList, setDisplayUsersList] = useState(true);
  const [allUsersByCategory, setAllUsersByCategory] = useState<User[]>([]);
  const [usersByCategory, setUsersByCategory] = useState<User[]>([]);
  // Users list for coach and medics
  const [proClients, setProClients] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // États pour le formulaire de création
  let [stepNewUserView, setStepNewUserView] = useState(0);
  const [newUserType, setNewUserType] = useState<ProfileCategory | "">("");
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    postalCode: "",
    birthDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [sportCategories, setSportCategories] = useState<Category[]>([]);
  const [medicCategories, setMedicCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [addContactPopUpVisible, setAddContactPopUpVisible] = useState(false);
  const [selectedUsers, setSelectedUser] = useState<User[] | []>([]);

  const [addCoachPopUpVisible, setAddCoachPopUpVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);

  const [selectFreePopUpVisible, setSelectFreePopUpVisible] = useState(false);
  const [selectedFreeUser, setSelectedFreeUser] = useState<User | null>(null);

  const handleAddCoachSubmit = (users: User[]) => {
    setSelectedCoach(users[0] || null); // Only one coach should be selected
    setAddCoachPopUpVisible(false);
  };
  const handleCoachPopUpVisible = () => {
    setAddCoachPopUpVisible(!addCoachPopUpVisible);
  };

  const handleAddContactsSubmit = (selectedUsers: User[]) => {
    setSelectedUser(selectedUsers);
    setAddContactPopUpVisible(false);
  };

  const { token, user } = useAuth();

  // Récupération des catégories
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
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const companies = await CompanyService.getAllCompanies(token ?? "");
        setCompanies(companies);
      } catch (e) {
        setCompanies([]);
      }
    }
    fetchCompanies();
  }, [token]);

  // Récupération des utilisateurs par catégorie
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

          return item.profile.user;
        })
        .filter((user): user is User => !!user && user.isActive !== false);

      setAllUsersByCategory(users);
      setUsersByCategory(users.slice(0, displayLimit));
      const categories = Array.from(
        new Set(users.map((u) => u.profileCategory))
      );
      setSelectedFilters(categories);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      setAllUsersByCategory([]);
      setUsersByCategory([]);
    }
  };

  // Filtrage des utilisateurs
  useEffect(() => {
    let filtered = allUsersByCategory;
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((user) =>
        selectedFilters.includes(user.profileCategory)
      );
    }
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

  useEffect(() => {
    async function fetchProClients() {
      if (
        user &&
        token &&
        (user.profileCategory === ProfileCategory.COACH ||
          user.profileCategory === ProfileCategory.MEDIC)
      ) {
        try {
          const tabClients: User[] = [];
          const clientsList = await clientService.getClientListByProfessionalId(
            user.id,
            token
          );
          if (clientsList.clientIds.length > 0) {
            for (const clientId of clientsList.clientIds) {
              try {
                let newUser = await UserService.getUserById(clientId, token);
                if (newUser && newUser.profile) {
                  // Attach the correct sportCategory object if needed
                  if (
                    (newUser.profile as any).sportCategoryId &&
                    sportCategories.length > 0
                  ) {
                    const sportCategoryId = (newUser.profile as any)
                      .sportCategoryId;
                    const cat = sportCategories.find(
                      (c) => c.id === sportCategoryId
                    );
                    (newUser.profile as any).sportCategory = cat;
                  }
                  tabClients.push({
                    ...newUser.user,
                    profile: newUser.profile,
                  });
                } else if (newUser && newUser.user) {
                  tabClients.push(newUser.user);
                }
                // Si newUser est null ou undefined, on ne fait rien
              } catch (err) {
                // Ignore l'utilisateur si une erreur survient
                console.warn(
                  `Impossible de récupérer l'utilisateur ${clientId}:`,
                  err
                );
                continue;
              }
            }
          }
          setProClients(tabClients);
        } catch (e) {
          console.log("Error while fetching pro clients", e);
        }
      }
    }
    fetchProClients();
  }, [token, sportCategories, user]);

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ClientDetail"
  >;
  const navigation = useNavigation<NavigationProp>();

  // Gestion des onglets
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
      case 4:
        fetchUsersByCategories(ProfileCategory.FREE);
        break;
      default:
        break;
    }
  };

  // Gestion du formulaire
  const handleDisplayUserList = () => {
    setDisplayUsersList(!displayUsersList);
    if (!displayUsersList) {
      // Reset du formulaire quand on revient à la liste
      resetForm();
    }
  };

  const resetForm = () => {
    setStepNewUserView(0);
    setNewUserType("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      city: "",
      postalCode: "",
      birthDate: "",
    });
    setFormErrors({});
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ si elle existe
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation des étapes
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Informations personnelles
        if (!formData.firstName.trim())
          errors.firstName = "Le prénom est requis";
        if (!formData.lastName.trim()) errors.lastName = "Le nom est requis";
        if (!formData.email.trim()) {
          errors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Format d'email invalide";
        }
        if (!formData.birthDate)
          errors.birthDate = "La date de naissance est requise";
        if (!formData.city.trim()) errors.city = "La ville est requise";
        if (!formData.postalCode.trim())
          errors.postalCode = "Le code postal est requis";
        break;

      case 1: // Informations administratives
        if (!newUserType) errors.profileCategory = "Le rôle est requis";
        if (
          newUserType === ProfileCategory.COACH &&
          (!formData.sportCategoryIds || formData.sportCategoryIds.length === 0)
        ) {
          errors.sportCategoryIds =
            "Au moins un sport doit être sélectionné pour un coach";
        }
        if (
          newUserType === ProfileCategory.MEDIC &&
          (!formData.medicCategoryIds || formData.medicCategoryIds.length === 0)
        ) {
          errors.medicCategoryIds =
            "Au moins une profession doit être sélectionnée pour un soignant";
        }
        if (newUserType === ProfileCategory.PARTNER) {
          if (!formData.companyName?.trim()) {
            errors.companyName = "Le nom de l'entreprise est requis";
          }
          if (!formData.companyDateEndMembership) {
            errors.companyDateEndMembership =
              "La date de fin d'adhésion est requise";
          }
        }
        break;
        break;

      case 2: // Plans d'entraînement (sportifs uniquement)
        if (newUserType === ProfileCategory.SPORTSMAN) {
          if (!formData.objectiveLabel?.trim()) {
            errors.objectiveLabel = "Le libellé de la prestation est requis";
          }
          if (!formData.objectiveStartDate) {
            errors.objectiveStartDate = "La date de début est requise";
          }
          if (!formData.objectiveEndDate) {
            errors.objectiveEndDate = "La date de fin est requise";
          }
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation entre les étapes
  const isSportsman = newUserType === ProfileCategory.SPORTSMAN;
  const totalSteps = isSportsman ? 6 : 2; // 6 étapes pour sportif, 2 pour les autres

  const getStepsForUserType = (): number[] => {
    if (isSportsman) {
      return [0, 1, 2, 3, 4, 5]; // Toutes les étapes
    }
    return [0, 1]; // Seulement les 2 premières étapes
  };

  const handleNextStep = () => {
    if (!validateStep(stepNewUserView)) {
      return;
    }

    const steps = getStepsForUserType();
    const currentIndex = steps.indexOf(stepNewUserView);

    if (currentIndex < steps.length - 1) {
      setStepNewUserView(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps = getStepsForUserType();
    const currentIndex = steps.indexOf(stepNewUserView);

    if (currentIndex > 0) {
      setStepNewUserView(steps[currentIndex - 1]);
    }
  };

  const isLastStep = () => {
    const steps = getStepsForUserType();
    return stepNewUserView === steps[steps.length - 1];
  };

  // Création de l'utilisateur
  const handleCreateUser = async () => {
    if (!validateStep(stepNewUserView)) {
      return;
    }

    setIsLoading(true);
    try {
      if (!token) {
        throw new Error("Token manquant");
      }

      let companyId: number | undefined = undefined;

      // If partner, create the company first
      if (newUserType === ProfileCategory.PARTNER) {
        const companyPayload = {
          responsibleId: null,
          name: formData.companyName!,
          city: formData.city,
          postalCode: formData.postalCode,
          street: formData.street || "",
          dateEndMembership: formData.companyDateEndMembership,
        };
        // Create company with a dummy responsibleId (will update after)
        const companyRes = await CompanyService.createCompany(
          companyPayload,
          token
        );
        companyId = companyRes.company.id;
      }

      // Construction du payload selon la structure attendue par le backend
      const baseUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        street: formData.street || undefined,
        city: formData.city,
        postalCode: formData.postalCode,
        birthDate: formData.birthDate,
        isActive: true,
        isInHyperlinkNetwork: formData.isInHyperlinkNetwork || false,
        profileCategory: newUserType ? newUserType : undefined,
      };

      // Construction des données de profil selon le type
      let profileData: any = {};

      switch (newUserType) {
        case ProfileCategory.SPORTSMAN:
          profileData = {
            sportCategoryId: formData.sportCategoryId || null,
            availableDays: formData.availableDays || null,
            availableTime: formData.availableTime || null,
            listMedicsIds: selectedUsers.map((u) => u.id).join(";") || null,
          };
          break;

        case ProfileCategory.COACH:
          profileData = {
            sportCategoryIds: formData.sportCategoryIds || [],
            canImportSessions: formData.canImportSessions || false,
          };
          break;

        case ProfileCategory.MEDIC:
          profileData = {
            medicCategoryIds: formData.medicCategoryIds || [],
            canImportSessions: formData.canImportSessions || false,
          };
          break;

        case ProfileCategory.PARTNER:
          profileData = {
            companyId: formData.companyId || null,
          };
          break;

        case ProfileCategory.FREE:
        case ProfileCategory.ADMIN:
        default:
          // Pas de données spécifiques pour ces profils
          break;
      }

      let userIdToUse: number | undefined = undefined;
      if (selectedFreeUser) {
        // 1. Supprimer l'utilisateur free
        await UserService.deleteUserById(selectedFreeUser.id, token);

        // 2. Créer le nouvel utilisateur sportsman avec les infos du formulaire
        const payload = {
          ...baseUserData,
          profileCategory: ProfileCategory.SPORTSMAN,
          profile: profileData,
        };
        const userResponse = await UserService.createUserProfile(
          payload,
          token
        );
        userIdToUse = userResponse.user.id;
      } else {
        // Création classique
        const payload = {
          ...baseUserData,
          profile: profileData,
        };
        const userResponse = await UserService.createUserProfile(
          payload,
          token
        );
        userIdToUse = userResponse.user.id;
      }

      // 2. Create the objective (if sportsman)
      let createdObjective;
      if (newUserType === ProfileCategory.SPORTSMAN && userIdToUse) {
        const objectivePayload = {
          sportsmanId: userIdToUse,
          label: formData.objectiveLabel || "",
          // Only include responsibleId if a coach is selected
          ...(selectedCoach && { responsibleId: selectedCoach.id }),
          startDate: formData.objectiveStartDate || "",
          endDate: formData.objectiveEndDate || "",
          isActive: true,
        };
        const objectiveRes = await ObjectivesApiService.createObjective(
          objectivePayload as any,
          token
        );
        createdObjective = objectiveRes.objective;
      }

      // 3. Create the billing (if sportsman and objective created)
      if (newUserType === ProfileCategory.SPORTSMAN && createdObjective) {
        if (formData.objectiveIsMonthly) {
          // Create a billing for each month
          const monthDates = getMonthStartDates(
            createdObjective.startDate,
            createdObjective.endDate
          );
          await Promise.all(
            monthDates.map((date, idx) =>
              billingService.createBilling(
                {
                  objectiveId: createdObjective.id,
                  billingId: Number(`${createdObjective.id}${idx + 1}`),
                  date,
                  globalAmount: 0, // Not used for monthly
                  isMonthly: true,
                  monthlyAmount: Number(formData.billingMonthlyAmount) || 0,
                  paymentReceived: false,
                  isActive: true,
                },
                token
              )
            )
          );
        } else {
          // Single billing for the whole period
          await billingService.createBilling(
            {
              objectiveId: createdObjective.id,
              billingId: createdObjective.id,
              date: createdObjective.startDate,
              globalAmount: Number(formData.billingTotalAmount),
              isMonthly: false,
              monthlyAmount: 0,
              paymentReceived: false,
              isActive: true,
            },
            token
          );
        }
      }

      // 4. Add the sportsman user id in client list of selected coach and medic
      if (newUserType === ProfileCategory.SPORTSMAN) {
        if (selectedCoach) {
          const listClientOfSelectedCoach =
            await clientService.getClientListByProfessionalId(
              selectedCoach.id,
              token
            );
          if (listClientOfSelectedCoach) {
            await clientService.updateClientListByProfessionalId(
              selectedCoach.id,
              userIdToUse,
              "add",
              token
            );
          } else {
            await clientService.createClientList(
              selectedCoach.id,
              userIdToUse,
              token
            );
          }
        }
        if (selectedUsers && selectedUsers.length > 0) {
          for (const medic of selectedUsers) {
            let listClientOfSelectedPro = null;
            try {
              listClientOfSelectedPro =
                await clientService.getClientListByProfessionalId(
                  medic.id,
                  token
                );
            } catch (error: any) {
              // If 404, it means no client list exists yet for this pro
              if (error.status !== 404) {
                console.error(
                  "Erreur lors de la récupération du client:",
                  error
                );
                continue; // skip this medic if another error
              }
            }
            if (listClientOfSelectedPro) {
              await clientService.updateClientListByProfessionalId(
                medic.id,
                userIdToUse,
                "add",
                token
              );
            } else {
              await clientService.createClientList(
                medic.id,
                userIdToUse,
                token
              );
            }
          }
        }
      }

      if (newUserType === ProfileCategory.PARTNER && companyId) {
        await CompanyService.updateCompany(
          companyId,
          { responsibleId: userIdToUse },
          token
        );
      }

      // Succès - retour à la liste
      setDisplayUsersList(true);
      setSelectedFreeUser(null);
      setSelectedCoach(null);
      setSelectedUser([]);
      resetForm();

      // Rafraîchir la liste des utilisateurs
      if (newUserType) {
        fetchUsersByCategories(newUserType as ProfileCategory);
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      // Vous pouvez ajouter ici une notification d'erreur pour l'utilisateur
    } finally {
      setIsLoading(false);
      notify({
        title: "Utilisateur créé avec succès",
        type: "success",
      });
    }
  };

  const handleContactPopUpVisible = () => {
    setAddContactPopUpVisible(!addContactPopUpVisible);
  };

  // Vues des onglets (reste identique)
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
          style={{ height: 300 }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View style={{ flexDirection: "column" }}>
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
          style={{ height: 300 }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View style={{ flexDirection: "column" }}>
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
          style={{ height: 300 }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View style={{ flexDirection: "column" }}>
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
          style={{ height: 300 }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View style={{ flexDirection: "column" }}>
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
    <View key="free" style={{ flexDirection: "column", gap: 24 }}>
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
          style={{ height: 300 }}
          scrollEnabled
          nestedScrollEnabled={true}
        >
          <View style={{ flexDirection: "column" }}>
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

  // Fonction utilitaire pour obtenir le titre de l'étape
  const getStepTitle = (step: number): string => {
    const titles = [
      "Informations personnelles",
      "Informations administratives",
      "Plans d'entraînements",
      "Disponibilités",
      "Soignants à affecter",
      "Validation",
    ];
    return titles[step] || "Étape inconnue";
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
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {user?.profileCategory === ProfileCategory.ADMIN &&
          (displayUsersList ? (
            <View style={{ flexDirection: "column", gap: 24 }}>
              <ViewController
                tabs={[
                  { title: "Sportifs", icon: "medal" },
                  { title: "Coachs", icon: "dumbell" },
                  { title: "Soignants", icon: "medic" },
                  ...(user?.profileCategory === "admin"
                    ? [
                        {
                          title: "Parternaires",
                          icon: "handshake" as IconName,
                        },
                        { title: "Free", icon: "linkDenied" as IconName },
                      ]
                    : []),
                ]}
                onTabChange={handleTabChange}
              />
              {tabViews[activeTabIndex]}
              {user?.profileCategory === "admin" && (
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <AppButton
                    type="add"
                    iconName="plus"
                    onPress={handleDisplayUserList}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={{ flexDirection: "column", gap: 24 }}>
              <AppText>
                Suivez ces étapes pour ajouter un nouvel utilisateur :
              </AppText>

              <View style={{ flexDirection: "column", gap: 16 }}>
                <AppText style={{ fontWeight: "bold" }}>
                  Étape {stepNewUserView + 1} / {getStepsForUserType().length}
                </AppText>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {getStepsForUserType().map((stepIndex, index) => (
                    <View
                      key={stepIndex}
                      style={{
                        flex: 1,
                        height: 12,
                        borderRadius: 8,
                        backgroundColor:
                          stepIndex <= stepNewUserView ? "#2563EB" : "#D9D9D9",
                      }}
                    />
                  ))}
                </View>

                <AppText style={{ fontWeight: "bold" }}>
                  {getStepTitle(stepNewUserView)}
                </AppText>
              </View>

              {/* Étape 0: Informations personnelles */}
              {stepNewUserView === 0 && (
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <Pressable
                    onPress={() => setSelectFreePopUpVisible(true)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: Colors.deepBlue,
                      marginBottom: 8,
                    }}
                  >
                    <AppText>Sélectionner un utilisateur Free existant</AppText>
                  </Pressable>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ width: "48%" }}>
                      <Input
                        type="text"
                        label="Nom"
                        placeholder="DOE"
                        value={formData.lastName}
                        onChangeText={(v) => handleInputChange("lastName", v)}
                      />
                      {formErrors.lastName && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.lastName}
                        </AppText>
                      )}
                    </View>
                    <View style={{ width: "48%" }}>
                      <Input
                        type="text"
                        label="Prénom"
                        placeholder="John"
                        value={formData.firstName}
                        onChangeText={(v) => handleInputChange("firstName", v)}
                      />
                      {formErrors.firstName && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.firstName}
                        </AppText>
                      )}
                    </View>
                  </View>

                  <Input
                    type="text"
                    label="Téléphone"
                    placeholder="XXXXXXXXXX"
                    value={formData.phone || ""}
                    onChangeText={(v) => handleInputChange("phone", v)}
                  />

                  <Input
                    type="email"
                    label="Email"
                    placeholder="exemple@mail.com"
                    value={formData.email}
                    onChangeText={(v) => handleInputChange("email", v)}
                  />
                  {formErrors.email && (
                    <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                      {formErrors.email}
                    </AppText>
                  )}

                  <Input
                    type="date"
                    label="Date de naissance"
                    placeholder="XX/XX/XXXX"
                    value={formData.birthDate}
                    onChangeText={(v) => handleInputChange("birthDate", v)}
                  />
                  {formErrors.birthDate && (
                    <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                      {formErrors.birthDate}
                    </AppText>
                  )}

                  <Input
                    type="text"
                    label="Adresse"
                    placeholder="Rue"
                    value={formData.street || ""}
                    onChangeText={(v) => handleInputChange("street", v)}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ width: "48%" }}>
                      <Input
                        type="text"
                        label="Ville"
                        placeholder="Vannes"
                        value={formData.city}
                        onChangeText={(v) => handleInputChange("city", v)}
                      />
                      {formErrors.city && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.city}
                        </AppText>
                      )}
                    </View>
                    <View style={{ width: "48%" }}>
                      <Input
                        type="text"
                        label="Code postal"
                        placeholder="56000"
                        value={formData.postalCode}
                        onChangeText={(v) => handleInputChange("postalCode", v)}
                      />
                      {formErrors.postalCode && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.postalCode}
                        </AppText>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Étape 1: Informations administratives */}
              {stepNewUserView === 1 && (
                <View style={{ flexDirection: "column", gap: 16 }}>
                  <Input
                    type="selector"
                    label="Rôle"
                    options={[
                      { label: "Sportif", value: ProfileCategory.SPORTSMAN },
                      { label: "Soignant", value: ProfileCategory.MEDIC },
                      { label: "Coach", value: ProfileCategory.COACH },
                      { label: "Partenaire", value: ProfileCategory.PARTNER },
                      { label: "Compte free", value: ProfileCategory.FREE },
                    ]}
                    value={newUserType}
                    onChangeText={(value) =>
                      setNewUserType(value as ProfileCategory)
                    }
                  />
                  {formErrors.profileCategory && (
                    <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                      {formErrors.profileCategory}
                    </AppText>
                  )}

                  {(newUserType === ProfileCategory.MEDIC ||
                    newUserType === ProfileCategory.COACH) && (
                    <View style={{ flexDirection: "column", gap: 8 }}>
                      <Input
                        type="checkbox"
                        label="Peut créer / importer des entrainements et des exercices"
                        value={formData.canImportSessions || false}
                        onChange={(v) =>
                          handleInputChange("canImportSessions", v)
                        }
                      />
                      <Input
                        type="checkbox"
                        label="Adhérent Hyperlink"
                        value={formData.isInHyperlinkNetwork || false}
                        onChange={(v) =>
                          handleInputChange("isInHyperlinkNetwork", v)
                        }
                      />
                    </View>
                  )}

                  {newUserType === ProfileCategory.MEDIC && (
                    <>
                      <Input
                        type="multiSelector"
                        label="Professions"
                        options={medicCategories.map((cat) => ({
                          label: cat.label,
                          value: cat.id.toString(),
                        }))}
                        value={formData.medicCategoryIds?.map(String) || []}
                        onChangeText={(selected: string[] | string) =>
                          handleInputChange(
                            "medicCategoryIds",
                            Array.isArray(selected)
                              ? selected.map((v) => parseInt(v))
                              : (selected as string).split(",")
                          )
                        }
                      />
                      {formErrors.medicCategoryIds && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.medicCategoryIds}
                        </AppText>
                      )}
                    </>
                  )}

                  {newUserType === ProfileCategory.COACH && (
                    <>
                      <Input
                        type="multiSelector"
                        label="Sports"
                        options={sportCategories.map((cat) => ({
                          label: cat.label,
                          value: cat.id.toString(),
                        }))}
                        value={formData.sportCategoryIds?.map(String) || []}
                        onChangeText={(selected: string[] | string) =>
                          handleInputChange(
                            "sportCategoryIds",
                            Array.isArray(selected)
                              ? selected.map((v) => parseInt(v))
                              : (selected as string).split(",")
                          )
                        }
                      />
                      {formErrors.sportCategoryIds && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.sportCategoryIds}
                        </AppText>
                      )}
                    </>
                  )}

                  {newUserType === ProfileCategory.SPORTSMAN && (
                    <>
                      <Input
                        type="selector"
                        label="Sport"
                        options={sportCategories.map((cat) => ({
                          label: cat.label,
                          value: cat.id.toString(),
                        }))}
                        value={formData.sportCategoryId?.toString() || ""}
                        onChangeText={(v) =>
                          handleInputChange("sportCategoryId", parseInt(v))
                        }
                      />
                      {formErrors.sportCategoryId && (
                        <AppText
                          style={{ color: Colors.lightRed, fontSize: 12 }}
                        >
                          {formErrors.sportCategoryId}
                        </AppText>
                      )}
                    </>
                  )}
                </View>
              )}
              {newUserType === ProfileCategory.PARTNER && (
                <>
                  <Input
                    type="text"
                    label="Nom de l'entreprise"
                    placeholder="Nom de l'entreprise"
                    value={formData.companyName || ""}
                    onChangeText={(v) => handleInputChange("companyName", v)}
                  />
                  {formErrors.companyName && (
                    <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                      {formErrors.companyName}
                    </AppText>
                  )}
                  <Input
                    type="date"
                    label="Date de fin d'adhésion"
                    placeholder="JJ/MM/AAAA"
                    value={formData.companyDateEndMembership || ""}
                    onChangeText={(v) =>
                      handleInputChange("companyDateEndMembership", v)
                    }
                  />
                  {formErrors.companyDateEndMembership && (
                    <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                      {formErrors.companyDateEndMembership}
                    </AppText>
                  )}
                </>
              )}

              {/* Étape 2: Plans d'entraînements (sportifs uniquement) */}
              {stepNewUserView === 2 &&
                newUserType === ProfileCategory.SPORTSMAN && (
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    <Input
                      type="text"
                      label="Libellé de la prestation"
                      placeholder="Libellé"
                      value={formData.objectiveLabel || ""}
                      onChangeText={(v) =>
                        handleInputChange("objectiveLabel", v)
                      }
                    />
                    {formErrors.objectiveLabel && (
                      <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                        {formErrors.objectiveLabel}
                      </AppText>
                    )}

                    <Input
                      type="date"
                      label="Date de début"
                      placeholder="XX/XX/XXXX"
                      value={formData.objectiveStartDate || ""}
                      onChangeText={(v) =>
                        handleInputChange("objectiveStartDate", v)
                      }
                    />
                    {formErrors.objectiveStartDate && (
                      <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                        {formErrors.objectiveStartDate}
                      </AppText>
                    )}

                    <Input
                      type="date"
                      label="Date de fin"
                      placeholder="XX/XX/XXXX"
                      value={formData.objectiveEndDate || ""}
                      onChangeText={(v) =>
                        handleInputChange("objectiveEndDate", v)
                      }
                    />
                    {formErrors.objectiveEndDate && (
                      <AppText style={{ color: Colors.lightRed, fontSize: 12 }}>
                        {formErrors.objectiveEndDate}
                      </AppText>
                    )}

                    <View style={{ flexDirection: "column", gap: 8 }}>
                      <AppText>Tarification complète par défaut</AppText>
                      <Input
                        type="checkbox"
                        label="Passer en tarification par mois"
                        value={formData.objectiveIsMonthly || false}
                        onChange={(v) =>
                          handleInputChange("objectiveIsMonthly", v)
                        }
                      />
                    </View>

                    <Input
                      type="text"
                      label={
                        formData.objectiveIsMonthly
                          ? "Tarification par mois"
                          : "Tarification totale"
                      }
                      placeholder={
                        formData.objectiveIsMonthly ? "XX€/mois" : "XX€"
                      }
                      value={
                        formData.objectiveIsMonthly
                          ? formData.billingMonthlyAmount || ""
                          : formData.billingTotalAmount || ""
                      }
                      onChangeText={(v) =>
                        handleInputChange(
                          formData.objectiveIsMonthly
                            ? "billingMonthlyAmount"
                            : "billingTotalAmount",
                          v
                        )
                      }
                    />
                    <Pressable
                      onPress={handleCoachPopUpVisible}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.deepBlue,
                        marginTop: 8,
                      }}
                    >
                      {selectedCoach ? (
                        <AppText>
                          {selectedCoach.firstName} {selectedCoach.lastName}
                        </AppText>
                      ) : (
                        <AppText style={{ color: Colors.grey }}>
                          Sélectionnez un coach à affecter
                        </AppText>
                      )}
                    </Pressable>
                    <AppText>
                      Le coach sélectionné sera responsable de l'objectif de ce
                      sportif.
                    </AppText>
                  </View>
                )}

              {/* Étape 3: Disponibilités (sportifs uniquement) */}
              {stepNewUserView === 3 &&
                newUserType === ProfileCategory.SPORTSMAN && (
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    <AppText style={{ fontWeight: "bold" }}>
                      Définir les disponibilités
                    </AppText>

                    {/* Jours disponibles */}
                    <Input
                      type="multiSelector"
                      label="Jours disponibles"
                      placeholder="Sélectionnez les jours"
                      options={[
                        { label: "Lundi", value: "monday" },
                        { label: "Mardi", value: "tuesday" },
                        { label: "Mercredi", value: "wednesday" },
                        { label: "Jeudi", value: "thursday" },
                        { label: "Vendredi", value: "friday" },
                        { label: "Samedi", value: "saturday" },
                        { label: "Dimanche", value: "sunday" },
                      ]}
                      value={
                        // Convert binary string to array of selected days
                        (() => {
                          const days = [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ];
                          if (
                            !formData.availableDays ||
                            formData.availableDays.length !== 7
                          )
                            return [];
                          return days.filter(
                            (day, idx) => formData.availableDays![idx] === "1"
                          );
                        })()
                      }
                      onChangeText={(selected: string) => {
                        // Convert selected days array to binary string
                        const days = [
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                          "sunday",
                        ];
                        const binary = days
                          .map((day) => (selected.includes(day) ? "1" : "0"))
                          .join("");
                        handleInputChange("availableDays", binary);
                      }}
                    />
                    <AppText style={GlobalStyles.span}>
                      Sélectionnez les jours où le sportif est disponible
                    </AppText>

                    {/* Créneaux horaires */}
                    <Input
                      type="multiSelector"
                      label="Créneaux horaires"
                      placeholder="Sélectionnez un créneau"
                      options={[
                        { label: "07:00 - 10:00", value: "7-10" },
                        { label: "10:00 - 13:00", value: "10-13" },
                        { label: "13:00 - 16:00", value: "13-16" },
                        { label: "16:00 - 19:00", value: "16-19" },
                        { label: "19:00 - 22:00", value: "19-22" },
                      ]}
                      value={
                        // Convert binary string to array of selected slots
                        (() => {
                          const slots = [
                            "7-10",
                            "10-13",
                            "13-16",
                            "16-19",
                            "19-22",
                          ];
                          if (
                            !formData.availableTime ||
                            formData.availableTime.length !== 5
                          )
                            return [];
                          return slots.filter(
                            (slot, idx) => formData.availableTime![idx] === "1"
                          );
                        })()
                      }
                      onChangeText={(selected: string) => {
                        // Convert selected slots array to binary string
                        const slots = [
                          "7-10",
                          "10-13",
                          "13-16",
                          "16-19",
                          "19-22",
                        ];
                        const binary = slots
                          .map((slot) => (selected.includes(slot) ? "1" : "0"))
                          .join("");
                        handleInputChange("availableTime", binary);
                      }}
                    />
                    <AppText style={GlobalStyles.span}>
                      Sélectionnez le créneau horaire de disponibilité (3h)
                    </AppText>
                  </View>
                )}

              {/* Étape 4: Soignants à affecter (sportifs uniquement) */}
              {stepNewUserView === 4 &&
                newUserType === ProfileCategory.SPORTSMAN && (
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    <AppText style={{ fontWeight: "bold" }}>
                      Soignants à affecter
                    </AppText>
                    <AppText>
                      Cette étape permet d'affecter des soignants au sportif.
                    </AppText>

                    <Pressable
                      onPress={() => handleContactPopUpVisible()}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.deepBlue,
                        marginTop: 8,
                      }}
                    >
                      {selectedUsers.length !== 0 ? (
                        selectedUsers.map((user) => (
                          <AppText key={user.id}>
                            {user.firstName} {user.lastName}
                          </AppText>
                        ))
                      ) : (
                        <AppText style={{ color: Colors.grey }}>
                          Selectionnez une personne à ajouter à l'évenement
                        </AppText>
                      )}
                    </Pressable>

                    <AppText>
                      Les soignants sélectionnés pourront accéder aux données
                      médicales de ce sportif.
                    </AppText>
                  </View>
                )}

              {/* Étape 5: Vérification avant validation */}
              {stepNewUserView === 5 &&
                newUserType === ProfileCategory.SPORTSMAN && (
                  <View style={{ flexDirection: "column", gap: 16 }}>
                    <AppText style={{ fontWeight: "bold" }}>
                      Récapitulatif des informations
                    </AppText>
                    <View
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      <AppText>Nom : {formData.lastName}</AppText>
                      <AppText>Prénom : {formData.firstName}</AppText>
                      <AppText>
                        Téléphone : {formData.phone || "Non renseigné"}
                      </AppText>
                      <AppText>Email : {formData.email}</AppText>
                      <AppText>
                        Sport sélectionné :{" "}
                        {sportCategories.find(
                          (cat) => cat.id === formData.sportCategoryId
                        )?.label || "Non renseigné"}
                      </AppText>
                    </View>
                    <AppText style={{ color: Colors.grey }}>
                      Vérifiez les informations avant de valider la création du
                      sportif.
                    </AppText>
                  </View>
                )}

              {/* Navigation entre les étapes */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                {stepNewUserView === 0 ? (
                  <Pressable onPress={handleDisplayUserList}>
                    <AppText>Annuler</AppText>
                  </Pressable>
                ) : (
                  <Pressable onPress={handlePrevStep}>
                    <AppText>Précédent</AppText>
                  </Pressable>
                )}

                <AppButton
                  type="primary"
                  title={
                    isLastStep()
                      ? isLoading
                        ? "Création..."
                        : "Créer l'utilisateur"
                      : "Suivant"
                  }
                  iconName={isLastStep() ? "check" : "chevronRight"}
                  onPress={isLastStep() ? handleCreateUser : handleNextStep}
                  disabled={isLoading}
                />
              </View>
            </View>
          ))}
        {(user?.profileCategory === ProfileCategory.COACH ||
          user?.profileCategory === ProfileCategory.MEDIC) && (
          <View style={{ flexDirection: "column", gap: 24 }}>
            <View style={{ flexDirection: "column", gap: 16 }}>
              <AppText style={GlobalStyles.h3}>MES SPORTIFS</AppText>
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
                style={{ height: 300 }}
                scrollEnabled
                nestedScrollEnabled={true}
              >
                <View style={{ flexDirection: "column" }}>
                  {proClients.length === 0 ? (
                    <AppText>Aucun clients liés à votre compte</AppText>
                  ) : (
                    proClients.map((client, index) => (
                      <Pressable
                        onPress={() => {
                          navigation.navigate("ClientDetail", {
                            client: client,
                          });
                        }}
                        key={client.id}
                        style={{
                          marginBottom:
                            index === proClients.length - 1 ? 0 : 12,
                        }}
                      >
                        <ItemUser
                          user={client}
                          isCompany={false}
                          iconName="eye"
                          key={client.id}
                        />
                      </Pressable>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Popup pour ajouter des contacts */}
        {addContactPopUpVisible && (
          <AddContacts
            visible={addContactPopUpVisible}
            onClose={handleContactPopUpVisible}
            onSubmit={handleAddContactsSubmit}
            token={token as string}
            allowedProfileCategories={[ProfileCategory.MEDIC]}
          />
        )}
        {addCoachPopUpVisible && (
          <AddContacts
            visible={addCoachPopUpVisible}
            onClose={handleCoachPopUpVisible}
            onSubmit={handleAddCoachSubmit}
            token={token as string}
            allowedProfileCategories={[ProfileCategory.COACH]}
          />
        )}
        {selectFreePopUpVisible && (
          <AddContacts
            visible={selectFreePopUpVisible}
            token={token as string}
            allowedProfileCategories={[ProfileCategory.FREE]}
            onClose={() => setSelectFreePopUpVisible(false)}
            onSubmit={(users) => {
              if (users.length > 0) {
                const user = users[0];
                setSelectedFreeUser(user);
                setFormData({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                  street: user.street,
                  city: user.city ?? "",
                  postalCode: user.postalCode ?? "",
                  birthDate: user.birthDate ?? "",
                });
                setSelectFreePopUpVisible(false);
              }
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
