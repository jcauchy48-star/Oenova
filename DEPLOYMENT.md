# Mise en ligne GitHub Pages

## 1. Depot GitHub

Creer un depot GitHub vide, puis pousser ce dossier sur la branche `main`.

Le workflow `.github/workflows/pages.yml` publie automatiquement l'application sur GitHub Pages.

## 2. Variables GitHub pour Supabase

Dans GitHub, aller dans `Settings > Secrets and variables > Actions`, puis ajouter deux secrets ou variables :

- `CAVE_SUPABASE_URL`
- `CAVE_SUPABASE_ANON_KEY`

Le workflow genere `cloud-config.js` pendant le deploiement. Le fichier local `cloud-config.js` reste ignore par Git pour eviter de le mettre dans l'historique du depot.

## 3. Activer GitHub Pages

Dans GitHub, aller dans `Settings > Pages`, puis selectionner `GitHub Actions` comme source.

Apres le prochain push sur `main`, GitHub donne une URL du type :

```text
https://votre-compte.github.io/votre-depot/
```

## 4. Autoriser l'URL dans Supabase

Dans Supabase, aller dans `Authentication > URL Configuration`.

Renseigner :

- `Site URL` : l'URL GitHub Pages
- `Redirect URLs` : l'URL GitHub Pages et l'URL avec wildcard

Exemple :

```text
https://votre-compte.github.io/votre-depot/
https://votre-compte.github.io/votre-depot/*
```

## 5. Verification

Tester en ligne :

- creation de compte
- connexion
- ajout d'une bouteille
- rechargement de la page
- synchronisation Supabase
- installation PWA
