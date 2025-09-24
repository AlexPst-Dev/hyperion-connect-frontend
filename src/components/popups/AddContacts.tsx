import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import {
  ProfileCategory,
  profileCategoryLabels,
  User,
} from "@/src/models/user";
import { ScrollView } from "react-native-gesture-handler";
import ItemUser from "../ItemUser";
import AppButton from "../AppButton";
import AppText from "../AppText";
import { UserService } from "@/src/services/api/user-service";

interface Props {
  visible: boolean;
  token: string;
  onClose: () => void;
  onSubmit?: (selectedUsers: User[]) => void;
  initialSelectedUserIds?: number[];
  allowedProfileCategories?: ProfileCategory[];
}

export default function AddContacts({
  visible,
  token,
  onClose,
  onSubmit,
  initialSelectedUserIds,
  allowedProfileCategories,
}: Props) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    initialSelectedUserIds ?? []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [limit] = useState(4);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (visible) {
      setSelectedUserIds(initialSelectedUserIds ?? []);
      setOffset(0); // Reset pagination when modal opens
    }
  }, [visible, initialSelectedUserIds]);

  // Fetch users based on allowed categories or all users
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        if (allowedProfileCategories && allowedProfileCategories.length === 1) {
          // Si on a une seule catégorie autorisée, utiliser l'endpoint spécialisé
          const response = await UserService.getUsersByProfileCategory(
            allowedProfileCategories[0],
            token
          );
          if (isMounted) {
            // Transformer la réponse pour correspondre au format User[]
            const users = response.users.map((userWithProfile) => ({
              ...userWithProfile.profile?.user,
              profileCategory: allowedProfileCategories[0],
            })) as User[];
            setAllUsers(users);
          }
        } else {
          // Sinon, récupérer tous les utilisateurs par pagination
          const allUsersList: User[] = [];
          let offset = 0;
          const limit = 100; // Récupérer par batch de 100
          let hasMore = true;

          while (hasMore && isMounted) {
            const response = await UserService.getUsersPaginated(
              token,
              limit,
              offset
            );
            const users = response.users;

            if (users && users.length > 0) {
              allUsersList.push(...users);
              offset += limit;
              hasMore = users.length === limit;
            } else {
              hasMore = false;
            }
          }

          if (isMounted) {
            // Filtrer les utilisateurs selon les profils autorisés
            const filteredUsers = allowedProfileCategories
              ? allUsersList.filter((user) =>
                  allowedProfileCategories.includes(user.profileCategory)
                )
              : allUsersList;
            setAllUsers(filteredUsers);
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
        if (isMounted) {
          setAllUsers([]);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [token, allowedProfileCategories]);

  // Apply filters and search to allUsers
  useEffect(() => {
    const filtered = allUsers.filter((user) => {
      const matchesSearch =
        searchTerm.length < 3 ||
        user.firstName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().startsWith(searchTerm.toLowerCase());

      const matchesFilter =
        selectedFilters.length === 0 ||
        selectedFilters.includes(user.profileCategory);

      return matchesSearch && matchesFilter;
    });

    setFilteredUsers(filtered);
    setOffset(0); // Reset pagination when filters change
  }, [allUsers, searchTerm, selectedFilters]);

  // Paginate the filtered users
  useEffect(() => {
    setVisibleUsers(filteredUsers.slice(offset, offset + limit));
  }, [filteredUsers, offset, limit]);

  // Use allUsers for filter options
  const filterCategories = Array.from(
    new Set(allUsers.map((user) => user.profileCategory).filter(Boolean))
  );

  useEffect(() => {
    if (
      visible &&
      filterCategories.length > 0 &&
      selectedFilters.length === 0
    ) {
      // Si on a des profils autorisés spécifiques, on les utilise directement
      // Sinon on utilise tous les profils disponibles
      const defaultFilters = allowedProfileCategories
        ? allowedProfileCategories.filter((cat) =>
            filterCategories.includes(cat)
          )
        : filterCategories;
      setSelectedFilters(defaultFilters);
    }
  }, [visible, filterCategories, allowedProfileCategories]);

  const filterOptions = filterCategories.map((cat) => ({
    label: profileCategoryLabels[cat as ProfileCategory] || cat,
    value: cat,
  }));

  const toggleSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const selectedUsers = allUsers.filter((user) =>
        selectedUserIds.includes(user.id)
      );
      onSubmit(selectedUsers);
    }
    onClose();
  };

  const loadMoreUsers = () => {
    if (offset + limit < filteredUsers.length) {
      setOffset((prev) => prev + limit);
    }
  };

  // Masquer le sélecteur de profils si on a des profils spécifiques autorisés
  const showProfileSelector = !allowedProfileCategories;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.inner} onPress={(e) => e.stopPropagation()}>
          <PopUp
            onClose={onClose}
            title="Ajouter un contact"
            closeText="Annuler"
            paragraph="Sélectionnez les contacts que vous souhaitez ajouter"
            inputs={
              <>
                {showProfileSelector && (
                  <Input
                    type="multiSelector"
                    label="Filtres"
                    placeholder="Choisissez des filtres"
                    value={selectedFilters}
                    onChangeText={(v) => {
                      const values = v.split(",");
                      setSelectedFilters(values);
                    }}
                    options={filterOptions}
                  />
                )}
                <Input
                  type="text"
                  label="Rechercher"
                  placeholder="John Doe, exemple@mail.com"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </>
            }
            specificBody={
              <>
                <ScrollView style={styles.userList}>
                  {visibleUsers.length > 0 ? (
                    <>
                      {visibleUsers.map((user, index) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <Pressable
                            key={user.id}
                            onPress={() => toggleSelection(user.id)}
                            style={{
                              marginBottom:
                                index === visibleUsers.length - 1 ? 0 : 12,
                            }}
                          >
                            <ItemUser
                              isCompany={false}
                              user={user}
                              iconName={isSelected ? "circleChecked" : "circle"}
                            />
                          </Pressable>
                        );
                      })}
                      {/* Bouton "Voir plus" si il y a plus d'utilisateurs à afficher */}
                      {offset + limit < filteredUsers.length && (
                        <Pressable
                          onPress={loadMoreUsers}
                          style={styles.loadMoreButton}
                        >
                          <AppText style={styles.loadMoreText}>
                            Voir plus ({filteredUsers.length - offset - limit}{" "}
                            restants)
                          </AppText>
                        </Pressable>
                      )}
                    </>
                  ) : (
                    <AppText>
                      {searchTerm.length >= 3
                        ? "Aucun utilisateur trouvé pour cette recherche."
                        : "Aucun utilisateur trouvé."}
                    </AppText>
                  )}
                </ScrollView>

                {/* <View style={styles.inviteBtn}>
                  <AppButton title="Inviter" type="secondary" iconName="link" />
                </View> */}
              </>
            }
            onSubmit={handleSubmit}
            btnText="Valider"
            btnType="primary"
            iconName="check"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
  },
  inner: {
    width: "90%",
  },
  inviteBtn: {
    marginTop: 24,
    marginBottom: 24,
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  userList: {
    maxHeight: 240,
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    marginTop: 12,
  },
  loadMoreText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
