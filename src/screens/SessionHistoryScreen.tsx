import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import GlobalStyles from "../styles/styles";
import { useEffect, useState } from "react";
import { Session as SessionModel } from "../models/session";
import { useAuth } from "../hooks/useAuth";
import { SessionService } from "../services/api/session-service";
import Session from "../components/Session";

type SessionDetailRouteProp = RouteProp<RootStackParamList, "SessionHistory">;

export default function SessionHistoryScreen() {
  const [allInactivesSportsmanSessions, setAllInactivesSporstmanSessions] =
    useState<SessionModel[]>([]);

  const [fileImageUrl, setFileImageUrl] = useState("");

  const { user, token } = useAuth();

  async function fetchSportsmanSessions() {
    if (!user || !token) return;
    try {
      const linkedSessions = await SessionService.getSessionsByUser(
        user.id,
        token
      );
      linkedSessions.map(async (ls) => {
        const completeSessions = await SessionService.getSessionById(
          ls.sessionId,
          token
        );
        if (completeSessions.publicImageUrl) {
          setFileImageUrl(completeSessions.publicImageUrl);
        }
        if (!completeSessions.isActive) {
          setAllInactivesSporstmanSessions((prev) => [
            ...prev,
            completeSessions,
          ]);
        }
      });
    } catch (e) {
      console.log("Error while fetching sportsman sessions", e);
    }
  }

  useEffect(() => {
    fetchSportsmanSessions();
  }, [token, user]);

  const renderAllSessions = () => {
    return allInactivesSportsmanSessions.map((session) => {
      return (
        <Session
          key={session.id}
          title={session.label}
          imageUrl={session.publicImageUrl || ""}
          hideIcon
        />
      );
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
      style={GlobalStyles.pageStyle}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "column", gap: 16 }}>
          {renderAllSessions()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
