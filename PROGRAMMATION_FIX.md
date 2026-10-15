# 📅 Programmation - Data Save Fix

## Le Problème 🔴

Les données de "Programmation mensuelle" n'étaient **pas sauvegardées** en base de données.

### Cause racine:
Le backend envoyait des **données stringifiées** à une colonne PostgreSQL de type `JSONB`:

```javascript
// ❌ AVANT (incorrect)
const serialized = JSON.stringify(data);  // Crée une chaîne
await pool.query(
  'INSERT INTO site_data (...) VALUES (...)',
  [`squat_programmation`, serialized]  // Envoie la chaîne au JSONB
);
// PostgreSQL échappe la chaîne: "\"...\"" au lieu de [...] 
// Les données sont perdues ou corrompues
```

**Résultat:**
- Les données de programmation (lien Facebook, image calendrier) n'étaient pas persistantes
- Chaque rechargement de la page perdait les modifications

## La Solution ✅

Envoyer les objets **directement** au driver PostgreSQL, pas leur version stringifiée:

```javascript
// ✅ APRÈS (correct)
// Data is an object/array, NOT stringified
await pool.query(
  'INSERT INTO site_data (...) VALUES (...)',
  [`squat_programmation`, data]  // Envoie l'objet directement
);
// Le driver PostgreSQL remplace les valeurs JSONB correctement
// Les données sont persistantes et récupérables
```

## Ce qui a été corrigé

### 1. **POST /api/:section** (Backend)
```diff
- await pool.query(..., [`squat_${section}`, serialized])  // String
+ await pool.query(..., [`squat_${section}`, data])        // Object
```

### 2. **GET /api/:section** (Backend)
- Ajout de logging pour suivre le type de données reçues
- PostgreSQL retourne les JSONB comme objets JavaScript

### 3. **Frontend (admin.js)**
- Aucun changement nécessaire - le code était déjà correct
- Il envoie les objets JSON via `fetch()` et le driver gère le reste

## ✓ Comment tester le fix

### Test 1: Sauvegarder le lien Facebook
1. Allez à `admin.html` → Connexion
2. Sélectionnez "Programmation mensuelle"
3. Entrez un lien Facebook: `https://www.facebook.com/squatmaisondesjeunes`
4. Cliquez "💾 Enregistrer"
5. Attendez le message "✅ Programmation sauvegardée!"
6. **Rechargez la page** (Ctrl+F5)
7. ✅ Le lien est toujours présent

### Test 2: Uploader une image calendrier
1. Dans le même panneau, cliquez "📤 Uploader"
2. Sélectionnez une image (JPG/PNG, max 2MB)
3. L'image est compressée et sauvegardée
4. Attendez "✅ Programmation sauvegardée!"
5. **Rechargez la page** (Ctrl+F5)
6. ✅ L'image calendrier est toujours affichée

### Test 3: Vérifier la base de données
```bash
# Check database health
curl https://yourdomain.com/api/recovery-check

# Should show "healthy" status
```

## 📊 Données affectées

Toutes les sections utilisent la même logique JSONB:
- ✅ **heroBanner** - Images carrousel
- ✅ **programmation** - Lien Facebook + image calendrier  
- ✅ **team** - Membres de l'équipe
- ✅ **partners** - Partenaires
- ✅ **news** - Nouvelles et actualités
- ✅ **events** - Événements
- ✅ **photoYears** - Photos par année
- ✅ **temoignages** - Témoignages
- ✅ **ourStory** - Notre histoire
- ✅ **ressources** - Ressources
- ✅ **activitesRegulières** - Activités régulières

Tous ces éléments devraient maintenant être **correctement sauvegardés et persistants**.

## 🔍 Détails techniques

### Avant (Problématique)
```
Frontend → JSON object
           ↓
         fetch() POST
           ↓
Backend ← body: '{"facebookLink":"...", "calendarImage":"..."}'
           ↓
       JSON.stringify() → "\"...\"" (doublage d'échappement)
           ↓
PostgreSQL store as string literal, not object
           ↓
GET request returns mangled data
```

### Après (Correct)
```
Frontend → JavaScript object
           ↓
         fetch() POST
           ↓
Backend ← body: {facebookLink: "...", calendarImage: "..."}
           ↓
       Send directly to JSONB column
           ↓
PostgreSQL driver validates & stores as proper JSONB
           ↓
GET request returns clean object
```

## 📝 Commits

- **306c184**: Fix - Send objects directly to PostgreSQL JSONB columns (not stringified)

## ✓ Rollout Status

✅ **Deployed to Vercel** - All changes live  
✅ **Tests passed** - Data persistence working

## 🐛 Si vous trouvez des problèmes

1. Ouvrez la console (F12) et regardez les logs
2. Cherchez des messages d'erreur "❌"
3. Testez `/api/recovery-check` pour la santé DB
4. Contact: Reportez les problèmes avec les détails de la console

---

**Last Updated:** 2026-10-14  
**Status:** ✅ Fixed and Deployed
