import React, { useState } from "react";
import Icon from "./Icon";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import Checkbox from "expo-checkbox";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";

const types = {
  email: "email",
  password: "password",
  text: "text",
  textarea: "textarea",
  selector: "selector",
  date: "date",
  number: "number",
  checkbox: "checkbox",
};

type InputType = keyof typeof types;

type Props = {
  type: InputType;
  label: string;
  placeholder?: string;
  value?: string | boolean;
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
}: Props) {
  const InputType = types[type];

  switch (InputType) {
    case "email":
      return (
        <View>
          <Text>{label}</Text>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      );
    case "password":
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
    case "textarea":
      return (
        <View>
          <Text>{label}</Text>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            multiline
            numberOfLines={4}
          />
        </View>
      );
    case "selector":
      return (
        <View>
          <Text>{label}</Text>
          <RNPickerSelect
            onValueChange={(value) =>
              onChangeText && onChangeText(value as string)
            }
            items={[
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]}
            placeholder={{
              label: placeholder ?? "Choisissez une option",
            }}
            value={value}
            style={{
              inputIOS: {
                padding: 12,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
              },
              inputAndroid: {
                padding: 12,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
              },
            }}
          />
        </View>
      );
    case "date":
      const [showPicker, setShowPicker] = useState(false);

      const showDatePicker = () => setShowPicker(true);
      const hideDatePicker = () => setShowPicker(false);
      return (
        <View>
          <Text>{label}</Text>
          <Pressable onPress={showDatePicker}>
            <TextInput
              placeholder={placeholder}
              value={value as string}
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={typeof value === "string" ? new Date(value) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                hideDatePicker();
                if (selectedDate) {
                  const formatted = selectedDate.toLocaleDateString("fr-FR");
                  if (onChangeText) {
                    onChangeText(formatted);
                  }
                }
              }}
            />
          )}
        </View>
      );
    case "number":
      return (
        <View>
          <Text>{label}</Text>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
            keyboardType="numeric"
          />
        </View>
      );
    case "checkbox":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Checkbox
            value={value as boolean}
            onValueChange={onChange}
            color={value ? "#4630EB" : undefined}
          />
          <Text>{label}</Text>
        </View>
      );
    case "text":
      return (
        <View>
          <Text>{label}</Text>
          <TextInput
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value as string}
          />
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
