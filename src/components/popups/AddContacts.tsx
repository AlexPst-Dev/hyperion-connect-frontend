import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import PopUp from "../PopUp";
import Input from "../Input";
import { User } from "@/src/context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import ItemUser from "../ItemUser";
import AppButton from "../AppButton";
import AppText from "../AppText";

interface Props {
  visible: boolean;
  listOfUser: User[];
  onClose: () => void;
  onSubmit?: (selectedUsers: User[]) => void;
}

export default function AddContacts({
  visible,
  listOfUser,
  onClose,
  onSubmit,
}: Props) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterCategories = Array.from(
    new Set(listOfUser.map((user) => user.profileCategory).filter(Boolean))
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
    const selectedUsers = listOfUser.filter((user) =>
      selectedUserIds.includes(user.id)
    );
    onSubmit?.(selectedUsers);
    onClose();
  };

  const filteredUsers = listOfUser.filter((user) => {
    const matchesSearch =
      searchTerm.length < 3 ||
      user.firstName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().startsWith(searchTerm.toLowerCase());

    const matchesFilter = selectedFilters.includes(user.profileCategory);

    return matchesSearch && matchesFilter;
  });

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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <Pressable
                          key={user.id}
                          onPress={() => toggleSelection(user.id)}
                          style={{
                            marginBottom:
                              index === filteredUsers.length - 1 ? 0 : 12,
                          }}
                        >
                          <ItemUser
                            isCompany={false}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            job={user.profileCategory}
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
    maxHeight: 300,
  },
});
