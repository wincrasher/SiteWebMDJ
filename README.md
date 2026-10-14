# 🎯 Le Squat — Site Web de la Maison des jeunes

Prototype responsive pour la Maison des jeunes de Saint-Liguori, dans une palette inspirée du **drapeau acadien** (bleu, blanc, rouge, jaune).

## 🎨 Thème visuel

- **Bleu** (#143a8f) – Couleur principale
- **Rouge** (#d62828) – Appels à l'action
- **Jaune** (#ffd23f) – Accents et détails
- **Blanc** (#ffffff) – Fond et séparateurs

## 📄 Pages disponibles pour tous

✅ Accueil  
✅ Nouvelles & infos  
✅ Programmation & événements  
✅ Équipe du Squat  
✅ Notre histoire (timeline)  
✅ Notre mission  
✅ Heures d'ouverture  
✅ Code de conduite  
✅ Photos & galerie  
✅ Partenaires & commanditaires  
✅ Faire un don  
✅ Contact & coordonnées  

## 🔐 Espace administrateur

Accéder à `admin.html` pour gérer le contenu.

**Identifiants de démo** :
- Utilisateur : `admin`
- Mot de passe : `squat-demo`

### Contenu administrable directement dans l'interface

- 📰 **Nouvelles** – Ajouter, modifier, supprimer des actualités
- 🎯 **Programmation** – Gérer les événements et activités
- 👥 **Équipe** – Fiche des intervenants et coordonnateurs
- 🤝 **Partenaires** – Lister les commanditaires et partenaires
- 📸 **Photos** – Gérer la galerie

## 💾 Fonctionnement du stockage

Les données sont conservées dans `localStorage` (navigateur), ce qui permet :
- ✅ Prototype fonctionnel sans serveur
- ✅ Modifications persistantes pendant la session
- ⚠️ Données locales à l'appareil (à passer en base de données pour la production)

## 🚀 Ouvrir le site

**Localement** :
```bash
# Ouvrir directement
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux

# Ou avec un serveur HTTP (recommandé)
python -m http.server 8000
npx http-server
```

Puis ouvrir `http://localhost:8000` dans le navigateur.

## 📋 Structure du projet

```
SiteWebMDJ/
├── index.html           # Page publique
├── admin.html           # Interface administration
├── app.js               # Logique du site public
├── admin.js             # Logique d'administration
├── styles.css           # Styles (thème + responsive)
├── logoMDJ.jpg          # Logo officiel
├── assets/              # Dossier images
│   ├── mission.jpeg
│   ├── equipe.jpeg
│   ├── activites.jpeg
│   ├── participation.jpeg
│   ├── heures.jpeg
│   ├── histoire.jpeg
│   └── depliant-couverture.jpeg
└── README.md            # Ce fichier
```

## 🔧 Configuration & personnalisation

### Changer les couleurs
Éditer les variables CSS dans `styles.css` :
```css
:root {
  --blue: #143a8f;
  --blue-dark: #0c255f;
  --red: #d62828;
  --yellow: #ffd23f;
  /* ... */
}
```

### Ajouter une section statique
1. Modifier `index.html` – ajouter une `<section>`
2. Ajouter les styles dans `styles.css`
3. Tester le responsive design

### Ajouter une section administrable
1. Ajouter une clé dans le tableau `K` de `admin.js`
2. Définir les champs dans l'objet `D`
3. Accompagner d'une fonction `render[...]()` dans `app.js`

## 📞 Coordonnées

- 📍 21, rue Larivière, Saint-Liguori
- ☎️ 514-809-7728
- 📧 coordo@mdjlesquat.org
- 📘 Facebook : Le Squat de St-Liguori
- 📷 Instagram : @mdjlesquat

## 🚀 Mise en production recommandée

Pour un vrai site accessible à plusieurs administrateurs :

| Aspect | Recommandation |
|--------|------------------|
| **Hébergement** | Vercel / Netlify / Cloudflare Pages |
| **Base de données** | Supabase (PostgreSQL) / Firebase / MongoDB |
| **Authentification** | Supabase Auth / Auth0 / Firebase Auth |
| **Stockage images** | Supabase Storage / Cloudinary / AWS S3 |
| **Dons** | Zeffy / Stripe / lien officiel de l'organisme |
| **Formulaire contact** | Resend / Formspree / serverless function |

### Tableau de bord d'administration suggéré
Pour les pages statiques (mission, histoire, code de conduite), ajouter des éditeurs pour :
- Textes libres (éditeur rich text)
- Images associées
- Date de mise à jour

## ⚠️ Sécurité pour la production

1. **Authentification côté serveur** – Ne pas stocker les identifiants en frontend
2. **Validation serveur** – Vérifier les données avant stockage
3. **HTTPS obligatoire** – Sécuriser le trafic
4. **Rate limiting** – Limiter les requêtes de formulaire
5. **Backup réguliers** – Base de données, images, etc.
6. **RGPD** – Politique de confidentialité et transmission de données

---

**Version** : 1.0 (Prototype fonctionnel)  
**Créé pour** : Maison des jeunes Le Squat, Saint-Liguori (Québec)  
**Dernière mise à jour** : Septembre 2026
