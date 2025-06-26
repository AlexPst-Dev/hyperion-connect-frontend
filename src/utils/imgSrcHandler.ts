export function getImageSource(source?: string): any {
  if (!source) {
    // fallback
    return require("../assets/images/react-logo.png");
  }

  if (source.startsWith("http") || source.startsWith("https")) {
    try {
      return { uri: source };
    } catch {
      return require("../assets/images/react-logo.png");
    }
  }

  // Mapping of konwn local images
  const localImages: Record<string, any> = {
    "/uploads/users/img-profile-1": require("../assets/images/users/profilePicture/img-profil-1.png"),
    "white-logo": require("../assets/images/logo-white.png"),
  };

  return localImages[source] || require("../assets/images/react-logo.png");
}
