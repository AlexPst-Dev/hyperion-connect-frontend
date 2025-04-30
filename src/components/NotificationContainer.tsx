import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import AppNotifications from "./AppNotifications";
import { LinearGradient } from "expo-linear-gradient";

type NotificationType = "information" | "error" | "success";

interface NotificationProps {
  title: string;
  type: NotificationType;
  duration?: number; // ms
}

let showNotification: (props: NotificationProps) => void;

export function NotificationPortal() {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<NotificationProps>({
    title: "",
    type: "information",
  });
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    showNotification = ({ title, type, duration = 5000 }) => {
      setNotification({ title, type, duration });
      setVisible(true);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        closeNotification();
      }, duration);
    };
  }, []);

  const closeNotification = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.0)"]}
        style={styles.gradientBackground}
        pointerEvents="none"
      />
      <Pressable onPress={closeNotification}>
        <AppNotifications title={notification.title} type={notification.type} />
      </Pressable>
    </Animated.View>
  );
}

// Global function to trigger the notif
export const notify = (props: NotificationProps) => {
  if (showNotification) showNotification(props);
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 41,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1000,
    overflow: "visible",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: -1,
  },
});
