# Carnet de Suivi — Sahar

App web (single-file HTML) pour le suivi nutrition & bien-être, partagée entre clientes et coach. Stockage Supabase (Postgres).

## Lancer en local

C'est un fichier statique : ouvre simplement `index.html` dans un navigateur, ou sers le dossier.

```bash
# Option 1 : Python
python3 -m http.server 8000
# Option 2 : Node
npx serve .
```

Puis va sur http://localhost:8000

## Configuration

Tout est dans le `<script>` en haut de `index.html` :

- `SUPABASE_URL` — URL du projet Supabase
- `SUPABASE_ANON_KEY` — clé anon (publishable). Pas secrète.
- `COACH_CODE` — code que la coach saisit côté "Je suis coach". **À changer avant publication.**

## Base de données

Projet Supabase : `Carnet de suivi Sahar` (`rjfqxdmyrjwviijicnlu`, région eu-west-3).

Schéma (migration `init_carnet_schema`) :

- `clients(name pk, created_at)`
- `day_entries(client_name fk, date, data jsonb, updated_at)` — clé composite `(client_name, date)`

RLS activée, policies ouvertes pour `anon` (lecture/écriture). Toute la sécurité passe par le `COACH_CODE` côté UI et le fait que les clientes ne se "voient" pas entre elles dans l'UI. Pour une vraie séparation (utilisable par plusieurs coachs), passer à Supabase Auth.

## Déploiement

Site 100% statique → choix simples :

### Netlify
1. `netlify deploy --prod` (ou drag&drop du dossier sur netlify.com)
2. Le fichier `netlify.toml` est prêt.

### Vercel
1. `vercel --prod`
2. Le fichier `vercel.json` est prêt.

### GitHub Pages
1. Push sur la branche `main`.
2. Repo Settings → Pages → Source = "Deploy from a branch" / `main` / `/`.

### Cloudflare Pages
1. Connecter le repo, build command : *(vide)*, output : `/`.

## Audit / état actuel

Fait :
- Storage Supabase (avant : `window.storage`, qui n'existe pas hors prototype).
- Sessions persistées (`sessionStorage`) → on ne se reconnecte pas à chaque rechargement.
- Compression JPEG des photos de repas (max 1280px, qualité 0.78) — évite que le JSONB n'explose.
- Mobile-friendly : viewport `viewport-fit=cover`, safe-area inset, font-size ≥ 16px (pas de zoom auto iOS), boutons ≥ 44px, sliders à thumb 26px, breakpoints 520/600/760/420.
- Code coach minimal (`COACH_CODE`).
- Bouton "Enregistrer" sticky en bas (mobile UX).
- Loaders, toasts d'erreur, états vides.
- Échappement HTML correct (XSS).

À envisager ensuite :
- **Auth Supabase** (magic link) pour la coach, et un vrai mapping `coach ↔ clientes`.
- **Supabase Storage** pour les photos de repas (au lieu du base64 inline) — meilleure perf, photos plus nettes.
- Export PDF / partage hebdo.
- PWA (manifest + service worker) pour usage offline + ajout à l'écran d'accueil.
