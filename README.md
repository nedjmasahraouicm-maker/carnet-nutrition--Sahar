# Carnet de Suivi — Sahar

App web installable (PWA) pour suivi nutrition & bien-être, partagée entre clientes et coach. Backend Supabase (Postgres + Edge Function `api`).

## Architecture sécurisée

```
[ Navigateur ]  --POST signed token-->  [ Edge Function `api` ]  --service_role-->  [ Postgres + RLS verrouillée ]
```

**Aucune table n'est lisible directement** par la clé `anon`. RLS activée, **zéro policy ouverte**. Tout passe par la fonction `api` qui :

- vérifie un **token HMAC-SHA256 signé** (claims `role`+`name`+`exp` 12h),
- hash les **PIN clientes** et le **mot de passe coach** en **PBKDF2-SHA256 (100 000 itérations)** avec sel aléatoire,
- compare en **temps constant** (anti-timing-attack),
- applique du **rate-limiting** (5 essais → 15 min de lockout par IP+identifiant),
- valide chaque entrée (regex prénom Unicode, PIN 4-8 chiffres, date ISO, taille JSON max 8 Mo),
- pose des en-têtes CORS stricts.

Côté hébergeur (`netlify.toml`) : **CSP stricte**, HSTS, X-Frame-Options DENY, Permissions-Policy fermé, COOP same-origin.

### Configuration sensible (à faire avant la mise en ligne définitive)

Dans **Supabase Dashboard → Project Settings → Edge Functions → Secrets**, définir :

| Variable | Description |
|---|---|
| `CARNET_AUTH_SECRET` | Secret HMAC ≥ 32 caractères aléatoires. **Sans ça, les fallback par défaut sont devinables.** |
| `CARNET_INITIAL_COACH_PASSWORD` | Mot de passe coach initial (sinon `sahar-coach-2025`). |

Générer rapidement : `openssl rand -base64 48` ou `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`.

La coach peut **changer son mot de passe** ensuite via le bouton « 🔐 Mot de passe » dans le dashboard.

## Schéma

- `clients(name pk, pin_hash, pin_salt, mood_emoji, last_login_at, created_at)`
- `day_entries(client_name fk, date, data jsonb, updated_at)` — PK composite
- `coach_credentials(id=1 pk, password_hash, password_salt, updated_at)`
- `coach_messages(id uuid, client_name fk, message, created_at, read_at)`
- `auth_attempts(identifier pk, fails, locked_until, updated_at)` — anti-brute-force

## Features

### Cliente
- Connexion par **prénom + PIN à 4-8 chiffres** (chiffré côté serveur)
- Carnet quotidien : repas (heure, description, faim/mastication/plaisir, photo compressée), activité, stress, hydratation (verres cliquables), sommeil, tour de taille, rituel bien-être
- **Humeur du jour** (emoji picker) — visible côté coach
- **Avatar évolutif** (5 stages) avec **streak** et **badges**
- **Récap hebdomadaire** (repas, hydratation moyenne, pas moyens)
- **Citation du jour** rotative
- **Messages de la coach** en bandeau (lu/non lu, archivage)
- **Confettis** sur nouveau streak / sauvegarde réussie
- **PWA installable** (Android & iOS), shell mis en cache, marche partiellement hors ligne
- Sticky save button mobile-friendly, photos prises directement via l'appareil photo

### Coach
- Dashboard avec liste de clientes (avec emoji d'humeur)
- Stats : assiduité, repas suivis, stress moyen, dernier jour rempli
- Graphiques tour de taille + stress sur 14 jours
- Journal détaillé par jour (toutes les saisies + repas avec photos)
- **Envoi de messages** à la cliente
- **Changement de mot de passe** depuis l'interface

## Déploiement Netlify

L'app est un site statique 100% côté client → drag-and-drop sur Netlify, ou :

```bash
netlify deploy --prod
```

Headers de sécurité, CSP, et configuration sw.js sont déjà dans `netlify.toml`.

L'URL est listée à la fin du déploiement. Le service worker s'active à la 2ᵉ visite.

## Lancer en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Le service worker ne s'active qu'en HTTPS ou sur `localhost`.

## Pistes futures

- Notifications push (rappel « tu as oublié ton dîner ») via Supabase Edge + Web Push.
- Export PDF hebdo partageable.
- Supabase Storage pour les photos (au lieu du base64 inline en JSONB).
- Auth multi-coach (1 coach ↔ N clientes via `coach_id`).
