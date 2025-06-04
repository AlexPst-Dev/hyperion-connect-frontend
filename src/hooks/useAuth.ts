import { useContext } from "react";
import { AuthContextType } from "../models/auth";
import { AuthContext } from "../context/AuthContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
