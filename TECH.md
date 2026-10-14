# 🛠️ Documentation technique – Le Squat

Guide pour les développeurs souhaitant étendre ou maintenir le site.

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) → localStorage → Données JSON
                     ↓
          Rendu dynamique avec templates
```

### Flux de données

1. **App.js** charge les données (localStorage ou defaults)
2. **Fonctions render*** générèrent le HTML côté client
3. **Admin.js** permet de modifier les données
4. **Styles.css** applique le design

## 📁 Structure des fichiers

### index.html
- Structure HTML sémantique
- Sections statiques et conteneurs dynamiques
- Formulaire de contact

### admin.html
- Interface d'administration
- Modal pour l'édition
- Table de gestion du contenu

### app.js
- **Objet `defaults`** : Données par défaut
- **Fonctions `render[type]()`** : Génèrent le HTML dynamique
- **Fonctions utilitaires** : `getData()`, `esc()`, `handleContactForm()`

### admin.js
- **Objet `D`** : Configuration des champs éditables
- **Fonction `showLogin()`** : Interface de connexion
- **Fonction `openEditor()`** : Modal d'édition
- **Fonction `renderPanel()`** : Affiche la liste d'éléments

### styles.css
- Variables CSS personnalisables (couleurs, ombres, rayons)
- Classes utilitaires (.btn, .card, .grid)
- Styles responsifs

## 🔄 Cycle d'édition

```
Administrateur → admin.html
     ↓
   Login
     ↓
  renderPanel() → Affiche la liste
     ↓
  openEditor() → Modal de modification
     ↓
  FormSubmit → save() → localStorage
     ↓
  closeModal() → renderPanel()
     ↓
  Utilisateur accède à index.html
     ↓
  getData() → localStorage
     ↓
  render*() → HTML affiché
```

## 📊 Objet de données

### Nouvelle
```javascript
{
  id: timestamp,           // Unique identifier
  title: "string",         // Titre
  date: "YYYY-MM-DD",     // Format ISO
  text: "string"           // Description
}
```

### Événement
```javascript
{
  id: timestamp,
  title: "string",
  date: "YYYY-MM-DD",
  time: "HH h à HH h",
  desc: "string"
}
```

### Intervenant
```javascript
{
  id: timestamp,
  name: "string",
  role: "string",
  photo: "assets/photo.jpg",
  facts: ["string", "string", ...]
}
```

### Partenaire
```javascript
{
  id: timestamp,
  name: "string",
  type: "Partenaire" | "Commanditaire"
}
```

### Photo
```javascript
{
  id: timestamp,
  src: "assets/photo.jpg",
  caption: "string"
}
```

## 🎨 Système de couleurs

### Variables CSS
```css
--blue:       #143a8f      /* Primaire */
--blue-dark:  #0c255f      /* Foncé, en-tête */
--red:        #d62828      /* Accent, CTA */
--yellow:     #ffd23f      /* Détails, mise en évidence */
--white:      #ffffff      /* Fond */
--ink:        #13213a      /* Texte primaire */
--muted:      #657089      /* Texte secondaire */
--surface:    #f6f8fc      /* Fond alternatif */
--border:     #dce2ee      /* Bordures */
--shadow:     0 16px 40px rgba(16,42,96,0.12)
```

## 🔐 Authentification

### État actuel (prototype)
- Vérification côté client (non sécurisé)
- Identifiants en dur : `admin` / `squat-demo`
- Session stockée dans `sessionStorage`

### Pour la production
```javascript
// Implémenter un vrai système
1. Utiliser HTTPS
2. Envoyer identifiants au serveur
3. Retourner un JWT ou une session
4. Valider TOKEN côté serveur pour chaque action
5. Ajouter rate limiting et CAPTCHA
```

## 💾 localStorage vs Production

### localStorage (Actuel)
```javascript
// Stocker
localStorage.setItem('squat_news', JSON.stringify(data));

// Récupérer
const data = JSON.parse(localStorage.getItem('squat_news'));
```

### Production (Recommandé)
```javascript
// Utiliser une API
async function getNews() {
  const res = await fetch('/api/news');
  return res.json();
}

async function saveNews(data) {
  const res = await fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
```

## 🖼️ Gestion des images

### Chemin actuel
```javascript
// Simple chemin relatif
src="assets/photo.jpeg"
```

### Production
```javascript
// URL CDN ou storage en ligne
src="https://cdnurl.com/squat-photos/mission.jpg"
```

### Upload de fichiers
```javascript
// Ajouter un <input type="file">
const form = new FormData();
form.append('image', fileInput.files[0]);
await fetch('/api/upload', {
  method: 'POST',
  body: form
});
```

## 🧪 Ajouter une nouvelle section administrable

### 1. Mettre à jour app.js

```javascript
const defaults = {
  // ... autres sections
  testimonials: [  // Nouvelle section
    {id: 1, name: "Alice", text: "Super endroit!"}
  ]
};

function renderTestimonials() {
  const el = document.querySelector('#testimonials-grid');
  if (!el) return;
  el.innerHTML = getData('testimonials')
    .map(t => `<div>${esc(t.text)} - ${esc(t.name)}</div>`)
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderNews();
  renderTestimonials();  // Ajouter ici
  // ...
});
```

### 2. Mettre à jour admin.js

```javascript
const K = ['news', 'events', 'team', 'partners', 'photos', 'testimonials'];

const D = {
  testimonials: {
    label: 'Témoignages',
    fields: [
      ['name', 'Nom', 'text'],
      ['text', 'Témoignage', 'textarea']
    ]
  },
  // ... autres
};
```

### 3. Ajouter le HTML dans index.html

```html
<section id="testimonials">
  <div class="container">
    <div class="section-heading">
      <h2>Ce qu'en disent les jeunes</h2>
    </div>
    <div id="testimonials-grid" class="grid grid-3"></div>
  </div>
</section>
```

### 4. Ajouter le bouton dans admin.html

```html
<button data-k="testimonials">💬 Témoignages</button>
```

## 🚀 Déploiement

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
netlify deploy
```

### GitHub Pages
```bash
# Pousser les fichiers sur une branche 'main'
# Activer Pages dans les settings du repo
```

## 🔧 Maintenance

### Mise à jour des dépendances
Le site n'a pas de dépendances externes, donc maintenance minimale.

### Sauvegarde des données
Pour passer en production :
1. Exporter les données du localStorage
2. Les importer dans la base de données
3. Mettre à jour le code pour utiliser l'API

### Monitoring
Ajouter un service de monitoring (Sentry, LogRocket, etc.)

## 📈 Améliorations futures

1. **Page d'édition des heures d'ouverture** (statique → admin)
2. **Page d'édition du code de conduite** (statique → admin)
3. **Analytics** (Google Analytics, Plausible)
4. **Multi-language** (Français/Anglais/...)</span>
5. **Commentaires modérés** sur les nouvelles
6. **Newsletter** abonnement
7. **Calendrier** intégré pour les événements
8. **QR Code** pour les activités
9. **Chatbot** pour FAQ
10. **Notifications** push pour nouvelles activités

## 🐛 Debugging

### Outils navigateur
```javascript
// Console
localStorage.getItem('squat_news')
getData('news')

// Réseau
// Vérifier les requêtes XHR/Fetch
```

### localStorage plein?
Firefox, Chrome, Safari limitent à 5-10MB par domaine.

Solution : Passer à une véritable base de données.

## 📝 Conventions de code

### Noms de variables
- `getData()` – Récupérer
- `renderX()` – Rendre HTML
- `esq()` – Échapper HTML (sécurité)

### Commentaires
```javascript
// Commentaire simple
const data = load(k);  // Récupérer une clé

/* Commentaire multi-ligne
   Explication détaillée
*/
```

---

**Version** : 1.0  
**Auteur** : GitHub Copilot  
**Dernière mise à jour** : Septembre 2026
