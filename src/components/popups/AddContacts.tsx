import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { User } from "@/src/models/user";
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
}

export default function AddContacts({
  visible,
  token,
  onClose,
  onSubmit,
  initialSelectedUserIds,
}: Props) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    initialSelectedUserIds ?? []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [limit] = useState(4);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (visible) {
      setSelectedUserIds(initialSelectedUserIds ?? []);
    }
  }, [visible, initialSelectedUserIds]);

  // Fetch all users once for filtering and filter options
  useEffect(() => {
    let isMounted = true;
    UserService.getAllUsers(token).then(
      (response: User[] | { users: User[] }) => {
        const users = Array.isArray(response) ? response : response.users;
        if (isMounted && Array.isArray(users)) setAllUsers(users);
        else if (isMounted) setAllUsers([]);
      }
    );
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Filter and paginate users in-memory
  useEffect(() => {
    // Apply filters and search to allUsers
    const filtered = allUsers.filter((user) => {
      const matchesSearch =
        searchTerm.length < 3 ||
        user.firstName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().startsWith(searchTerm.toLowerCase());
      const matchesFilter = selectedFilters.includes(user.profileCategory);
      return matchesSearch && matchesFilter;
    });
    // Paginate
    setVisibleUsers(filtered.slice(offset, offset + limit));
  }, [allUsers, searchTerm, selectedFilters, offset, limit]);

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
      setSelectedFilters(filterCategories);
    }
  }, [visible, filterCategories]);

  const filterOptions = filterCategories.map((cat) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
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
                    visibleUsers.map((user, index) => {
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
                    })
                  ) : (
                    <AppText>Aucun utilisateur trouvé.</AppText>
                  )}
                </ScrollView>

                <View style={styles.inviteBtn}>
                  <AppButton title="Inviter" type="secondary" iconName="link" />
                </View>
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
});
