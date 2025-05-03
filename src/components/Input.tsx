import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Modal,
} from "react-native";
import Checkbox from "expo-checkbox";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "./AppText";
import GlobalStyles from "../styles/styles";

const types = {
  email: "email",
  password: "password",
  text: "text",
  textarea: "textarea",
  selector: "selector",
  multiSelector: "multi-selector",
  date: "date",
  number: "number",
  checkbox: "checkbox",
  phone: "phone",
};

type InputType = keyof typeof types;

type Props = {
  type: InputType;
  label: string;
  placeholder?: string;
  value?: string | string[] | boolean;
  options?: { label: string; value: string }[];
  onChangeText?: (text: string) => void;
  onChange?: (checked: boolean) => void;
  secureTextEntry?: boolean;
};

export default function Input({
  type,
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  onChange,
  options,
}: Props) {
  const InputType = types[type];

  switch (InputType) {
    case "email":
      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            keyboardType="email-address"
            autoCapitalize="none"
            style={GlobalStyles.input}
          />
        </View>
      );
    case "password":
      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            secureTextEntry={true}
            style={GlobalStyles.input}
          />
        </View>
      );
    case "textarea":
      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            multiline
            numberOfLines={4}
            style={GlobalStyles.input}
          />
        </View>
      );
    case "selector":
      const selectorOptions = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ];
      const [modalVisible, setModalVisible] = useState(false);
      const selectedLabel = selectorOptions.find(
        (opt) => opt.value === value
      )?.label;

      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>

          {Platform.OS === "web" ? (
            <>
              <Pressable
                onPress={() => setModalVisible(true)}
                style={[
                  GlobalStyles.input,
                  {
                    justifyContent: "center",
                    height: 40,
                  },
                ]}
              >
                <Text style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}>
                  {selectedLabel || placeholder || "Choisissez une option"}
                </Text>
              </Pressable>

              <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 20,
                      borderRadius: 10,
                      width: 300,
                    }}
                  >
                    {selectorOptions.map((opt) => (
                      <Pressable
                        key={opt.value}
                        onPress={() => {
                          setModalVisible(false);
                          onChangeText?.(opt.value);
                        }}
                        style={{ paddingVertical: 10 }}
                      >
                        <Text
                          style={{ fontFamily: "Roboto-Regular", fontSize: 16 }}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <View style={GlobalStyles.input}>
              <RNPickerSelect
                onValueChange={(value) => onChangeText?.(value as string)}
                items={selectorOptions}
                placeholder={{
                  label: placeholder ?? "Choisissez une option",
                  value: null,
                }}
                value={value}
                style={{
                  inputIOS: {
                    fontFamily: "Roboto-Regular",
                    fontSize: 16,
                    color: "#374151",
                  },
                  inputAndroid: {
                    fontFamily: "Roboto-Regular",
                    fontSize: 16,
                    color: "#374151",
                  },
                  placeholder: {
                    color: "#374151",
                  },
                }}
              />
            </View>
          )}
        </View>
      );
    case "date":
      const [showPicker, setShowPicker] = useState(false);

      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>

          {Platform.OS === "web" ? (
            <input
              placeholder={placeholder}
              onChange={(e) => onChangeText && onChangeText(e.target.value)}
              value={value as string}
              type="date" // web input type
              style={{
                ...GlobalStyles.input,
                padding: "6px 8px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #1E3A8A",
              }}
            />
          ) : (
            <>
              <Pressable onPress={() => setShowPicker(true)}>
                <TextInput
                  placeholder={placeholder}
                  value={value as string}
                  editable={false}
                  style={GlobalStyles.input}
                />
              </Pressable>

              {showPicker && (
                <DateTimePicker
                  mode="date"
                  value={new Date()}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) {
                      const formatted =
                        selectedDate.toLocaleDateString("fr-FR");
                      if (onChangeText) {
                        onChangeText(formatted);
                      }
                    }
                  }}
                />
              )}
            </>
          )}
        </View>
      );
    case "number":
      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            keyboardType="numeric"
            style={GlobalStyles.input}
          />
        </View>
      );
    case "checkbox":
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 8,
            paddingVertical: 8,
          }}
        >
          <Checkbox
            value={value as boolean}
            onValueChange={onChange}
            color={value ? "#4630EB" : undefined}
          />
          <AppText>{label}</AppText>
        </View>
      );
    case "text":
      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            style={GlobalStyles.input}
          />
        </View>
      );
    case "phone":
      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>
          <TextInput
            placeholder={placeholder}
            value={value as string}
            keyboardType="phone-pad"
            style={GlobalStyles.input}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^\d+]/g, "");
              if (cleaned.length <= 15) {
                onChangeText && onChangeText(cleaned);
              }
            }}
          />
        </View>
      );
    case "multi-selector":
      const [multiVisible, setMultiVisible] = useState(false);
      const selectedValues = Array.isArray(value)
        ? value
        : typeof value === "string" && value.length > 0
        ? value.split(",")
        : [];

      const multiOptions = options ?? [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
        { label: "Option 3", value: "option3" },
      ];

      const allValues = multiOptions.map((opt) => opt.value);
      const allSelected = allValues.every((v) => selectedValues.includes(v));

      const toggleAll = () => {
        const newSelected = allSelected ? [] : allValues;
        onChangeText?.(newSelected.join(","));
      };

      return (
        <View>
          <AppText style={GlobalStyles.label}>{label}</AppText>

          <Pressable
            onPress={() => setMultiVisible(true)}
            style={[
              GlobalStyles.input,
              {
                justifyContent: "center",
                height: 40,
              },
            ]}
          >
            <Text style={GlobalStyles.p}>
              {selectedValues.length > 0
                ? multiOptions
                    .filter((opt) => selectedValues.includes(opt.value))
                    .map((opt) => opt.label)
                    .join(", ")
                : placeholder || "Choisissez des options"}
            </Text>
          </Pressable>

          <Modal
            visible={multiVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMultiVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 16,
                  width: 300,
                }}
              >
                <Pressable
                  onPress={toggleAll}
                  style={{
                    marginBottom: 12,
                    alignSelf: "flex-end",
                  }}
                >
                  <Text style={{ color: "#007AFF", fontWeight: "bold" }}>
                    {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  </Text>
                </Pressable>

                {multiOptions.map((opt) => {
                  const checked = selectedValues.includes(opt.value);
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        const newSelected = checked
                          ? selectedValues.filter((v) => v !== opt.value)
                          : [...selectedValues, opt.value];
                        onChangeText?.(newSelected.join(","));
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 8,
                      }}
                    >
                      <Checkbox value={checked} />
                      <Text style={{ marginLeft: 8, fontSize: 16 }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}

                <Pressable
                  onPress={() => setMultiVisible(false)}
                  style={{ marginTop: 16, alignSelf: "center" }}
                >
                  <Text style={GlobalStyles.p}>Fermer</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      );

    default:
      return (
        <View>
          <Text>{label}</Text>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            secureTextEntry={secureTextEntry}
          />
        </View>
      );
  }
}
