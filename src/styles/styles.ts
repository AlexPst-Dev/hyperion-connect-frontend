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
    marginBottom: 16,
  },
  h2: {
    fontSize: 24,
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 8,
  },
  p: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    marginBottom: 2,
  },
  containerShadow: {
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: "#374151",
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ccc",
  },

  // Boutons types
  button_primary: { backgroundColor: "#2563EB" },
  button_secondary: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_add: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  button_changeState: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#1E3A8A",
  },
  button_linkSmall: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  button_linkNormal: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  // Texts types
  text_primary: {},
  text_secondary: {},
  text_add: {},
  text_changeState: {
    color: "#1E3A8A",
  },
  text_linkSmall: {
    fontSize: 12,
    color: "#2563EB",
  },
  text_linkNormal: {
    fontSize: 16,
    color: "#2563EB",
  },

  buttonText: {
    color: "white",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    marginRight: 8,
  },

  labelBase: {
    fontFamily: "Roboto-Regular",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  label_blue: {
    backgroundColor: "#D6EBFF",
    color: "#1E3A8A",
  },
  label_orange: {
    backgroundColor: "#FFF9F4",
    color: "#F97316",
  },
  label_green: {
    backgroundColor: "#DEFFD6",
    color: "#1F7722",
  },
  labelTextBase: {
    fontSize: 16,
  },
  label_text_small: {
    fontSize: 12,
  },
  label_text_normal: {
    fontSize: 16,
  },
  label_text_large: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export const Colors = {
  deepBlue: "#1E3A8A",
  lightBlue: "#2563EB",
  orange: "#F97316",
  lightOrange: "#FF9F45",
  gold: "#CAAB4F",
  grey: "#374151",
  green: "#1F7722",
  shadow: "#CBCBCB",
  lightRed: "#C61010",
};

export const Fonts = {
  regular: "Roboto-Regular",
  bold: "Montserrat-Bold",
  semiBold: "Montserrat-SemiBold",
};

export default GlobalStyles;
