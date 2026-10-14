# 📋 Guide d'utilisation – Espace administrateur

Bienvenue dans l'interface d'administration du **Squat**! Ce guide explique comment utiliser tous les outils disponibles.

## 🔐 Connexion

1. Ouvrir `admin.html`
2. Entrer les identifiants de démo :
   - **Utilisateur** : `admin`
   - **Mot de passe** : `squat-demo`
3. Cliquer « Se connecter »

> ℹ️ Pour la sécurité, changer le mot de passe et utiliser une véritable authentification en production.

## 📰 Gérer les Nouvelles

### Ajouter une nouvelle
1. Cliquer sur « Nouvelles » dans le menu
2. Cliquer sur le bouton « + Ajouter »
3. Remplir le formulaire :
   - **Titre** : ex. « Soirée cinéma ce vendredi »
   - **Date** : sélectionner la date
   - **Texte** : description ou annonce
4. Cliquer « 💾 Enregistrer »

### Modifier une nouvelle
1. Trouver la nouvelle dans la liste
2. Cliquer sur « ✎ Modifier »
3. Modifier les informations
4. Cliquer « 💾 Enregistrer »

### Supprimer une nouvelle
1. Cliquer « 🗑 Supprimer »
2. Confirmer la suppression

## 🎯 Gérer la Programmation

### Ajouter un événement
1. Cliquer sur « Programmation » dans le menu
2. Cliquer « + Ajouter »
3. Remplir le formulaire :
   - **Activité** : ex. « Basketball »
   - **Date** : date de l'événement
   - **Heure** : ex. « 17 h à 21 h »
   - **Description** : détails de l'activité
4. Enregistrer

### Exemple d'événement bien rempli
| Champ | Exemple |
|-------|---------|
| Activité | Soirée jeux & arcade |
| Date | 2026-09-18 |
| Heure | 17 h à 21 h |
| Description | Venez défier vos ami(e)s aux jeux vidéo, jeux de société et arcade! Gratuit, inscription sur place. |

## 👥 Gérer l'Équipe

### Ajouter un intervenant
1. Cliquer sur « Équipe »
2. Cliquer « + Ajouter »
3. Remplir :
   - **Nom** : prénom et nom
   - **Rôle** : ex. « Coordonnateur », « Intervenante »
   - **URL/chemin photo** : ex. `assets/jeremy.jpg`
   - **Infos** : Chaque ligne = un fait amusant sur la personne
4. Enregistrer

### Exemples de faits amusants
- Sa couleur préférée est le rose
- Elle joue du saxophone
- Il aime jouer aux jeux vidéo
- Elle fait de la randonnée

### Ajouter une photo de profil
1. Placer l'image dans le dossier `assets/` (ex. `assets/jeremy.jpg`)
2. Dans la fiche équipe, mettre le chemin : `assets/jeremy.jpg`
3. L'image s'affichera sur le site

## 🤝 Gérer les Partenaires

### Ajouter un partenaire ou commanditaire
1. Cliquer sur « Partenaires »
2. Cliquer « + Ajouter »
3. Remplir :
   - **Nom** : Nom complet de l'organisation
   - **Type** : Choisir entre « Partenaire » ou « Commanditaire »
4. Enregistrer

### Différence entre Partenaire et Commanditaire
- **Partenaire** : Soutien logistique, services, collaboration
- **Commanditaire** : Soutien financier

## 📸 Gérer la Galerie de Photos

### Ajouter une photo
1. Cliquer sur « Photos »
2. Cliquer « + Ajouter »
3. Remplir :
   - **URL/chemin image** : ex. `assets/activites.jpeg`
   - **Légende** : Description de la photo
4. Enregistrer

### Ajouter des images au site
1. Télécharger l'image (JPG, PNG)
2. La placer dans le dossier `assets/`
3. Dans l'interface admin, mettre le chemin : `assets/nom-du-fichier.jpg`

### Noms de fichiers recommandés
- `assets/equipe.jpeg`
- `assets/mission.jpeg`
- `assets/activites.jpeg`
- `assets/participation.jpeg`
- `assets/jeunes-jeux.jpeg`
- `assets/atelier-creativo.jpeg`

## 💾 Sauvegarder & Réinitialiser

### Les données sont sauvegardées automatiquement
Chaque fois que vous cliquez « 💾 Enregistrer », les données sont stockées localement (dans votre navigateur).

### Réinitialiser toutes les données
1. Cliquer le bouton « 🔄 Réinitialiser » en bas du menu
2. Cliquer « OK » pour confirmer
3. **⚠️ Action irréversible !** Toutes les modifications seront perdues

## 🚪 Déconnexion

Cliquer sur « 🚪 Déconnexion » en bas du menu pour quitter l'interface d'administration.

## ⚡ Raccourcis utiles

| Action | Comment |
|--------|---------|
| Ajouter | Cliquer « + Ajouter » dans chaque section |
| Modifier | Trouver l'élément, cliquer « ✎ Modifier » |
| Supprimer | Cliquer « 🗑 Supprimer » et confirmer |
| Voir le site | Cliquer « 👁 Voir le site » dans le menu |

## 🐛 Résolution de problèmes

### Les données disparaissent après fermeture du navigateur
C'est normal pour le prototype. En production, les données seront stockées sur un serveur.

### Les images ne s'affichent pas
Vérifier que :
1. Le fichier image est dans le dossier `assets/`
2. Le chemin est écrit correctement (ex. `assets/photo.jpg`)
3. Le format est supporté (JPG, PNG, GIF)

### Je ne me souviens plus du mot de passe
Pour le prototype : `admin` / `squat-demo`

### Impossible de supprimer un élément
Vérifier que vous avez cliqué « OK » dans la confirmation.

## ✅ Bonnes pratiques

1. **Relire avant de publier** – Les erreurs s'affichent immédiatement sur le site
2. **Utiliser des titres clairs** – Pour les recherches et clarity
3. **Dater les nouvelles** – Les plus récentes s'affichent en premier
4. **Ajouter des descriptions** – Elles aident les jeunes à comprendre les activités
5. **Vérifier les liens** – Tester les liens avant de publier
6. **Sauvegarder régulièrement** – Bien que l'enregistrement soit automatique

## 📞 Support

Pour toute question ou besoin d'aide :
- **Téléphone** : 514-809-7728
- **Courriel** : coordo@mdjlesquat.org

---

**Dernière mise à jour** : Septembre 2026
