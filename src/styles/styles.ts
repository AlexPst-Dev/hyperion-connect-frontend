import { Platform, StyleSheet } from "react-native";

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
  red: "#771F1F",
};

export const Fonts = {
  regular: "Roboto-Regular",
  bold: "Montserrat-Bold",
  semiBold: "Montserrat-SemiBold",
};

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
  span: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
  },
  screenContainer: {},
  pageStyle: {
    backgroundColor: "white",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "web" ? 92 : 128,
  },
  h1: {
    fontSize: 36,
    fontFamily: "Montserrat-Bold",
  },
  h2: {
    fontSize: 24,
    fontFamily: "Montserrat-SemiBold",
  },
  h3: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  p: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
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

  notificationBase: {
    fontFamily: "Roboto-Regular",
    padding: 8,
    borderRadius: 8,
  },
  notification_information: {
    color: Colors.deepBlue,
  },
  notification_error: {
    color: Colors.red,
  },
  notification_success: {},

  //Tab bar
  tabBarStyle: {
    position: "absolute",
    marginRight: 8,
    marginLeft: 8,
    bottom: Platform.OS === "web" ? 24 : 48,
    left: 8,
    right: 8,
    height: 64,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  tabBarIcon: {
    flexDirection: "column",
    gap: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Platform.OS === "web" ? 4 : 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: Platform.OS === "web" ? 0 : 72,
    marginTop: Platform.OS === "web" ? 0 : 20,
  },
});

export const shadowStyles = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1, // For Android
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4, // For Android
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // For Android
  },
};

export default GlobalStyles;
