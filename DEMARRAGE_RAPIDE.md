# 🚀 Démarrage rapide – Le Squat

## ⚡ En 30 secondes

1. **Ouvrir le site public** : Double-cliquer sur `index.html`
2. **Accéder à l'admin** : Ouvrir `admin.html`
3. **Se connecter** : admin / squat-demo
4. **Modifier le contenu** : Ajouter une nouvelle, un événement, etc.

## 📝 5 premières étapes

### 1️⃣ Découvrir le site public

Ouvrir `index.html` dans votre navigateur. Vous y trouverez :
- ✅ Page d'accueil animée
- ✅ Toutes les sections du Squat
- ✅ Lien vers l'espace administrateur (bas de page)

### 2️⃣ Accéder à l'interface administrateur

Ouvrir `admin.html`. Vous verrez un formulaire de connexion.

**Identifiants de démo** :
```
Utilisateur : admin
Mot de passe : squat-demo
```

### 3️⃣ Ajouter votre première nouvelle

1. Dans le menu, cliquer sur « 📰 Nouvelles »
2. Cliquer le bouton « + Ajouter »
3. Remplir le formulaire :
   - **Titre** : Ex. « Inscription à l'automne maintenant ouverte »
   - **Date** : Sélectionner la date
   - **Texte** : Votre annonce
4. Cliquer « 💾 Enregistrer »
5. Retourner à `index.html` → La nouvelle apparaît!

### 4️⃣ Ajouter un événement

1. Cliquer « 🎯 Programmation »
2. Cliquer « + Ajouter »
3. Remplir :
   - **Activité** : Ex. « Basketball »
   - **Date/Heure** : Quand
   - **Description** : Détails de l'activité
4. Enregistrer

### 5️⃣ Ajouter un membre de l'équipe

1. Cliquer « 👥 Équipe »
2. Cliquer « + Ajouter »
3. Remplir :
   - **Nom** : Ex. « Marie Dubois »
   - **Rôle** : Ex. « Intervenante »
   - **Photo** : Ex. `assets/marie.jpg` (laisser vide pour une photo par défaut)
   - **Infos** : 3 faits amusants
4. Enregistrer

## 🎯 Cas d'usage courants

### Je veux annoncer un événement

→ Allez dans **Programmation** et cliquez « + Ajouter »

### Un partenaire nous soutient

→ Allez dans **Partenaires** et ajoutez-le

### J'ai des photos à publier

→ Allez dans **Photos**, ajoutez le chemin (`assets/ma-photo.jpg`) et une légende

### Je dois corriger une nouvelle

→ Dans **Nouvelles**, cliquez « ✎ Modifier » sur la nouvelle

### Je veux tout réinitialiser

→ Cliquez le bouton « 🔄 Réinitialiser » en bas du menu (confirmez)

## 🎨 Personnalisation du site

### Changer les couleurs
Éditer `styles.css`, chercher `:root` et modifier :
```css
--blue: #143a8f;
--red: #d62828;
--yellow: #ffd23f;
```

### Changer le logo / brandmark
Éditer le CSS pour `.brandmark` dans `styles.css`

### Ajouter des images

1. Placer l'image dans le dossier `assets/`
2. Dans l'admin, utiliser le chemin `assets/nom-image.jpg`

Formats supportés : JPG, PNG, GIF

### Modifier les infos de contact

Éditer `index.html`, chercher la section `#contact` et modifier les coordonnées

## ❓ FAQ rapide

### Comment puis-je publier en ligne?

Plusieurs options :
- **Vercel** : Gratuit, facile pour les projets statiques
- **GitHub Pages** : Gratuit, via GitHub
- **Netlify** : Gratuit, très simple
- **Hébergement classique** : Via FTP (Hostgator, Bluehost, etc.)

Pour la production, créer un vrai backend (Node.js, Python, etc.)

### Les données disparaissent après fermeture?

Non, elles sont sauvegardées dans le navigateur. Si elles disparaissent, vérifier que la sauvegarde s'est bien faite (message : « 💾 Enregistrer »).

### Puis-je modifier les heures d'ouverture?

Pour le prototype : Éditer directement `index.html`, section `#heures`

Pour l'admin : À ajouter dans une future version (voir TECH.md)

### Comment sécuriser l'accès admin?

Actuellement : Non sécurisé (prototype)

Production : Implémenter une vraie authentification (voir TECH.md, section Authentification)

### Je veux ajouter une section personnalisée

Voir TECH.md, section « Ajouter une nouvelle section administrable »

### Comment sauvegarder les données?

Actuellement : Automatiquement dans le navigateur

Production : À sauvegarder régulièrement via une base de données

## 📲 Optimisation mobile

Le site s'adapte automatiquement aux téléphones. Tester avec :
- Redimensionner le navigateur
- Utiliser F12 → Responsive Design Mode
- Ouvrir sur un vrai téléphone

## 🔐 Avant de publier

- [ ] Changer le mot de passe admin
- [ ] Tester tout le contenu
- [ ] Vérifier les liens (formulaire contact, etc.)
- [ ] Tester sur mobile, tablette, desktop
- [ ] Sauvegarder une copie des données
- [ ] Implémenter une véritable authentification
- [ ] Passer les données à une base de données
- [ ] Mettre en place un système de backup

## 📚 Documentation complète

Autres fichiers disponibles :
- **README.md** – Vue d'ensemble du projet
- **GUIDE_ADMIN.md** – Guide détaillé pour l'admin
- **TECH.md** – Documentation technique pour développeurs
- **CHECKLIST.md** – Checklist de validation

## ✅ Vous êtes prêt!

Le site est complètement fonctionnel. Commencez par :
1. Ajouter vos propres nouvelles et événements
2. Ajouter votre équipe avec des photos
3. Ajouter vos partenaires
4. Ajouter des photos à la galerie
5. Personnaliser le design

---

**Besoin d'aide?**
- Consulter GUIDE_ADMIN.md (guide administrateur complet)
- Consulter TECH.md (guide technique)
- La première section de README.md « Mise en production recommandée »

**Bon courage! 🎉**

---

*Créé pour le Squat, Maison des jeunes de Saint-Liguori*  
*Septembre 2026*
