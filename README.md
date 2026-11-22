# SportLink — application

Application web et mobile de SportLink, une plateforme de suivi sportif qui réunit sportifs, coachs, médecins du sport et entreprises partenaires.

L'API, la base de données et le `docker-compose.yml` qui lance l'ensemble sont dans [hyperion-connect-backend](https://github.com/AlexPst-Dev/hyperion-connect-backend). Son README décrit aussi les rôles et le mode démo.

## Histoire du projet

Le projet a été développé en freelance pour une start-up, sous le nom « Hyperion Connect ». L'application a été livrée, mais la société a fermé avant le lancement public.

Le code est publié ici sous le nom SportLink, avec une démo et des données entièrement fictives.

## Stack

- Expo SDK 53, React Native et TypeScript : une seule base de code pour iOS, Android et le web.
- React Navigation : une barre d'onglets différente pour chaque rôle.
- NativeWind (Tailwind) et une feuille de styles partagée.
- Graphiques de progression, QR codes de vérification, envoi de fichiers.
- Bun pour les dépendances. Version web servie par nginx dans Docker.

## Lancer le projet

```bash
bun install
EXPO_PUBLIC_API_URL=http://localhost:3000/api bunx expo start
```

Ensuite, appuyez sur `w` pour le web, ou scannez le QR code avec Expo Go.

Sans `EXPO_PUBLIC_API_URL`, l'application vise `http://localhost:3000/api` en développement.

### Image Docker (web)

```bash
docker build -t sportlink-web .
docker run -p 8080:80 -e EXPO_PUBLIC_API_URL=https://api.example.com/api sportlink-web
```

L'adresse de l'API est injectée au démarrage du conteneur. La même image sert donc dans tous les environnements.

## Démo

Quand l'API tourne en mode démo, l'écran de connexion affiche un bouton par rôle : on entre sans créer de compte. Les données sont fictives et remises à zéro chaque nuit.

## Organisation du code

```
src/
  screens/      écrans, regroupés par parcours
  components/   composants partagés (boutons, cartes, formulaires, graphiques)
  navigation/   onglets par rôle et piles de navigation
  services/     appels à l'API
  context/      authentification
  hooks/
  constants/    nom de l'application et libellés
  styles/
```

## Ce que je referais aujourd'hui

- **Écrans plus petits.** Certains écrans dépassent les 3 000 lignes, comme le détail d'un sportif vu par son coach. Je les découperais en composants et en hooks par fonctionnalité.
- **Gestion des données.** Les appels à l'API sont faits à la main dans chaque écran. TanStack Query apporterait le cache, les rechargements et des états de chargement cohérents.
- **Navigation.** Certains paramètres d'écran sont des objets, ce qui casse le rechargement d'une page sur le web. Je passerais des identifiants.
- **Tests.** Ajouter des tests de composants et des parcours end-to-end par rôle.
