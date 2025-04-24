import { StyleSheet } from "react-native";

const GlobalStyles = StyleSheet.create({
  input: {
    fontFamily: "Roboto-Regular",
    color: "#374151",
    fontSize: 16,
    marginTop: 2,
    marginBottom: 8,
    borderColor: "#1E3A8A",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  label: {
    fontSize: 12,
  },
  screenContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  h1: {
    fontSize: 36,
    fontFamily: "Montserrat-Bold",
    color: "#1E3A8A",
    marginBottom: 16,
  },
  h2: {
    fontSize: 24,
    fontFamily: "Montserrat-SemiBold",
    color: "#2563EB",
    marginBottom: 8,
  },
  p: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    marginBottom: 2,
  },
});

export const Colors = {
  deepBlue: "#1E3A8A",
  lightBlue: "#2563EB",
  orange: "#F97316",
  lightOrange: "#FF9F45",
  gold: "#CAAB4F",
  grey: "#374151",
};

export const Fonts = {
  regular: "Roboto-Regular",
  bold: "Montserrat-Bold",
  semiBold: "Montserrat-SemiBold",
};

export default GlobalStyles;
