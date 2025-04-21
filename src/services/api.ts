const BASE_URL = "http://192.168.1.92:3000/api";

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Erreur backend:", errText);
      throw new Error("Erreur réseau");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Erreur lors du login:", error);
    throw error;
  }
};

export const getMe = async (token: string) => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data;
};
