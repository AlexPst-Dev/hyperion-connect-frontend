import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import Event from "../components/Event";
import { User } from "../context/AuthContext";
import DisplayEvent from "../components/popups/DisplayEvent";
import { useAuth } from "../hooks/useAuth";
import GlobalStyles from "../styles/styles";
import AppButton from "../components/AppButton";
import {
  NotificationPortal,
  notify,
} from "../components/NotificationContainer";
import Input from "../components/Input";

export default function PlanningScreen() {
  const coachUser: User = {
    id: 1,
    firstName: "Alex",
    lastName: "Martin",
    email: "alex.martin@exemple.com",
    profileCategory: "coach",
  };

  const sportsmanUser: User = {
    id: 2,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@exemple.com",
    profileCategory: "sportsman",
  };

  const { user } = useAuth();

  const [eventPopUpVisible, setEventPopUpVisible] = useState(false);
  const [sportingActivityPopUpVisible, setSportingActivityPopUpVisible] =
    useState(false);

  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    birthDate: "",
    bio: "",
    selectedOption: "",
    selectedOptions: "",
    number: "",
    termsAccepted: false,
  });

  // Options for selector and multi-selector
  const categoryOptions = [
    { label: "Business", value: "business" },
    { label: "Technology", value: "technology" },
    { label: "Health", value: "health" },
    { label: "Education", value: "education" },
    { label: "Entertainment", value: "entertainment" },
  ];

  // Update form state function
  const updateFormState = (field: string, value: string | boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validation example
    if (!formState.email) {
      notify({
        title: "Email is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (!formState.termsAccepted) {
      notify({
        title: "You must accept the terms",
        type: "error",
        duration: 3000,
      });
      return;
    }

    // Submit form
    console.log("Form submitted:", formState);
    notify({
      title: "Form submitted successfully!",
      type: "success",
      duration: 5000,
    });
  };

  // Clear form
  const clearForm = () => {
    setFormState({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      birthDate: "",
      bio: "",
      selectedOption: "",
      selectedOptions: "",
      number: "",
      termsAccepted: false,
    });

    notify({
      title: "Form has been cleared",
      type: "information",
      duration: 3000,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <NotificationPortal />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "column", gap: 16 }}>
          <Event
            title="Séance de fractionné"
            isInPerson={true}
            type="session"
            personsInvolved={coachUser}
            location="Fitness Park de Vannes"
            date={new Date("2025-05-05")}
            hour="14h"
            onPress={() => setEventPopUpVisible(true)}
          />
          <Event
            title="Sortie sportive"
            type="sportingActivity"
            personsInvolved={sportsmanUser}
            location="Parc de Vannes"
            date={new Date("2025-06-12")}
            hour="17h"
            onPress={() => setSportingActivityPopUpVisible(true)}
          />
        </View>
        {eventPopUpVisible && user && (
          <DisplayEvent
            visible={eventPopUpVisible}
            userConnected={user.id}
            listOfUser={[coachUser]}
            onClose={() => setEventPopUpVisible(false)}
            title="Séance de fractionné"
            eventType="session"
            location="Fitness Park de Vannes"
            date={new Date("2025-05-05")}
            hour="14h"
            isInPerson
            infoDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            createdBy={coachUser.id}
          />
        )}
        {sportingActivityPopUpVisible && user && (
          <DisplayEvent
            visible={sportingActivityPopUpVisible}
            userConnected={user.id}
            listOfUser={[sportsmanUser]}
            onClose={() => setSportingActivityPopUpVisible(false)}
            link="https://strava.com/frnejqnfrbgsgbh"
            title="Sortie sportive"
            eventType="sportingActivity"
            location="Parc de Vannes"
            date={new Date("2025-06-12")}
            hour="17h"
            infoDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            createdBy={sportsmanUser.id}
          />
        )}

        <View style={{ marginTop: 24 }}>
          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            value={formState.fullName}
            onChangeText={(text) => updateFormState("fullName", text)}
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formState.email}
            onChangeText={(text) => updateFormState("email", text)}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Create a password"
            value={formState.password}
            onChangeText={(text) => updateFormState("password", text)}
          />

          <Input
            type="phone"
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formState.phone}
            onChangeText={(text) => updateFormState("phone", text)}
          />

          <Input
            type="date"
            label="Birth Date"
            placeholder="Select your birth date"
            value={formState.birthDate}
            onChangeText={(text) => updateFormState("birthDate", text)}
          />

          <Input
            type="textarea"
            label="Bio"
            placeholder="Tell us about yourself"
            value={formState.bio}
            onChangeText={(text) => updateFormState("bio", text)}
          />

          <Input
            type="selector"
            label="Primary Interest"
            placeholder="Select your primary interest"
            value={formState.selectedOption}
            onChangeText={(value) => updateFormState("selectedOption", value)}
            options={categoryOptions}
          />

          <Input
            type="multiSelector"
            label="Areas of Interest"
            placeholder="Select multiple interests"
            value={formState.selectedOptions}
            onChangeText={(value) => updateFormState("selectedOptions", value)}
            options={categoryOptions}
          />

          <Input
            type="number"
            label="Age"
            placeholder="Enter your age"
            value={formState.number}
            onChangeText={(text) => updateFormState("number", text)}
          />

          <Input
            type="checkbox"
            label="I accept the terms and conditions"
            value={formState.termsAccepted}
            onChange={(checked) => updateFormState("termsAccepted", checked)}
          />

          <View style={{ flexDirection: "column", gap: 16 }}>
            <AppButton
              type="primary"
              title="Submit"
              iconName="check"
              onPress={handleSubmit}
            />

            <AppButton
              type="secondary"
              title="Clear Form"
              iconName="close"
              onPress={clearForm}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
